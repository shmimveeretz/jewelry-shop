import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import "../styles/pages/PaymentFailure.css";

function PaymentFailure() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const handleRetry = () => {
    // Restore pending order and go back to checkout
    navigate("/checkout");
  };

  return (
    <div className="payment-status-page">
      <div className="payment-status-container failure">
        <div className="status-icon">❌</div>

        <h1>{language === "he" ? "התשלום נכשל" : "Payment Failed"}</h1>

        <p className="failure-message">
          {language === "he"
            ? "מצטערים, התשלום לא הושלם בהצלחה."
            : "Sorry, your payment could not be processed."}
        </p>

        <div className="failure-reasons">
          <h3>{language === "he" ? "סיבות אפשריות:" : "Possible Reasons:"}</h3>
          <ul>
            <li>
              {language === "he"
                ? "פרטי כרטיס אשראי שגויים"
                : "Incorrect credit card details"}
            </li>
            <li>
              {language === "he"
                ? "אין מספיק יתרה בכרטיס"
                : "Insufficient funds"}
            </li>
            <li>
              {language === "he"
                ? "הכרטיס נחסם על ידי הבנק"
                : "Card blocked by bank"}
            </li>
            <li>
              {language === "he"
                ? "תקלה זמנית במערכת התשלומים"
                : "Temporary payment system issue"}
            </li>
          </ul>
        </div>

        <div className="failure-actions">
          <h3>{language === "he" ? "מה אפשר לעשות?" : "What can you do?"}</h3>
          <ul>
            <li>
              {language === "he"
                ? "נסה שוב עם כרטיס אחר"
                : "Try again with another card"}
            </li>
            <li>
              {language === "he"
                ? "בדוק את פרטי הכרטיס שהזנת"
                : "Check the card details you entered"}
            </li>
            <li>
              {language === "he" ? "צור קשר עם הבנק שלך" : "Contact your bank"}
            </li>
            <li>
              {language === "he"
                ? "צור איתנו קשר לסיוע"
                : "Contact us for assistance"}
            </li>
          </ul>
        </div>

        <div className="action-buttons">
          <button className="btn btn-primary" onClick={handleRetry}>
            {language === "he" ? "נסה שוב" : "Try Again"}
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/contact")}
          >
            {language === "he" ? "צור קשר" : "Contact Us"}
          </button>
          <button className="btn btn-text" onClick={() => navigate("/")}>
            {language === "he" ? "חזרה לדף הבית" : "Back to Home"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentFailure;
