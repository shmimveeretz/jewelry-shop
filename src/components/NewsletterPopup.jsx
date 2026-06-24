import { useState, useEffect } from "react";
import { FaTimes, FaStar } from "react-icons/fa";
import { useLanguage } from "../contexts/LanguageContext";
import "../styles/components/NewsletterPopup.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const STORAGE_KEY = "newsletter_dismissed";
const DISCOUNT_PERCENT = 10;

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
      <div
        className={`nl-popup${couponCode ? " nl-popup--success" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative tiled background */}
        <div className="nl-deco" aria-hidden="true" />

        {/* Close button */}
        <button
          className="nl-close"
          onClick={handleDismiss}
          aria-label={language === "en" ? "Close" : "סגור"}
        >
          <FaTimes />
        </button>

        {couponCode ? (
          /* ── Success state ── */
          <div className="nl-success">
            <FaStar className="nl-star-icon" />
            <h2>
              {language === "he"
                ? "ברוכים הבאים לקהילה שלנו"
                : "Welcome to our community!"}
            </h2>
            <p className="nl-success-sub">
              {language === "he"
                ? `לקבלת ${DISCOUNT_PERCENT}% הנחה על הקנייה הראשונה`
                : `To get ${DISCOUNT_PERCENT}% off your first order`}
            </p>
            <p className="nl-success-label">
              {language === "he"
                ? "הכניסו את קוד הקופון:"
                : "Enter the coupon code:"}
            </p>
            <div
              className="nl-coupon-code"
              dir="ltr"
              onClick={() => navigator.clipboard.writeText(couponCode)}
              title={language === "he" ? "לחץ להעתקה" : "Click to copy"}
            >
              {couponCode}
            </div>
            <button className="nl-done-btn" onClick={handleDismiss}>
              {language === "he" ? "סיום" : "Done"}
            </button>
          </div>
        ) : (
          /* ── Sign-up state ── */
          <div className="nl-form-wrap">
            <div className="nl-badge" dir="ltr">
              OFF {DISCOUNT_PERCENT}%
            </div>
            <h2>
              {language === "he"
                ? "הצטרפו לקהילה השמימית שלנו"
                : "Join our celestial community"}
            </h2>
            <p className="nl-subtitle">
              {language === "he"
                ? `הירשמו ותקבלו ${DISCOUNT_PERCENT}% הנחה לקנייה הראשונה`
                : `Subscribe and get ${DISCOUNT_PERCENT}% off your first purchase`}
            </p>
            <form className="nl-form" onSubmit={handleSubmit}>
              {error && <p className="nl-error">{error}</p>}
              <div className="nl-field">
                <input
                  type="email"
                  id="nl-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={language === "he" ? 'דוא"ל' : "Email address"}
                  dir="ltr"
                  required
                />
              </div>
              <button
                type="submit"
                className="nl-submit-btn"
                disabled={loading}
              >
                {loading
                  ? language === "he"
                    ? "שולח..."
                    : "Sending..."
                  : language === "he"
                    ? "אני רוצה הנחה"
                    : "I want my discount"}
              </button>
              <button
                type="button"
                className="nl-dismiss-link"
                onClick={handleDismiss}
              >
                {language === "he" ? "לא תודה" : "No thanks"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default NewsletterPopup;
