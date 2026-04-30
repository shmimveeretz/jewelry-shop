import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  FaEnvelopeOpenText,
  FaPaperPlane,
  FaSearch,
  FaSpinner,
  FaToggleOn,
  FaTrash,
  FaUsers,
  FaCalendarAlt,
  FaCheckCircle,
  FaExclamationCircle,
  FaRegEnvelope,
} from "react-icons/fa";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../contexts/LanguageContext";
import "../styles/components/AdminPanel.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const getToken = () => localStorage.getItem("token");
const authHeaders = () => ({ Authorization: `Bearer ${getToken()}` });

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("he-IL", { year: "numeric", month: "short", day: "numeric" });
}

function StatCard({ icon: Icon, value, label, iconClass = "ap-stat-card__icon--amber" }) {
  return (
    <div className="ap-stat-card">
      <div className={`ap-stat-card__icon ${iconClass}`}><Icon /></div>
      <div>
        <p className="ap-stat-card__value">{value}</p>
        <p className="ap-stat-card__label">{label}</p>
      </div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange, loading, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      disabled={loading}
      className={`ap-toggle ${checked ? "ap-toggle--on" : "ap-toggle--off"}`}
    >
      <span className="ap-toggle__knob" />
      {loading && <FaSpinner className="ap-spin" style={{ position: "absolute", inset: 0, margin: "auto", color: "#fff", fontSize: "0.6rem" }} />}
    </button>
  );
}

function ResultBanner({ result, onClose }) {
  if (!result) return null;
  const ok = result.type === "success";
  return (
    <div className={`ap-banner ${ok ? "ap-banner--success" : "ap-banner--error"}`}>
      {ok
        ? <FaCheckCircle style={{ flexShrink: 0, marginTop: 2 }} />
        : <FaExclamationCircle style={{ flexShrink: 0, marginTop: 2 }} />}
      <p className="ap-banner__body" style={{ margin: 0 }}>{result.message}</p>
      <button onClick={onClose} className="ap-banner__close" aria-label="סגור">×</button>
    </div>
  );
}

function ComposeEmail({ subscriberCount }) {
  const { showSuccess, showError } = useToast();
  const { language } = useLanguage();
  const he = language === "he";

  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!subject.trim()) e.subject = he ? "נושא הודעה נדרש" : "Subject is required";
    if (!content.trim()) e.content = he ? "תוכן ההודעה נדרש" : "Message content is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSending(true);
    setResult(null);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/newsletter/send`,
        { subject: subject.trim(), content: content.trim() },
        { headers: { ...authHeaders(), "Content-Type": "application/json" } },
      );
      const msg = res.data?.message || (he ? `נשלח בהצלחה ל-${subscriberCount} מנויים` : `Sent successfully to ${subscriberCount} subscribers`);
      setResult({ type: "success", message: msg });
      showSuccess(msg);
      setSubject(""); setContent(""); setErrors({});
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || (he ? "שגיאה בשליחת הניוזלטר" : "Failed to send newsletter");
      setResult({ type: "error", message: msg });
      showError(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="ap-card">
      <div className="ap-compose-hdr">
        <div className="ap-compose-hdr__icon"><FaEnvelopeOpenText /></div>
        <div>
          <h2 className="ap-compose-hdr__title">{he ? "כתיבת ניוזלטר" : "Compose Newsletter"}</h2>
          <p className="ap-compose-hdr__sub">
            {he ? `ישלח לכל ${subscriberCount} המנויים הפעילים` : `Will be sent to all ${subscriberCount} active subscribers`}
          </p>
        </div>
      </div>

      <ResultBanner result={result} onClose={() => setResult(null)} />

      <form onSubmit={handleSend} noValidate>
        <div className={`ap-field${errors.subject ? " ap-field--error" : ""}`}>
          <label>{he ? "נושא *" : "Subject *"}</label>
          <input type="text" value={subject}
            onChange={(e) => { setSubject(e.target.value); if (errors.subject) setErrors((p) => ({ ...p, subject: undefined })); }}
            placeholder={he ? "נושא ההודעה…" : "Email subject…"} />
          {errors.subject && <p className="ap-field-error"><FaExclamationCircle /> {errors.subject}</p>}
        </div>

        <div className={`ap-field${errors.content ? " ap-field--error" : ""}`}>
          <label>{he ? "תוכן ההודעה (HTML) *" : "Message Content (HTML) *"}</label>
          <textarea rows={10} value={content}
            onChange={(e) => { setContent(e.target.value); if (errors.content) setErrors((p) => ({ ...p, content: undefined })); }}
            placeholder={he ? "<p>שלום {{שם}},</p>\n<p>…</p>" : "<p>Hello {{name}},</p>\n<p>…</p>"}
            style={{ fontFamily: "monospace", resize: "vertical" }} />
          {errors.content && <p className="ap-field-error"><FaExclamationCircle /> {errors.content}</p>}
          <p className="ap-hint">{he ? "ניתן להשתמש ב-HTML. {{name}} יוחלף בשם הנמען." : "HTML is supported. Use {{name}} to personalize."}</p>
        </div>

        <div className="ap-send-footer">
          <p>* {he ? "שדות חובה" : "Required fields"}</p>
          <button type="submit" disabled={sending || subscriberCount === 0} className="ap-btn-primary">
            {sending ? <><FaSpinner className="ap-spin" /> {he ? "שולח…" : "Sending…"}</> : <><FaPaperPlane /> {he ? `שלח לכל המנויים (${subscriberCount})` : `Send to All Subscribers (${subscriberCount})`}</>}
          </button>
        </div>
      </form>
    </div>
  );
}

function SubscribersTable({ subscribers, loading, onToggle, onDelete, togglingIds }) {
  const { language } = useLanguage();
  const he = language === "he";
  const [search, setSearch] = useState("");

  const filtered = subscribers.filter((s) => {
    const q = search.toLowerCase();
    return (
      (s.email || "").toLowerCase().includes(q) ||
      (s.firstname || s.name || "").toLowerCase().includes(q) ||
      (s.lastname || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="ap-table-wrap">
      <div className="ap-table-bar">
        <div className="ap-table-bar__title">
          <FaUsers style={{ color: "#f59e0b" }} />
          <span>{he ? "רשימת מנויים" : "Subscribers List"}</span>
          <span className="ap-table-bar__badge">{subscribers.length}</span>
        </div>
        <div className="ap-search-wrap">
          <FaSearch className="ap-search-icon" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={he ? "חיפוש…" : "Search…"}
            style={{ direction: he ? "rtl" : "ltr" }}
          />
        </div>
      </div>

      {loading ? (
        <div className="ap-table-loading">
          <FaSpinner className="ap-spin" />
          <span>{he ? "טוען…" : "Loading…"}</span>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="ap-subscribers-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>#</th>
                <th>{he ? "שם" : "Name"}</th>
                <th>{he ? "אימייל" : "Email"}</th>
                <th className="center">{he ? "מנוי לניוזלטר" : "Subscribed"}</th>
                <th>{he ? "תאריך" : "Date"}</th>
                <th className="center">{he ? "פעולות" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="td-empty">
                    <FaRegEnvelope style={{ display: "block", margin: "0 auto 0.5rem", fontSize: "2rem", opacity: 0.35 }} />
                    <p style={{ margin: 0 }}>{he ? "אין מנויים" : "No subscribers found"}</p>
                  </td>
                </tr>
              ) : (
                filtered.map((sub, idx) => {
                  const id = sub._id || sub.id;
                  const isSubscribed = sub.newsletterSubscribed ?? sub.subscribed ?? true;
                  const name = [sub.firstname, sub.lastname].filter(Boolean).join(" ") || sub.name || sub.email;
                  return (
                    <tr key={id}>
                      <td className="td-num">{idx + 1}</td>
                      <td className="td-name">{name}</td>
                      <td>{sub.email}</td>
                      <td className="center">
                        <ToggleSwitch
                          checked={isSubscribed}
                          loading={togglingIds.has(id)}
                          onChange={() => onToggle(id, !isSubscribed)}
                          label={isSubscribed ? "Unsubscribe" : "Subscribe"}
                        />
                      </td>
                      <td className="td-date">
                        <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          <FaCalendarAlt style={{ opacity: 0.45, fontSize: "0.75rem" }} />
                          {formatDate(sub.subscribedAt || sub.createdAt)}
                        </span>
                      </td>
                      <td className="center">
                        <button onClick={() => onDelete(id)} className="ap-del-btn" title={he ? "הסר מנוי" : "Remove subscriber"}>
                          <FaTrash style={{ fontSize: "0.75rem" }} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function NewsletterAdmin() {
  const { showSuccess, showError } = useToast();
  const { language } = useLanguage();
  const he = language === "he";

  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingIds, setTogglingIds] = useState(new Set());

  const hasFetched = useRef(false);
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchSubscribers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/newsletter/subscribers`, { headers: authHeaders() });
      setSubscribers(res.data?.data || res.data?.subscribers || []);
    } catch {
      showError(he ? "שגיאה בטעינת המנויים" : "Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = useCallback(async (id, newStatus) => {
    setTogglingIds((prev) => new Set(prev).add(id));
    try {
      await axios.patch(
        `${API_BASE_URL}/api/newsletter/subscribers/${id}/toggle`,
        { subscribed: newStatus },
        { headers: authHeaders() },
      );
      setSubscribers((prev) => prev.map((s) => (s._id || s.id) === id ? { ...s, newsletterSubscribed: newStatus, subscribed: newStatus } : s));
      showSuccess(newStatus ? (he ? "המנוי הופעל" : "Subscriber enabled") : (he ? "המנוי הושהה" : "Subscriber disabled"));
    } catch (err) {
      showError(err.response?.data?.message || (he ? "שגיאה בעדכון המנוי" : "Failed to update subscriber"));
    } finally {
      setTogglingIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
    }
  }, [he, showSuccess, showError]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm(he ? "האם אתה בטוח שברצונך למחוק מנוי זה?" : "Are you sure you want to remove this subscriber?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/newsletter/subscribers/${id}`, { headers: authHeaders() });
      setSubscribers((prev) => prev.filter((s) => (s._id || s.id) !== id));
      showSuccess(he ? "המנוי נמחק" : "Subscriber removed");
    } catch (err) {
      showError(err.response?.data?.message || (he ? "שגיאה במחיקת המנוי" : "Failed to remove subscriber"));
    }
  }, [he, showSuccess, showError]);

  const activeCount = subscribers.filter((s) => s.newsletterSubscribed ?? s.subscribed ?? true).length;
  const thisMonthCount = subscribers.filter((s) => {
    const d = new Date(s.subscribedAt || s.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="ap-wrap" dir={he ? "rtl" : "ltr"}>
      <div className="ap-page-heading">
        <h1>{he ? "ניהול ניוזלטר" : "Newsletter Management"}</h1>
        <p>{he ? "כתיבה ושליחה לכל המנויים, ניהול רשימת הנמענים" : "Compose & send campaigns, manage your subscriber list"}</p>
      </div>

      <div className="ap-stats-grid">
        <StatCard icon={FaUsers} value={subscribers.length} label={he ? 'סה"כ מנויים' : "Total Subscribers"} iconClass="ap-stat-card__icon--amber" />
        <StatCard icon={FaToggleOn} value={activeCount} label={he ? "מנויים פעילים" : "Active Subscribers"} iconClass="ap-stat-card__icon--green" />
        <StatCard icon={FaCalendarAlt} value={thisMonthCount} label={he ? "הצטרפו החודש" : "Joined This Month"} iconClass="ap-stat-card__icon--blue" />
      </div>

      <ComposeEmail subscriberCount={activeCount} />

      <SubscribersTable
        subscribers={subscribers}
        loading={loading}
        onToggle={handleToggle}
        onDelete={handleDelete}
        togglingIds={togglingIds}
      />
    </div>
  );
}