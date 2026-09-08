import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaThumbtack,
  FaEye,
  FaEyeSlash,
  FaSlidersH,
  FaChevronRight,
  FaUndo,
} from "react-icons/fa";
import SortableList from "./components/SortableList";
import { hiddenNavItems, resolveNavItems } from "./navRegistry";
import { useAdminPreference } from "./AdminPreferenceContext";

function AdminSidebar({ role }) {
  const { preference, updateSidebar, reset } = useAdminPreference();
  const [isCustomizing, setCustomizing] = useState(false);

  const sidebar = preference.sidebar || {};
  const items = resolveNavItems(role, sidebar);
  const hidden = hiddenNavItems(role, sidebar);

  const patch = (changes) => updateSidebar({ ...sidebar, ...changes });

  const handleReorder = (next) =>
    patch({ order: next.map((item) => item.key) });

  const toggleIn = (listName, key) => {
    const current = new Set(sidebar[listName] || []);
    if (current.has(key)) {
      current.delete(key);
    } else {
      current.add(key);
    }
    patch({ [listName]: [...current] });
  };

  const toggleHidden = (key) => toggleIn("hidden", key);
  const togglePinned = (key) => toggleIn("pinned", key);

  return (
    <aside className="admin-shell__sidebar">
      <div className="admin-shell__sidebar-head">
        <span className="admin-shell__sidebar-title">ניווט</span>
        <button
          type="button"
          className="admin-shell__icon-btn"
          onClick={() => setCustomizing((value) => !value)}
          aria-pressed={isCustomizing}
          title={isCustomizing ? "סיום התאמה אישית" : "התאמה אישית של הסרגל"}
        >
          <FaSlidersH />
        </button>
      </div>

      <SortableList
        items={items}
        onReorder={handleReorder}
        disabled={!isCustomizing}
        className="admin-shell__nav"
        renderItem={(item, index, { ref, style, handleProps }) => {
          const Icon = item.icon;

          return (
            <div ref={ref} style={style} className="admin-shell__nav-row">
              {isCustomizing ? (
                <>
                  {/* Grab handle only in customize mode, so normal use is
                      plain clicking. */}
                  <button
                    type="button"
                    className="admin-shell__grip"
                    aria-label={`שינוי מיקום: ${item.label}`}
                    {...handleProps}
                  >
                    ⠿
                  </button>
                  <span className="admin-shell__nav-label">{item.label}</span>
                  <button
                    type="button"
                    className={`admin-shell__icon-btn ${item.pinned ? "is-on" : ""}`}
                    onClick={() => togglePinned(item.key)}
                    title="נעיצה לראש הרשימה"
                  >
                    <FaThumbtack />
                  </button>
                  <button
                    type="button"
                    className="admin-shell__icon-btn"
                    onClick={() => toggleHidden(item.key)}
                    title="הסתרה"
                  >
                    <FaEyeSlash />
                  </button>
                </>
              ) : (
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `admin-shell__nav-link ${isActive ? "is-active" : ""}`
                  }
                >
                  <Icon className="admin-shell__nav-icon" />
                  <span>
                    {item.label}
                    {item.description ? (
                      <small className="admin-shell__nav-desc">
                        {item.description}
                      </small>
                    ) : null}
                  </span>
                  <FaChevronRight className="admin-shell__nav-chevron" />
                </NavLink>
              )}
            </div>
          );
        }}
      />

      {isCustomizing && hidden.length > 0 ? (
        <div className="admin-shell__hidden">
          <p className="admin-shell__hidden-title">מוסתרים</p>
          {hidden.map((item) => (
            <button
              key={item.key}
              type="button"
              className="admin-shell__hidden-item"
              onClick={() => toggleHidden(item.key)}
            >
              <FaEye />
              {item.label}
            </button>
          ))}
        </div>
      ) : null}

      {isCustomizing ? (
        <button type="button" className="admin-shell__reset" onClick={reset}>
          <FaUndo />
          איפוס לברירת המחדל
        </button>
      ) : null}
    </aside>
  );
}

export default AdminSidebar;
