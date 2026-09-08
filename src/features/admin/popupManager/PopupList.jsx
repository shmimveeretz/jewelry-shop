import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaClone, FaPause, FaPlay, FaPlus, FaTrash } from "react-icons/fa";
import { useToast } from "../../../context/ToastContext";
import {
  createPopup,
  deletePopup,
  duplicatePopup,
  listPopups,
  setPopupStatus,
} from "../adminApi";
import { blankPopup } from "./popupDefaults";
import "../../../styles/admin/DppBuilder.css";
import "../../../styles/admin/PopupManager.css";

const STATUS_LABELS = { draft: "טיוטה", active: "פעיל", paused: "מושהה" };

const percent = new Intl.NumberFormat("he-IL", {
  style: "percent",
  maximumFractionDigits: 1,
});

function PopupList() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [popups, setPopups] = useState([]);

  const refresh = () =>
    listPopups()
      .then(setPopups)
      .catch((error) => showError(error.message));

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const create = async () => {
    try {
      const popup = await createPopup(blankPopup());
      navigate(`/admin/popups/${popup._id}`);
    } catch (error) {
      showError(error.message);
    }
  };

  const toggle = async (popup) => {
    const next = popup.status === "active" ? "paused" : "active";
    try {
      await setPopupStatus(popup._id, next);
      showSuccess(next === "active" ? "הפופאפ הופעל" : "הפופאפ הושהה");
      refresh();
    } catch (error) {
      showError(error.message);
    }
  };

  const duplicate = async (popup) => {
    try {
      const copy = await duplicatePopup(popup._id);
      showSuccess("הפופאפ שוכפל");
      navigate(`/admin/popups/${copy._id}`);
    } catch (error) {
      showError(error.message);
    }
  };

  const remove = async (popup) => {
    if (!window.confirm(`למחוק את "${popup.name}"? הנתונים שנצברו יימחקו איתו.`)) {
      return;
    }
    try {
      await deletePopup(popup._id);
      showSuccess("הפופאפ נמחק");
      refresh();
    } catch (error) {
      showError(error.message);
    }
  };

  return (
    <div className="popup-list">
      <header className="admin-dashboard__head">
        <div>
          <h1>פופאפים</h1>
          <p className="admin-dashboard__sub">
            כשכמה פופאפים מתאימים לאותו מבקר, מוצג רק זה עם העדיפות הגבוהה
            ביותר — שני פופאפים במקביל לא ממירים אף אחד.
          </p>
        </div>

        <button type="button" className="dpp-builder__publish" onClick={create}>
          <FaPlus />
          פופאפ חדש
        </button>
      </header>

      {popups.length === 0 ? (
        <p className="admin-widget__empty">אין פופאפים עדיין.</p>
      ) : (
        <ul className="dpp-list__items">
          {popups.map((popup) => {
            const rate =
              popup.impressions > 0 ? popup.conversions / popup.impressions : 0;

            return (
              <li key={popup._id} className="dpp-list__item">
                <Link to={`/admin/popups/${popup._id}`} className="dpp-list__link">
                  <span className="dpp-list__name">{popup.name}</span>
                  <span className="dpp-list__slug">
                    {popup.triggerType} · עדיפות {popup.priority} ·{" "}
                    {popup.variantCount} וריאנטים
                  </span>
                </Link>

                <span className={`dpp-status dpp-status--${popup.status === "active" ? "published" : "draft"}`}>
                  {STATUS_LABELS[popup.status]}
                </span>

                <span className="dpp-list__date">
                  {popup.impressions} הצגות · {percent.format(rate)} המרה
                </span>

                <div className="dpp-list__tools">
                  <button
                    type="button"
                    className="admin-shell__icon-btn"
                    onClick={() => toggle(popup)}
                    title={popup.status === "active" ? "השהיה" : "הפעלה"}
                  >
                    {popup.status === "active" ? <FaPause /> : <FaPlay />}
                  </button>
                  <button
                    type="button"
                    className="admin-shell__icon-btn"
                    onClick={() => duplicate(popup)}
                    title="שכפול"
                  >
                    <FaClone />
                  </button>
                  <button
                    type="button"
                    className="admin-shell__icon-btn"
                    onClick={() => remove(popup)}
                    title="מחיקה"
                  >
                    <FaTrash />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default PopupList;
