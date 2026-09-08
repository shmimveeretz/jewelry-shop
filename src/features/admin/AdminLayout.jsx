import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaStore } from "react-icons/fa";
import { useToast } from "../../context/ToastContext";
import { AdminPreferenceProvider } from "./AdminPreferenceContext";
import AdminSidebar from "./AdminSidebar";
import "../../styles/admin/AdminShell.css";

/**
 * The admin shell: header, sidebar, and an <Outlet /> for whichever module is
 * routed. Everything that used to live in the 3,500-line Admin.jsx now sits
 * behind /admin/store as LegacyAdminView, untouched.
 *
 * The role check here is a UX affordance, not a security boundary — every
 * admin endpoint enforces the same roles server-side.
 */
function AdminLayout() {
  const navigate = useNavigate();
  const { showError } = useToast();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      navigate("/login");
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      if (parsed.role !== "admin" && parsed.role !== "roi") {
        showError("אין לך הרשאה לגשת לדף זה");
        navigate("/");
        return;
      }
      setUser(parsed);
    } catch {
      navigate("/login");
    }
  }, [navigate, showError]);

  if (!user) {
    return (
      <div className="admin-shell__booting">
        <p>טוען...</p>
      </div>
    );
  }

  return (
    <AdminPreferenceProvider onError={showError}>
      <div className="admin-shell" dir="rtl">
        <header className="admin-shell__header">
          <div className="admin-shell__brand">
            <span className="admin-shell__brand-name">שמים וארץ</span>
            <span className="admin-shell__brand-sub">מרכז ניהול</span>
          </div>

          <div className="admin-shell__header-actions">
            <span className="admin-shell__user">
              {user.firstName || user.email}
              <small>{user.role === "roi" ? "מנהל על" : "מנהל"}</small>
            </span>
            <button
              type="button"
              className="admin-shell__ghost-btn"
              onClick={() => navigate("/")}
            >
              <FaStore />
              לחנות
            </button>
            <button
              type="button"
              className="admin-shell__ghost-btn"
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
              }}
            >
              <FaSignOutAlt />
              יציאה
            </button>
          </div>
        </header>

        <div className="admin-shell__body">
          <AdminSidebar role={user.role} />
          <main className="admin-shell__content">
            <Outlet context={{ user }} />
          </main>
        </div>
      </div>
    </AdminPreferenceProvider>
  );
}

export default AdminLayout;
