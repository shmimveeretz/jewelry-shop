import { useNavigate } from "react-router-dom";
import { FaRegCommentDots } from "react-icons/fa";
import { useLanguage } from "../contexts/LanguageContext";
import "../styles/pages/PaymentFailure.css";
import { FaTimes } from "react-icons/fa";

function PaymentCancelled() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const he = language === "he";

  // The cart is untouched until a payment succeeds, so checkout can simply
  // be retried (it redirects to the cart if that is empty).
  const handleRetry = () => navigate("/checkout");

  return (
    <div className="payment-status-page">
      <div className="payment-status-container failure">
        <div className="status-icon">
          <FaTimes />
        </div>

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
            {he ? "חזרה לתשלום" : "Return to payment"}
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => navigate("/cart")}
          >
            {he ? "חזרה לעגלה" : "Back to cart"}
          </button>

          <button
            className="btn btn-outline"
            onClick={() => navigate("/contact")}
          >
            <FaRegCommentDots aria-hidden="true" />{" "}
            {he ? "צור קשר לתמיכה" : "Contact Support"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentCancelled;
