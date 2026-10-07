import { useState, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { CONSENT_KEY, setTrackingConsent } from "../utils/consent";
import "../styles/components/CookieBanner.css";

export default function CookieBanner() {
  const { language } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [dismissing, setDismissing] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (!stored) {
        // Small delay so page renders first, then banner slides up
        const t = setTimeout(() => setVisible(true), 500);
        return () => clearTimeout(t);
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  const dismiss = (granted) => {
    setTrackingConsent(granted);

    // Animate out, then unmount
    setDismissing(true);
    setTimeout(() => setVisible(false), 550);
  };

  if (!visible) return null;

  const isHe = language === "he";

  return (
    <div
      className={`cookie-banner${dismissing ? " cookie-banner--out" : ""}`}
      role="region"
      aria-label={isHe ? "הסכמה לעוגיות" : "Cookie consent"}
    >
      <div className="cookie-banner__inner">
        <p className="cookie-banner__text">
          {isHe
            ? "אנו משתמשים בעוגיות לניתוח תנועה ולשיפור חוויית הגלישה."
            : "We use cookies to analyze traffic and improve your experience."}{" "}
          <a href="/privacy-policy" className="cookie-banner__link">
            {isHe ? "מדיניות פרטיות" : "Privacy Policy"}
          </a>
        </p>
        <div className="cookie-banner__actions">
          <button
            className="cookie-banner__btn cookie-banner__btn--reject"
            onClick={() => dismiss(false)}
          >
            {isHe ? "דחה הכל" : "Reject All"}
          </button>
          <button
            className="cookie-banner__btn cookie-banner__btn--accept"
            onClick={() => dismiss(true)}
          >
            {isHe ? "קבל הכל" : "Accept All"}
          </button>
        </div>
      </div>
    </div>
  );
}
