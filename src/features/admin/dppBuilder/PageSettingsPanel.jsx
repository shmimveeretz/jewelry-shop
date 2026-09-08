import { useState } from "react";
import { FaSave, FaUndo } from "react-icons/fa";
import { updateProductPage } from "../adminApi";

const THEME_OPTIONS = {
  accent: ["gold", "navy", "cream"],
  background: ["cream", "white", "navy"],
};

const dateFormatter = new Intl.DateTimeFormat("he-IL", {
  dateStyle: "short",
  timeStyle: "short",
});

/** Slug, internal name, SEO, theme, and the published-revision history. */
function PageSettingsPanel({
  page,
  theme,
  onThemeChange,
  onSaved,
  onError,
  onSuccess,
  onRevert,
}) {
  const [form, setForm] = useState({
    slug: page.slug,
    internalName: page.internalName,
    seo: {
      title: page.seo?.title || "",
      description: page.seo?.description || "",
      noindex: page.seo?.noindex !== false,
    },
  });
  const [isSaving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const updated = await updateProductPage(page._id, form);
      onSaved(updated);
      onSuccess("ההגדרות נשמרו");
    } catch (error) {
      onError(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dpp-settings">
      <section className="dpp-panel">
        <p className="dpp-panel__title">כללי</p>

        <label className="admin-field">
          <span className="admin-field__label">שם פנימי</span>
          <input
            type="text"
            value={form.internalName}
            onChange={(event) =>
              setForm({ ...form, internalName: event.target.value })
            }
          />
          <small className="admin-field__hint">
            מוצג רק כאן בניהול, לא ללקוחות
          </small>
        </label>

        <label className="admin-field">
          <span className="admin-field__label">כתובת העמוד</span>
          <div className="dpp-settings__slug">
            <span>/lp/</span>
            <input
              type="text"
              dir="ltr"
              value={form.slug}
              onChange={(event) => setForm({ ...form, slug: event.target.value })}
            />
          </div>
          <small className="admin-field__hint">
            שינוי הכתובת ישבור קישורים שכבר רצים במודעות פעילות
          </small>
        </label>
      </section>

      <section className="dpp-panel">
        <p className="dpp-panel__title">עיצוב</p>

        <label className="admin-field">
          <span className="admin-field__label">צבע מוביל</span>
          <select
            value={theme.accent || "gold"}
            onChange={(event) =>
              onThemeChange({ ...theme, accent: event.target.value })
            }
          >
            {THEME_OPTIONS.accent.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="admin-field">
          <span className="admin-field__label">רקע העמוד</span>
          <select
            value={theme.background || "cream"}
            onChange={(event) =>
              onThemeChange({ ...theme, background: event.target.value })
            }
          >
            {THEME_OPTIONS.background.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="admin-field">
          <span className="admin-field__label">טקסט ברירת מחדל לכפתורים</span>
          <input
            type="text"
            value={theme.ctaLabel || ""}
            placeholder="לרכישה מאובטחת"
            onChange={(event) =>
              onThemeChange({ ...theme, ctaLabel: event.target.value })
            }
          />
          <small className="admin-field__hint">
            כל כפתור שלא הוגדר לו טקסט משלו ישתמש בזה
          </small>
        </label>
      </section>

      <section className="dpp-panel">
        <p className="dpp-panel__title">SEO</p>

        <label className="admin-field">
          <span className="admin-field__label">כותרת הדפדפן</span>
          <input
            type="text"
            value={form.seo.title}
            onChange={(event) =>
              setForm({ ...form, seo: { ...form.seo, title: event.target.value } })
            }
          />
        </label>

        <label className="admin-field">
          <span className="admin-field__label">תיאור</span>
          <textarea
            rows={3}
            value={form.seo.description}
            onChange={(event) =>
              setForm({
                ...form,
                seo: { ...form.seo, description: event.target.value },
              })
            }
          />
        </label>

        <label className="admin-field admin-field--inline">
          <input
            type="checkbox"
            checked={form.seo.noindex}
            onChange={(event) =>
              setForm({
                ...form,
                seo: { ...form.seo, noindex: event.target.checked },
              })
            }
          />
          <span>הסתרה ממנועי חיפוש</span>
        </label>
        <small className="admin-field__hint">
          מומלץ להשאיר מסומן: עמוד קמפיין שמתחרה בעמוד המוצר האורגני פוגע בשניהם
        </small>
      </section>

      {page.revisions?.length > 0 ? (
        <section className="dpp-panel">
          <p className="dpp-panel__title">גרסאות שפורסמו</p>
          <ul className="dpp-revisions">
            {page.revisions.map((revision, index) => (
              <li key={index}>
                <span>
                  {revision.publishedAt
                    ? dateFormatter.format(new Date(revision.publishedAt))
                    : "ללא תאריך"}
                  <small>{revision.layout?.blocks?.length || 0} בלוקים</small>
                </span>
                <button
                  type="button"
                  className="admin-shell__ghost-btn"
                  onClick={() => onRevert(index)}
                >
                  <FaUndo />
                  שחזור לטיוטה
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="dpp-settings__save">
        <button
          type="button"
          className="dpp-builder__publish"
          onClick={save}
          disabled={isSaving}
        >
          <FaSave />
          שמירת הגדרות
        </button>
      </div>
    </div>
  );
}

export default PageSettingsPanel;
