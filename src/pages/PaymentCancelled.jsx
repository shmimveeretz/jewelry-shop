import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import "../styles/pages/PaymentFailure.css";

function PaymentCancelled() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const he = language === "he";

  const handleRetry = () => {
    // pendingOrder still in localStorage - go back to payment page
    const savedOrder = localStorage.getItem("pendingOrder");
    if (savedOrder) {
      navigate("/payment");
    } else {
      navigate("/cart");
    }
  };

  return (
    <div className="payment-status-page">
      <div className="payment-status-container failure">
        <div className="status-icon">❌</div>

        <h1>{he ? "התשלום בוטל" : "Payment Cancelled"}</h1>

        <p className="failure-message">
          {he
            ? "ביטלת את תהליך התשלום. ההזמנה שלך עדיין שמורה."
            : "You cancelled the payment process. Your order is still saved."}
        </p>

        <p
          className="failure-message"
          style={{ fontSize: "0.95rem", color: "#666" }}
        >
          {he
            ? "תוכל לחזור ולהשלים את התשלום בכל עת, או לחזור לעגלה ולבצע שינויים."
            : "You can return and complete the payment at any time, or go back to your cart to make changes."}
        </p>

        <div className="action-buttons">
          <button className="btn btn-primary" onClick={handleRetry}>
            {he ? "🔄 חזור לתשלום" : "🔄 Return to Payment"}
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => navigate("/cart")}
          >
            {he ? "🛒 חזור לעגלה" : "🛒 Back to Cart"}
          </button>

          <button
            className="btn btn-outline"
            onClick={() => navigate("/contact")}
          >
            {he ? "💬 צור קשר לתמיכה" : "💬 Contact Support"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentCancelled;
