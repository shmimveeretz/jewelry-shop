import { FaPlus, FaTrash, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { ICON_NAMES } from "../../dpp/icons";

/**
 * Renders one editable field from the descriptor the server returns for it.
 *
 * The admin never hand-writes a form per block type: adding a prop to the
 * allowlist in Backend/src/utils/blockValidation.js makes it appear here, with
 * the right control and the right limits, automatically.
 */

const toDatetimeLocal = (iso) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  // datetime-local wants local wall time without a zone suffix.
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

function FieldControl({ field, value, onChange, label }) {
  const { key, kind, options, max, min, maxItems } = field;
  const id = `field-${key}`;

  switch (kind) {
    case "boolean":
      return (
        <label className="admin-field admin-field--inline" htmlFor={id}>
          <input
            id={id}
            type="checkbox"
            checked={value !== false}
            onChange={(event) => onChange(event.target.checked)}
          />
          <span>{label}</span>
        </label>
      );

    case "number":
      return (
        <label className="admin-field" htmlFor={id}>
          <span className="admin-field__label">{label}</span>
          <input
            id={id}
            type="number"
            min={min}
            max={max}
            value={value ?? ""}
            onChange={(event) =>
              onChange(event.target.value === "" ? undefined : Number(event.target.value))
            }
          />
        </label>
      );

    case "enum": {
      // The icon list is long enough to deserve a picker rather than a select.
      const isIconField = options?.length === ICON_NAMES.length && options[0] === "lock";

      if (isIconField) {
        return (
          <div className="admin-field">
            <span className="admin-field__label">{label}</span>
            <div className="admin-field__icons">
              {options.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`admin-field__icon ${value === option ? "is-on" : ""}`}
                  onClick={() => onChange(option)}
                  title={option}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );
      }

      return (
        <label className="admin-field" htmlFor={id}>
          <span className="admin-field__label">{label}</span>
          <select
            id={id}
            value={value ?? ""}
            onChange={(event) => onChange(event.target.value || undefined)}
          >
            <option value="">— ברירת מחדל —</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      );
    }

    case "color":
      return (
        <label className="admin-field admin-field--color" htmlFor={id}>
          <span className="admin-field__label">{label}</span>
          <input
            id={id}
            type="color"
            value={value || "#ffffff"}
            onChange={(event) => onChange(event.target.value)}
          />
          <code>{value || "—"}</code>
        </label>
      );

    case "datetime":
      return (
        <label className="admin-field" htmlFor={id}>
          <span className="admin-field__label">{label}</span>
          <input
            id={id}
            type="datetime-local"
            value={toDatetimeLocal(value)}
            onChange={(event) =>
              onChange(
                event.target.value
                  ? new Date(event.target.value).toISOString()
                  : undefined,
              )
            }
          />
        </label>
      );

    case "textarea":
      return (
        <label className="admin-field" htmlFor={id}>
          <span className="admin-field__label">
            {label}
            {max ? <em>{(value || "").length}/{max}</em> : null}
          </span>
          <textarea
            id={id}
            rows={4}
            maxLength={max}
            value={value || ""}
            onChange={(event) => onChange(event.target.value || undefined)}
          />
        </label>
      );

    case "image":
      return (
        <label className="admin-field" htmlFor={id}>
          <span className="admin-field__label">{label}</span>
          <input
            id={id}
            type="url"
            dir="ltr"
            placeholder="https://res.cloudinary.com/..."
            value={value || ""}
            onChange={(event) => onChange(event.target.value || undefined)}
          />
          <small className="admin-field__hint">
            כתובות Cloudinary בלבד — אחרת השדה יידחה בשמירה
          </small>
          {value ? (
            <img className="admin-field__preview" src={value} alt="" />
          ) : null}
        </label>
      );

    case "url":
      return (
        <label className="admin-field" htmlFor={id}>
          <span className="admin-field__label">{label}</span>
          <input
            id={id}
            type="url"
            dir="ltr"
            placeholder="https://..."
            value={value || ""}
            onChange={(event) => onChange(event.target.value || undefined)}
          />
        </label>
      );

    case "stringList":
      return (
        <label className="admin-field" htmlFor={id}>
          <span className="admin-field__label">{label}</span>
          <input
            id={id}
            type="text"
            dir="ltr"
            placeholder="ערכים מופרדים בפסיק"
            value={(value || []).join(", ")}
            onChange={(event) =>
              onChange(
                event.target.value
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean)
                  .slice(0, maxItems),
              )
            }
          />
        </label>
      );

    case "list":
      return (
        <ListField
          label={label}
          field={field}
          value={value || []}
          onChange={onChange}
        />
      );

    default:
      return (
        <label className="admin-field" htmlFor={id}>
          <span className="admin-field__label">
            {label}
            {max ? <em>{(value || "").length}/{max}</em> : null}
          </span>
          <input
            id={id}
            type="text"
            maxLength={max}
            value={value || ""}
            onChange={(event) => onChange(event.target.value || undefined)}
          />
        </label>
      );
  }
}

/** Repeating rows (FAQ entries, trust signals, benefits). */
function ListField({ label, field, value, onChange }) {
  const { fields = [], maxItems = 20 } = field;

  const patchItem = (index, key, next) =>
    onChange(
      value.map((item, position) =>
        position === index ? { ...item, [key]: next } : item,
      ),
    );

  const move = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="admin-field admin-list">
      <div className="admin-list__head">
        <span className="admin-field__label">{label}</span>
        <button
          type="button"
          className="admin-shell__ghost-btn"
          disabled={value.length >= maxItems}
          onClick={() => onChange([...value, {}])}
        >
          <FaPlus />
          הוספה
        </button>
      </div>

      {value.length === 0 ? (
        <p className="admin-field__hint">אין פריטים עדיין</p>
      ) : null}

      {value.map((item, index) => (
        <div key={index} className="admin-list__item">
          <div className="admin-list__item-bar">
            <span>#{index + 1}</span>
            <button
              type="button"
              className="admin-shell__icon-btn"
              onClick={() => move(index, -1)}
              disabled={index === 0}
              title="הזזה למעלה"
            >
              <FaArrowUp />
            </button>
            <button
              type="button"
              className="admin-shell__icon-btn"
              onClick={() => move(index, 1)}
              disabled={index === value.length - 1}
              title="הזזה למטה"
            >
              <FaArrowDown />
            </button>
            <button
              type="button"
              className="admin-shell__icon-btn"
              onClick={() =>
                onChange(value.filter((_, position) => position !== index))
              }
              title="מחיקה"
            >
              <FaTrash />
            </button>
          </div>

          {fields.map((subField) => (
            <FieldControl
              key={subField.key}
              field={subField}
              label={subField.key}
              value={item[subField.key]}
              onChange={(next) => patchItem(index, subField.key, next)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default FieldControl;
