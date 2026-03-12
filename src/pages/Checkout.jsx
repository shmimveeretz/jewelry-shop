import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useToast } from "../context/ToastContext";
import { payPlusService } from "../utils/payPlusService";
import "../styles/pages/Checkout.css";

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const { cartItems, total } = location.state || { cartItems: [], total: 0 };
  const { clearCart } = useCart();
  const { showError } = useToast();

  const [loading, setLoading] = useState(false);
  const [checkoutAsGuest, setCheckoutAsGuest] = useState(false);
  const [formData, setFormData] = useState({
    full"name": "",
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
            full"name": details.full"name" || "",
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
    const { "name", value } = e.target;
    setFormData((prev) => ({
      ...prev,
      ["name"]: value,
    }));
  };

  const getFieldLabel = (field) => {
    const labels = {
      full"name": "שם מלא",
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
      "full"name"",
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

    setLoading(true);

    try {
      // Prepare payment data for PayPlus
      const paymentData = {
        customer"name": formData.full"name",
        customerEmail: formData.email,
        customerPhone: formData.phone,
        amount: total,
        currency: "ILS",
        items: cartItems.map((item) => ({
          "name": item."name",
          quantity: item.quantity || 1,
          price: item.price,
        })),
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode,
        },
      };

      console.log("📤 Creating PayPlus payment:", paymentData);

      // Create payment with PayPlus
      const result = await payPlusService.createPayment(paymentData);

      if (result.success && result.paymentPageUrl) {
        console.log("✅ Payment page created:", result.paymentPageUrl);

        // Save order data in localStorage for verification after redirect
        const orderData = {
          ...paymentData,
          transactionUid: result.transactionUid,
          cartItems: cartItems,
        };
        localStorage.setItem("pendingOrder", JSON.stringify(orderData));

        // Save shipping details for future use
        const shippingDetails = {
          full"name": formData.full"name",
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode,
        };
        localStorage.setItem(
          "shippingDetails",
          JSON.stringify(shippingDetails),
        );

        // Redirect to PayPlus payment page
        window.location.href = result.paymentPageUrl;
      } else {
        throw new Error("לא התקבל קישור לתשלום");
      }
    } catch (error) {
      console.error("Payment error:", error);
      showError(`שגיאה ביצירת תשלום: ${error.message}`);
      setLoading(false);
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return null;
  }

  return (
    <div class"name"="checkout-page">
      <div class"name"="checkout-container">
        <h1>{language === "he" ? "השלמת הזמנה" : "Complete Order"}</h1>

        {!localStorage.getItem("token") && (
          <div class"name"="guest-checkout-notice">
            <p>
              💡{" "}
              <strong>
                {language === "he" ? "הזמנה כאורח:" : "Guest Checkout:"}
              </strong>{" "}
              {language === "he"
                ? "אתה יכול להשלים את ההזמנה ללא הרשמה. פרטי ההזמנה יישלחו לאימייל שתזין."
                : "You can complete your order without registration. Order details will be sent to the email you provide."}
            </p>
            <p class"name"="login-option">
              {language === "he" ? "יש לך חשבון?" : "Have an account?"}{" "}
              <button
                class"name"="link-btn"
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

        <div class"name"="checkout-content">
          <div class"name"="order-summary-section">
            <h2>סיכום הזמנה</h2>
            <div class"name"="order-items">
              {cartItems.map((item) => (
                <div key={item.id} class"name"="order-item">
                  <img
                    src={
                      Array.isArray(item.images)
                        ? item.images[0]
                        : item.image ||
                          "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=100&h=100&fit=crop"
                    }
                    alt={item."name"}
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=100&h=100&fit=crop";
                    }}
                  />
                  <div class"name"="order-item-details">
                    <h3>{item."name"}</h3>

                    {/* Display selected options in checkout */}
                    {item.selectedOptions && (
                      <div class"name"="order-item-options">
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

                    <p class"name"="order-item-price">{item.price} ₪</p>
                  </div>
                </div>
              ))}
            </div>
            <div class"name"="order-total">
              <span>סה"כ לתשלום:</span>
              <span class"name"="total-amount">{total} ₪</span>
            </div>
          </div>

          <form class"name"="checkout-form" onSubmit={handleSubmit}>
            <div class"name"="form-section">
              <h2>פרטי משלוח</h2>

              <div class"name"="form-group">
                <label htmlFor="full"name"">שם מלא *</label>
                <input
                  type="text"
                  id="full"name""
                  "name"="full"name""
                  value={formData.full"name"}
                  onChange={handleChange}
                  required
                />
              </div>

              <div class"name"="form-row">
                <div class"name"="form-group">
                  <label htmlFor="email">אימייל *</label>
                  <input
                    type="email"
                    id="email"
                    "name"="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div class"name"="form-group">
                  <label htmlFor="phone">טלפון *</label>
                  <input
                    type="tel"
                    id="phone"
                    "name"="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div class"name"="form-group">
                <label htmlFor="address">כתובת *</label>
                <input
                  type="text"
                  id="address"
                  "name"="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div class"name"="form-row">
                <div class"name"="form-group">
                  <label htmlFor="city">עיר *</label>
                  <input
                    type="text"
                    id="city"
                    "name"="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div class"name"="form-group">
                  <label htmlFor="zipCode">מיקוד *</label>
                  <input
                    type="text"
                    id="zipCode"
                    "name"="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              class"name"="btn submit-order-btn"
              disabled={loading}
            >
              {loading
                ? "מפנה לתשלום..."
                : language === "he"
                  ? `המשך לתשלום מאובטח - ${total} ₪`
                  : `Proceed to Secure Payment - ${total} ₪`}
            </button>

            <p class"name"="secure-payment-note">
              🔒{" "}
              {language === "he"
                ? "התשלום מתבצע באמצעות PayPlus - מאובטח ומוצפן"
                : "Payment processed via PayPlus - Secure and encrypted"}
            </p>
            <p class"name"="payment-info-note">
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
