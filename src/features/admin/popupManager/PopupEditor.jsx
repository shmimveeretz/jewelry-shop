import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowRight, FaPlus, FaTrash } from "react-icons/fa";
import { useToast } from "../../../context/ToastContext";
import {
  getPopup,
  getPopupStats,
  resetPopupStats,
  updatePopup,
} from "../adminApi";
import { blankVariant } from "./popupDefaults";
import PopupPreview from "./PopupPreview";
import PopupStats from "./PopupStats";
import RulesPanel from "./RulesPanel";
import VariantPanel from "./VariantPanel";
import "../../../styles/admin/DppBuilder.css";
import "../../../styles/admin/PopupManager.css";

const MAX_VARIANTS = 4;

/**
 * Only used to hide the reset button; the endpoint enforces the role itself,
 * so a tampered localStorage buys nothing.
 */
const isRoiAdmin = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}").role === "roi";
  } catch {
    return false;
  }
};

const STATUS_OPTIONS = [
  { value: "draft", label: "טיוטה" },
  { value: "active", label: "פעיל" },
  { value: "paused", label: "מושהה" },
];

function PopupEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [popup, setPopup] = useState(null);
  const [stats, setStats] = useState(null);
  const [activeVariant, setActiveVariant] = useState(0);
  const [isDirty, setDirty] = useState(false);
  const [isSaving, setSaving] = useState(false);

  const loadStats = () =>
    getPopupStats(id)
      .then(setStats)
      .catch(() => {});

  useEffect(() => {
    getPopup(id)
      .then((data) => {
        setPopup(data);
        setDirty(false);
      })
      .catch((error) => showError(error.message));
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const edit = (next) => {
    setPopup(next);
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const saved = await updatePopup(id, popup);
      setPopup(saved);
      setDirty(false);
      showSuccess("הפופאפ נשמר");
      loadStats();
    } catch (error) {
      showError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const addVariant = () => {
    const key = String.fromCharCode(97 + popup.variants.length);
    const source = popup.variants[activeVariant];

    // Copied from the current variant, not blank: an A/B test where the arms
    // differ in everything measures nothing.
    edit({
      ...popup,
      abTest: { ...popup.abTest, enabled: true },
      variants: [
        ...popup.variants,
        {
          ...structuredClone(source),
          ...blankVariant(key),
          content: { ...source.content },
          style: { ...source.style },
        },
      ],
    });
    setActiveVariant(popup.variants.length);
  };

  const removeVariant = (index) => {
    if (!window.confirm("למחוק את הוריאנט? הנתונים שנצברו עליו יימחקו."))
      return;

    edit({
      ...popup,
      variants: popup.variants.filter((_, i) => i !== index),
    });
    setActiveVariant(0);
  };

  const resetStats = async () => {
    if (!window.confirm("לאפס את כל המונים? הפעולה בלתי הפיכה.")) return;
    try {
      await resetPopupStats(id);
      showSuccess("הנתונים אופסו");
      loadStats();
    } catch (error) {
      showError(error.message);
    }
  };

  if (!popup) return <p className="dpp-builder__loading">טוען…</p>;

  const variant = popup.variants[activeVariant] || popup.variants[0];

  return (
    <div className="popup-editor">
      <header className="dpp-builder__head">
        <div className="dpp-builder__title">
          <button
            type="button"
            className="admin-shell__icon-btn"
            onClick={() => navigate("/admin/popups")}
            title="חזרה"
          >
            <FaArrowRight />
          </button>
          <div>
            <input
              className="popup-editor__name"
              value={popup.name}
              onChange={(event) => edit({ ...popup, name: event.target.value })}
            />
            <span className="dpp-builder__slug">
              {popup.frequency.storageKey}
            </span>
          </div>
        </div>

        <div className="dpp-builder__actions">
          {isDirty ? (
            <span className="dpp-builder__dirty">שינויים לא שמורים</span>
          ) : null}

          <select
            className="popup-editor__status"
            value={popup.status}
            onChange={(event) => edit({ ...popup, status: event.target.value })}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="dpp-builder__publish"
            onClick={save}
            disabled={isSaving || !isDirty}
          >
            {isSaving ? "שומר…" : "שמירה"}
          </button>
        </div>
      </header>

      <div className="popup-editor__grid">
        <div className="popup-editor__main">
          <div className="dpp-builder__tabs popup-editor__variants">
            {popup.variants.map((entry, index) => (
              <button
                key={entry.key}
                type="button"
                className={index === activeVariant ? "is-active" : ""}
                onClick={() => setActiveVariant(index)}
              >
                {entry.label || entry.key.toUpperCase()}
              </button>
            ))}

            {popup.variants.length < MAX_VARIANTS ? (
              <button type="button" onClick={addVariant} title="וריאנט חדש">
                <FaPlus />
              </button>
            ) : null}

            {popup.variants.length > 1 ? (
              <button
                type="button"
                onClick={() => removeVariant(activeVariant)}
                title="מחיקת הוריאנט הנוכחי"
              >
                <FaTrash />
              </button>
            ) : null}
          </div>

          <VariantPanel
            variant={variant}
            showWeight={popup.variants.length > 1}
            onChange={(next) =>
              edit({
                ...popup,
                variants: popup.variants.map((entry, index) =>
                  index === activeVariant ? next : entry,
                ),
              })
            }
          />

          <RulesPanel popup={popup} onChange={edit} />
        </div>

        <aside className="popup-editor__side">
          <PopupPreview variant={variant} />
          <PopupStats
            stats={stats}
            onReset={resetStats}
            canReset={isRoiAdmin()}
          />
        </aside>
      </div>
    </div>
  );
}

export default PopupEditor;
