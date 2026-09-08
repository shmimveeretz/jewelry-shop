// The runtime stylesheet, not a copy of it: a preview styled by a second set
// of rules is a preview that can lie.
import "../../../styles/components/MarketingPopup.css";

/**
 * Inline preview of a variant.
 *
 * Reuses the runtime's own .mpopup classes rather than re-styling anything, so
 * what an admin approves here is what a visitor sees — only rendered in place
 * instead of portalled and fixed.
 */
function PopupPreview({ variant }) {
  const { content = {}, style = {} } = variant;

  return (
    <div className="popup-preview">
      <div className="popup-preview__label">תצוגה מקדימה</div>
      <div
        className={`popup-preview__stage ${
          style.showOverlay !== false ? "has-overlay" : ""
        }`}
      >
        <div
          dir="rtl"
          className={`mpopup mpopup--${style.layout || "modal"}`}
          style={{
            background: style.backgroundColor || "#ffffff",
            color: style.textColor || "#1B2A4A",
            borderRadius: `${style.borderRadius ?? 16}px`,
            "--popup-accent": style.accentColor || "#C9A227",
            position: "relative",
            maxWidth: "100%",
            animation: "none",
          }}
        >
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

            {content.ctaAction === "newsletter" ? (
              <div className="mpopup__form">
                <input type="email" dir="ltr" placeholder="your@email.com" readOnly />
                <button type="button" disabled>
                  {content.ctaLabel || "הרשמה"}
                </button>
              </div>
            ) : (
              <button type="button" className="mpopup__cta" disabled>
                {content.ctaLabel || "המשך"}
              </button>
            )}

            {content.dismissLabel ? (
              <span className="mpopup__dismiss">{content.dismissLabel}</span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PopupPreview;
