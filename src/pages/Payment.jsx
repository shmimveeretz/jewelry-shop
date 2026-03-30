import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useToast } from "../context/ToastContext";
import { payPlusService } from "../utils/payPlusService";
import "../styles/pages/Payment.css";

function Payment() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { showError } = useToast();

  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load pending order from localStorage
  useEffect(() => {
    const savedOrder = localStorage.getItem("pendingOrder");
    if (!savedOrder) {
      navigate("/cart");
      return;
    }
    try {
      setOrderData(JSON.parse(savedOrder));
    } catch {
      navigate("/cart");
    }
  }, [navigate]);

  const handlePay = async () => {
    if (!orderData) return;

    setLoading(true);
    setError(null);

    try {
      const paymentData = {
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        customerPhone: orderData.customerPhone,
        amount: orderData.totalPrice,
        currency: "ILS",
        items: orderData.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress: orderData.shippingAddress,
      };

      const result = await payPlusService.createPayment(paymentData);

      if (result.success && result.paymentPageUrl) {
        // Update pendingOrder with transactionUid before redirect
        const updatedOrder = {
          ...orderData,
          transactionUid: result.transactionUid,
        };
        localStorage.setItem("pendingOrder", JSON.stringify(updatedOrder));

        // Redirect to PayPlus payment page
        window.location.href = result.paymentPageUrl;
      } else {
        throw new Error(
          language === "he"
            ? "לא התקבל קישור לתשלום"
            : "No payment URL received",
        );
      }
    } catch (err) {
      const msg =
        err.message ||
        (language === "he" ? "שגיאה ביצירת תשלום" : "Payment creation failed");
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!orderData) return null;

  const he = language === "he";

  return (
    <div className="payment-page">
      <div className="payment-container">
        <h1 className="payment-title">
          {he ? "אישור ותשלום" : "Review & Pay"}
        </h1>

        {/* Order Summary */}
        <div className="payment-summary-card">
          <h2>{he ? "סיכום הזמנה" : "Order Summary"}</h2>

          <div className="payment-items">
            {orderData.items.map((item, index) => (
              <div key={index} className="payment-item">
                <span className="payment-item-name">
                  {item.name}
                  {item.quantity > 1 && (
                    <span className="payment-item-qty"> ×{item.quantity}</span>
                  )}
                </span>
                <span className="payment-item-price">
                  {item.price * item.quantity} ₪
                </span>
              </div>
            ))}
          </div>

          <div className="payment-breakdown">
            <div className="payment-breakdown-row">
              <span>{he ? "מוצרים" : "Items"}</span>
              <span>{orderData.itemsPrice} ₪</span>
            </div>
            <div className="payment-breakdown-row">
              <span>{he ? "משלוח" : "Shipping"}</span>
              <span>
                {orderData.shippingPrice === 0
                  ? he
                    ? "חינם"
                    : "Free"
                  : `${orderData.shippingPrice} ₪`}
              </span>
            </div>
            <div className="payment-breakdown-row total">
              <span>{he ? "סה״כ לתשלום" : "Total"}</span>
              <span>{orderData.totalPrice} ₪</span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="payment-address-card">
          <h2>{he ? "כתובת משלוח" : "Shipping Address"}</h2>
          <p>{orderData.shippingAddress.fullname}</p>
          <p>
            {orderData.shippingAddress.address},{" "}
            {orderData.shippingAddress.city}
            {orderData.shippingAddress.zipCode
              ? ` ${orderData.shippingAddress.zipCode}`
              : ""}
          </p>
          <p>
            {he ? "📧" : "📧"} {orderData.customerEmail}
          </p>
          <p>📞 {orderData.customerPhone}</p>
        </div>

        {/* Error */}
        {error && (
          <div className="payment-error">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="payment-actions">
          <button
            className="btn btn-pay"
            onClick={handlePay}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="payment-spinner"></span>
                {he ? "יוצר עסקה..." : "Creating transaction..."}
              </>
            ) : (
              <>
                💳{" "}
                {he
                  ? `בצע תשלום מאובטח - ${orderData.totalPrice} ₪`
                  : `Pay Securely - ${orderData.totalPrice} ₪`}
              </>
            )}
          </button>

          <button
            className="btn btn-secondary btn-back"
            onClick={() =>
              navigate("/checkout", {
                state: {
                  cartItems: orderData.items,
                  total: orderData.totalPrice,
                },
              })
            }
            disabled={loading}
          >
            {he ? "← חזור לפרטי המשלוח" : "← Back to Shipping Details"}
          </button>
        </div>

        <p className="payment-secure-note">
          🔒{" "}
          {he
            ? "התשלום מתבצע דרך PayPlus - מוצפן ומאובטח לחלוטין"
            : "Payment processed via PayPlus - Fully encrypted and secure"}
        </p>
      </div>
    </div>
  );
}

export default Payment;
