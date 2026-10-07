import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import "../../styles/components/MarketingPopup.css";
import { API_BASE_URL } from "../../constants/api";


const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])';

/**
 * Renders the active popup into #popup-root.
 *
 * A portal rather than an inline render: the storefront and the campaign pages
 * have their own stacking contexts and overflow rules, and a popup clipped by
 * whichever section happened to contain it is worse than no popup at all.
 */
function PopupHost({ variant, onClose }) {
  const dialogRef = useRef(null);
  const restoreFocusRef = useRef(null);
  const [email, setEmail] = useState("");
  const [couponCode, setCouponCode] = useState(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { content = {}, style = {} } = variant;
  const layout = style.layout || "modal";
  const isOverlay = layout === "modal" || layout === "fullscreen";

  useEffect(() => {
    restoreFocusRef.current = document.activeElement;
    // Move focus into the dialog so a screen reader announces it and Tab does
    // not wander into the page behind.
    const first = dialogRef.current?.querySelector(FOCUSABLE);
    (first || dialogRef.current)?.focus();

    return () => restoreFocusRef.current?.focus?.();
  }, []);

  useEffect(() => {
    if (!isOverlay) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOverlay]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose("dismissed");
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = [...(dialogRef.current?.querySelectorAll(FOCUSABLE) || [])];
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      // Wrap focus at both ends so it can never escape into the page below.
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const subscribe = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!data.success) {
        setError(data.message || "לא הצלחנו לרשום את הכתובת");
        return;
      }

      // The coupon is the reason they gave us the address, so it is shown
      // before the popup goes away.
      setCouponCode(data.couponCode || null);
      onClose("converted", { keepOpen: true });
    } catch {
      setError("שגיאת חיבור, נסו שוב");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCta = () => {
    switch (content.ctaAction) {
      case "url":
        if (content.ctaValue) window.open(content.ctaValue, "_blank", "noopener");
        onClose("converted");
        break;

      case "scrollToCta": {
        const target = content.ctaValue
          ? document.getElementById(content.ctaValue)
          : document.querySelector("[data-dpp-cta]");
        target?.scrollIntoView({ behavior: "smooth", block: "center" });
        onClose("converted");
        break;
      }

      case "applyCoupon":
        setCouponCode(content.ctaValue);
        onClose("converted", { keepOpen: true });
        break;

      default:
        onClose("dismissed");
    }
  };

  const root = document.getElementById("popup-root");
  if (!root) return null;

  const surfaceStyle = {
    background: style.backgroundColor || "#ffffff",
    color: style.textColor || "#1B2A4A",
    borderRadius: `${style.borderRadius ?? 16}px`,
    "--popup-accent": style.accentColor || "#C9A227",
  };

  const body = (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal={isOverlay}
      aria-label={style.ariaLabel || content.headline || "הצעה"}
      tabIndex={-1}
      dir="rtl"
      className={`mpopup mpopup--${layout} mpopup--${style.position || "center"}`}
      style={surfaceStyle}
    >
      <button
        type="button"
        className="mpopup__close"
        onClick={() => onClose("dismissed")}
        aria-label="סגירה"
      >
        <X size={18} />
      </button>

      {content.imageUrl ? (
        <img className="mpopup__image" src={content.imageUrl} alt="" />
      ) : null}

      <div className="mpopup__content">
        {content.headline ? (
          <h2 className="mpopup__headline">{content.headline}</h2>
        ) : null}
        {content.subheadline ? (
          <p className="mpopup__subheadline">{content.subheadline}</p>
        ) : null}
        {content.body ? <p className="mpopup__body">{content.body}</p> : null}

        {couponCode ? (
          <p className="mpopup__coupon">
            קוד הקופון שלכם: <strong>{couponCode}</strong>
          </p>
        ) : content.ctaAction === "newsletter" ? (
          <form className="mpopup__form" onSubmit={subscribe}>
            <input
              type="email"
              required
              dir="ltr"
              placeholder="your@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-label="כתובת אימייל"
            />
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "רגע…" : content.ctaLabel || "הרשמה"}
            </button>
          </form>
        ) : (
          <button type="button" className="mpopup__cta" onClick={handleCta}>
            {content.ctaLabel || "המשך"}
          </button>
        )}

        {error ? <p className="mpopup__error">{error}</p> : null}

        {content.dismissLabel && !couponCode ? (
          <button
            type="button"
            className="mpopup__dismiss"
            onClick={() => onClose("dismissed")}
          >
            {content.dismissLabel}
          </button>
        ) : null}
      </div>
    </div>
  );

  return createPortal(
    <div className={`mpopup-layer mpopup-layer--${layout}`}>
      {isOverlay && style.showOverlay !== false ? (
        <div
          className="mpopup__overlay"
          onClick={() => onClose("dismissed")}
          aria-hidden="true"
        />
      ) : null}
      {body}
    </div>,
    root,
  );
}

export default PopupHost;
