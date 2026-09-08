import {
  CTA_ACTION_OPTIONS,
  CTA_VALUE_HINTS,
  LAYOUT_OPTIONS,
  POSITION_OPTIONS,
} from "./popupDefaults";

function Select({ label, value, options, onChange }) {
  return (
    <label className="admin-field">
      <span className="admin-field__label">{label}</span>
      <select value={value ?? ""} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Color({ label, value, onChange }) {
  return (
    <label className="admin-field admin-field--color">
      <span className="admin-field__label">{label}</span>
      <input
        type="color"
        value={value || "#ffffff"}
        onChange={(event) => onChange(event.target.value.toUpperCase())}
      />
      <code>{value || "#FFFFFF"}</code>
    </label>
  );
}

function VariantPanel({ variant, onChange, showWeight }) {
  const { content, style } = variant;

  const setContent = (key, value) =>
    onChange({ ...variant, content: { ...content, [key]: value } });

  const setStyle = (key, value) =>
    onChange({ ...variant, style: { ...style, [key]: value } });

  const ctaHint = CTA_VALUE_HINTS[content.ctaAction];
  const isFloating = style.layout === "slideIn";

  return (
    <div className="popup-variant">
      <div className="dpp-panel">
        <h3 className="dpp-panel__title">תוכן</h3>
        <div className="dpp-panel__fields">
          <label className="admin-field">
            <span className="admin-field__label">שם הוריאנט (פנימי)</span>
            <input
              type="text"
              value={variant.label}
              onChange={(event) => onChange({ ...variant, label: event.target.value })}
            />
          </label>

          {showWeight ? (
            <label className="admin-field">
              <span className="admin-field__label">
                משקל בפיצול <em>יחסי לשאר הוריאנטים</em>
              </span>
              <input
                type="number"
                min={0}
                max={100}
                value={variant.weight}
                onChange={(event) =>
                  onChange({ ...variant, weight: Number(event.target.value) })
                }
              />
            </label>
          ) : null}

          <label className="admin-field">
            <span className="admin-field__label">כותרת</span>
            <input
              type="text"
              maxLength={160}
              value={content.headline || ""}
              onChange={(event) => setContent("headline", event.target.value)}
            />
          </label>

          <label className="admin-field">
            <span className="admin-field__label">כותרת משנה</span>
            <input
              type="text"
              maxLength={240}
              value={content.subheadline || ""}
              onChange={(event) => setContent("subheadline", event.target.value)}
            />
          </label>

          <label className="admin-field">
            <span className="admin-field__label">טקסט</span>
            <textarea
              rows={3}
              maxLength={1000}
              value={content.body || ""}
              onChange={(event) => setContent("body", event.target.value)}
            />
          </label>

          <label className="admin-field">
            <span className="admin-field__label">תמונה (כתובת)</span>
            <input
              type="url"
              dir="ltr"
              value={content.imageUrl || ""}
              onChange={(event) => setContent("imageUrl", event.target.value)}
            />
          </label>

          <label className="admin-field">
            <span className="admin-field__label">טקסט הכפתור</span>
            <input
              type="text"
              maxLength={60}
              value={content.ctaLabel || ""}
              onChange={(event) => setContent("ctaLabel", event.target.value)}
            />
          </label>

          <Select
            label="פעולת הכפתור"
            value={content.ctaAction}
            options={CTA_ACTION_OPTIONS}
            onChange={(value) => setContent("ctaAction", value)}
          />

          {ctaHint ? (
            <label className="admin-field">
              <span className="admin-field__label">{ctaHint.label}</span>
              <input
                type="text"
                dir="ltr"
                placeholder={ctaHint.placeholder}
                value={content.ctaValue || ""}
                onChange={(event) => setContent("ctaValue", event.target.value)}
              />
            </label>
          ) : null}

          <label className="admin-field">
            <span className="admin-field__label">
              קישור סירוב <em>נותן דרך יציאה מכובדת ומוריד תסכול</em>
            </span>
            <input
              type="text"
              maxLength={40}
              placeholder="לא תודה"
              value={content.dismissLabel || ""}
              onChange={(event) => setContent("dismissLabel", event.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="dpp-panel">
        <h3 className="dpp-panel__title">עיצוב</h3>
        <div className="dpp-panel__fields">
          <Select
            label="פריסה"
            value={style.layout}
            options={LAYOUT_OPTIONS}
            onChange={(value) => setStyle("layout", value)}
          />

          {isFloating ? (
            <Select
              label="מיקום"
              value={style.position}
              options={POSITION_OPTIONS}
              onChange={(value) => setStyle("position", value)}
            />
          ) : null}

          <Color
            label="צבע הדגשה"
            value={style.accentColor}
            onChange={(value) => setStyle("accentColor", value)}
          />
          <Color
            label="רקע"
            value={style.backgroundColor}
            onChange={(value) => setStyle("backgroundColor", value)}
          />
          <Color
            label="טקסט"
            value={style.textColor}
            onChange={(value) => setStyle("textColor", value)}
          />

          <label className="admin-field">
            <span className="admin-field__label">עיגול פינות (px)</span>
            <input
              type="number"
              min={0}
              max={48}
              value={style.borderRadius ?? 16}
              onChange={(event) =>
                setStyle("borderRadius", Number(event.target.value))
              }
            />
          </label>

          <label className="admin-field admin-field--inline">
            <input
              type="checkbox"
              checked={style.showOverlay !== false}
              onChange={(event) => setStyle("showOverlay", event.target.checked)}
            />
            <span className="admin-field__label">הצללת רקע</span>
          </label>

          <label className="admin-field">
            <span className="admin-field__label">
              תיאור לקורא מסך <em>נדרש כשהכותרת היא תמונה בלבד</em>
            </span>
            <input
              type="text"
              maxLength={120}
              value={style.ariaLabel || ""}
              onChange={(event) => setStyle("ariaLabel", event.target.value)}
            />
          </label>
        </div>
      </div>
    </div>
  );
}

export default VariantPanel;
