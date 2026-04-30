import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { payPlusService } from "../utils/payPlusService";
import { useLanguage } from "../contexts/LanguageContext";
import { useToast } from "../context/ToastContext";
import "../styles/pages/Checkout.css";

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const { cartItems, total } = location.state || { cartItems: [], total: 0 };
  const { showError } = useToast();

  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discountPercent }
  const [paymentLoading, setPaymentLoading] = useState(false);

  const discountedTotal = appliedCoupon
    ? Math.round(total * (1 - appliedCoupon.discountPercent / 100))
    : total;

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
  });

  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      navigate("/cart");
    }

    // Load saved shipping details for logged-in users
    const token = localStorage.getItem("token");
    if (token) {
      const savedDetails = localStorage.getItem("shippingDetails");
      if (savedDetails) {
        try {
          const details = JSON.parse(savedDetails);
          setFormData((prev) => ({
            ...prev,
            fullname: details.fullname || details.fullName || "",
            email: details.email || "",
            phone: details.phone || "",
            address: details.address || "",
            city: details.city || "",
            zipCode: details.zipCode || "",
          }));
        } catch (error) {
          console.error("Failed to load shipping details:", error);
        }
      }
    }
  }, [cartItems, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/coupons/validate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: couponCode.trim().toUpperCase() }),
        },
      );
      const data = await response.json();
      if (data.success) {
        setAppliedCoupon({
          code: couponCode.trim().toUpperCase(),
          discountPercent: data.discountPercent,
        });
      } else {
        showError(
          data.message ||
            (language === "he" ? "קוד קופון לא תקין" : "Invalid coupon code"),
        );
        setAppliedCoupon(null);
      }
    } catch {
      showError(language === "he" ? "שגיאה בחיבור לשרת" : "Connection error");
    } finally {
      setCouponLoading(false);
    }
  };

  const getFieldLabel = (field) => {
    const labels = {
      fullname: "שם מלא",
      email: "אימייל",
      phone: "טלפון",
      address: "כתובת",
      city: "עיר",
      zipCode: "מיקוד",
    };
    return labels[field] || field;
  };

  const validateForm = () => {
    const requiredFields = [
      "fullname",
      "email",
      "phone",
      "address",
      "city",
      "zipCode",
    ];

    for (let field of requiredFields) {
      if (!formData[field]) {
        showError(`אנא מלא את השדה: ${getFieldLabel(field)}`);
        return false;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showError("אנא הכנס כתובת אימייל תקינה");
      return false;
    }

    const phoneRegex = /^05\d{8}$/;
    if (!phoneRegex.test(formData.phone.replace(/[-\s]/g, ""))) {
      showError("אנא הכנס מספר טלפון תקין (05XXXXXXXX)");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const shippingPrice = cartItems.length > 0 ? 30 : 0;
    const itemsPrice = total - shippingPrice;

    const pendingOrder = {
      customerName: formData.fullname,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      items: cartItems.map((item) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
        selectedOptions: item.selectedOptions || {},
      })),
      shippingAddress: {
        fullName: formData.fullname,
        address: formData.address,
        city: formData.city,
        zipCode: formData.zipCode,
      },
      itemsPrice,
      shippingPrice,
      totalPrice: discountedTotal,
      couponCode: appliedCoupon?.code || null,
      discountPercent: appliedCoupon?.discountPercent || 0,
    };

    localStorage.setItem("pendingOrder", JSON.stringify(pendingOrder));
    localStorage.setItem(
      "shippingDetails",
      JSON.stringify({
        fullName: formData.fullname,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        zipCode: formData.zipCode,
      }),
    );

    setPaymentLoading(true);
    try {
      const result = await payPlusService.createPayment({
        amount: discountedTotal,
        customerName: formData.fullname,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        items: pendingOrder.items,
        shippingAddress: pendingOrder.shippingAddress,
      });

      if (!result.success || !result.payment_page_link) {
        throw new Error(
          result.message ||
            result.error ||
            (language === "he"
              ? "שגיאה ביצירת דף תשלום"
              : "Failed to create payment page"),
        );
      }

      window.location.href = result.payment_page_link;
    } catch (err) {
      console.error("Checkout error:", err.message, err.response?.data ?? "");
      showError(
        err.message ||
          (language === "he" ? "שגיאה בחיבור לשרת" : "Connection error"),
      );
      setPaymentLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1>{language === "he" ? "השלמת הזמנה" : "Complete Order"}</h1>

        {!localStorage.getItem("token") && (
          <div className="guest-checkout-notice">
            <p>
              💡{" "}
              <strong>
                {language === "he" ? "הזמנה כאורח:" : "Guest Checkout:"}
              </strong>{" "}
              {language === "he"
                ? "אתה יכול להשלים את ההזמנה ללא הרשמה. פרטי ההזמנה יישלחו לאימייל שתזין."
                : "You can complete your order without registration. Order details will be sent to the email you provide."}
            </p>
            <p className="login-option">
              {language === "he" ? "יש לך חשבון?" : "Have an account?"}{" "}
              <button
                className="link-btn"
                onClick={() =>
                  navigate("/login", {
                    state: { returnTo: "/checkout", cartItems, total },
                  })
                }
              >
                {language === "he" ? "התחבר כאן" : "Login here"}
              </button>
            </p>
          </div>
        )}

        <div className="checkout-content">
          <div className="order-summary-section">
            <h2>{language === "he" ? "סיכום הזמנה" : "Order Summary"}</h2>
            <div className="order-items">
              {cartItems.map((item) => (
                <div key={item.id} className="order-item">
                  <img
                    src={
                      Array.isArray(item.images)
                        ? item.images[0]
                        : item.image ||
                          "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=100&h=100&fit=crop"
                    }
                    alt={item.name}
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=100&h=100&fit=crop";
                    }}
                  />
                  <div className="order-item-details">
                    <h3>{item.name}</h3>

                    {/* Display selected options in checkout */}
                    {item.selectedOptions && (
                      <div className="order-item-options">
                        {item.selectedOptions.length && (
                          <span>📏 {item.selectedOptions.length} מ״מ</span>
                        )}
                        {item.selectedOptions.metalType && (
                          <span>✨ {item.selectedOptions.metalType}</span>
                        )}
                        {item.selectedOptions.chainType && (
                          <span>🔗 {item.selectedOptions.chainType}</span>
                        )}
                        {item.selectedOptions.waxColor && (
                          <span>🎨 {item.selectedOptions.waxColor}</span>
                        )}
                      </div>
                    )}

                    <p className="order-item-price">{item.price} ₪</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="order-total">
              <span>{language === "he" ? 'סה"כ לתשלום:' : "Total:"}</span>
              <span className="total-amount">{discountedTotal} ₪</span>
            </div>

            {/* Coupon Code */}
            <div className="coupon-section">
              <p className="coupon-label">
                {language === "he" ? "קוד קופון" : "Coupon Code"}
              </p>
              {appliedCoupon ? (
                <div className="coupon-applied">
                  <span>
                    ✅ {appliedCoupon.code} &mdash;{" "}
                    {appliedCoupon.discountPercent}%{" "}
                    {language === "he" ? "הנחה" : "off"}
                  </span>
                  <button
                    className="coupon-remove-btn"
                    onClick={() => {
                      setAppliedCoupon(null);
                      setCouponCode("");
                    }}
                  >
                    {language === "he" ? "הסר" : "Remove"}
                  </button>
                </div>
              ) : (
                <div className="coupon-input-row">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) =>
                      setCouponCode(e.target.value.toUpperCase())
                    }
                    placeholder={
                      language === "he" ? "הזן קוד קופון" : "Enter coupon code"
                    }
                    onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                  />
                  <button
                    className="coupon-apply-btn"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                  >
                    {couponLoading
                      ? "..."
                      : language === "he"
                        ? "הפעל"
                        : "Apply"}
                  </button>
                </div>
              )}
            </div>
          </div>

          <form className="checkout-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h2>{language === "he" ? "פרטי משלוח" : "Shipping Details"}</h2>

              <div className="form-group">
                <label htmlFor="fullname">
                  {language === "he" ? "שם מלא *" : "Full Name *"}
                </label>
                <input
                  type="text"
                  id="fullname"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">
                    {language === "he" ? "אימייל *" : "Email *"}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">
                    {language === "he" ? "טלפון *" : "Phone *"}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="address">
                  {language === "he" ? "כתובת *" : "Address *"}
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">
                    {language === "he" ? "עיר *" : "City *"}
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="zipCode">
                    {language === "he" ? "מיקוד *" : "Zip Code *"}
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn submit-order-btn"
              disabled={paymentLoading}
            >
              {paymentLoading
                ? language === "he"
                  ? "מעביר לדף תשלום…"
                  : "Redirecting to payment…"
                : language === "he"
                  ? `סכום הזמנה ומעבר לתשלום - ${discountedTotal} ₪`
                  : `Review & Proceed to Payment - ${discountedTotal} ₪`}
            </button>

            <p className="secure-payment-note">
              🔒{" "}
              {language === "he"
                ? "התשלום מתבצע באמצעות PayPlus - מאובטח ומוצפן"
                : "Payment processed via PayPlus - Secure and encrypted"}
            </p>
            <p className="payment-info-note">
              💳{" "}
              {language === "he"
                ? "תועבר לדף תשלום מאובטח להזנת פרטי כרטיס האשראי"
                : "You will be redirected to a secure payment page"}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
