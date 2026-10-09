import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { API_BASE_URL } from "../constants/api";
import { trackEvent } from "../utils/tracking";

/** Newsletter signup in the footer; shows the welcome coupon on success. */
function FooterNewsletter() {
  const { language } = useLanguage();
  const he = language === "he";
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "idle", message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setStatus({
        type: "error",
        message: he ? "נא להזין כתובת אימייל תקינה" : "Please enter a valid email",
      });
      return;
    }

    setStatus({ type: "loading", message: "" });
    try {
      const response = await fetch(`${API_BASE_URL}/api/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });
      const data = await response.json();
      if (!data.success) {
        setStatus({
          type: "error",
          message: data.message || (he ? "ההרשמה נכשלה" : "Signup failed"),
        });
        return;
      }
      setEmail("");
      trackEvent("Lead", { lead_source: "footer", value: 0 });
      setStatus({
        type: "success",
        message: data.couponCode
          ? he
            ? `נרשמת! קוד ההטבה שלך: ${data.couponCode} (נשלח גם למייל)`
            : `You're in! Your code: ${data.couponCode} (also sent by email)`
          : he
            ? "נרשמת בהצלחה!"
            : "You're subscribed!",
      });
    } catch {
      setStatus({
        type: "error",
        message: he ? "שגיאה בחיבור לשרת" : "Connection error",
      });
    }
  };

  return (
    <form className="footer-newsletter" onSubmit={handleSubmit} noValidate>
      <label htmlFor="footer-newsletter-email" className="footer-newsletter__label">
        {he ? "הצטרפו לדיוור — עדכונים, השקות והטבות" : "Join our list — news, launches and offers"}
      </label>
      <div className="footer-newsletter__row">
        <input
          id="footer-newsletter-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          dir="ltr"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status.type === "error") setStatus({ type: "idle", message: "" });
          }}
          aria-invalid={status.type === "error"}
          aria-describedby="footer-newsletter-status"
        />
        <button type="submit" disabled={status.type === "loading"}>
          {status.type === "loading" ? "…" : he ? "הרשמה" : "Subscribe"}
        </button>
      </div>
      <p
        id="footer-newsletter-status"
        className={`footer-newsletter__status footer-newsletter__status--${status.type}`}
        role="status"
        aria-live="polite"
      >
        {status.message}
      </p>
    </form>
  );
}

export default FooterNewsletter;
