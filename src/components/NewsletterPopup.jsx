import { useState, useEffect } from "react";
import { FaTimes, FaEnvelope, FaGem } from "react-icons/fa";
import { useLanguage } from "../contexts/LanguageContext";
import "../styles/components/NewsletterPopup.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const STORAGE_KEY = "newsletter_dismissed";
const DISCOUNT_PERCENT = 5;

function NewsletterPopup() {
  const { language } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    const timer = setTimeout(() => setVisible(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(
        language === "he"
          ? "אנא הכנס כתובת אימייל תקינה"
          : "Please enter a valid email address",
      );
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setCouponCode(data.couponCode);
        localStorage.setItem(STORAGE_KEY, "true");
      } else {
        setError(
          data.message ||
            (language === "he" ? "שגיאה בהרשמה" : "Subscription error"),
        );
      }
    } catch {
      setError(language === "he" ? "שגיאה בחיבור לשרת" : "Connection error");
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="nl-overlay" onClick={handleDismiss}>
      <div className="nl-popup" onClick={(e) => e.stopPropagation()}>
        <button className="nl-close" onClick={handleDismiss} aria-label="סגור">
          <FaTimes />
        </button>

        {couponCode ? (
          /* ── Success state ── */
          <div className="nl-success">
            <div className="nl-icon-wrap">
              <FaGem />
            </div>
            <h2>
              {language === "he"
                ? "ברוך הבא למשפחה!"
                : "Welcome to the family!"}
            </h2>
            <p>
              {language === "he"
                ? `קוד הקופון שלך להנחה של ${DISCOUNT_PERCENT}% על ההזמנה הראשונה:`
                : `Your ${DISCOUNT_PERCENT}% discount code for your first order:`}
            </p>
            <div className="nl-coupon-display">
              <span>{couponCode}</span>
              <button
                className="nl-copy-btn"
                onClick={() => navigator.clipboard.writeText(couponCode)}
              >
                {language === "he" ? "העתק" : "Copy"}
              </button>
            </div>
            <p className="nl-fine-print">
              {language === "he"
                ? "הזן את הקוד בדף התשלום. תקף להזמנה ראשונה בלבד."
                : "Enter the code at checkout. Valid for first order only."}
            </p>
            <button className="nl-done-btn" onClick={handleDismiss}>
              {language === "he" ? "תודה, נתחיל לקנות!" : "Thanks, let's shop!"}
            </button>
          </div>
        ) : (
          /* ── Sign-up state ── */
          <>
            <div className="nl-icon-wrap">
              <FaEnvelope />
            </div>
            <h2>
              {language === "he"
                ? `קבל ${DISCOUNT_PERCENT}% הנחה על ההזמנה הראשונה`
                : `Get ${DISCOUNT_PERCENT}% off your first order`}
            </h2>
            <p className="nl-subtitle">
              {language === "he"
                ? "הירשם לניוזלטר שלנו וקבל קוד קופון מיד"
                : "Subscribe to our newsletter and get a coupon code instantly"}
            </p>

            <form className="nl-form" onSubmit={handleSubmit}>
              {error && <p className="nl-error">{error}</p>}
              <div className="nl-input-row">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    language === "he"
                      ? "כתובת האימייל שלך"
                      : "Your email address"
                  }
                  required
                />
                <button type="submit" disabled={loading}>
                  {loading
                    ? language === "he"
                      ? "שולח..."
                      : "Sending..."
                    : language === "he"
                      ? "הרשם"
                      : "Subscribe"}
                </button>
              </div>
            </form>

            <p className="nl-disclaimer">
              {language === "he"
                ? "לא נשלח ספאם. ניתן לבטל בכל עת."
                : "No spam. Unsubscribe at any time."}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default NewsletterPopup;
