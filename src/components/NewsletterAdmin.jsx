import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  FaEnvelopeOpenText,
  FaPaperPlane,
  FaSearch,
  FaSpinner,
  FaToggleOff,
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

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── helpers ───────────────────────────────────────────────────────────────────

const getToken = () => localStorage.getItem("token");
const authHeaders = () => ({ Authorization: `Bearer ${getToken()}` });

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("he-IL", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, value, label, color = "text-amber-600" }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
        <Icon className={`text-xl ${color}`} />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-gray-900 leading-none">
          {value}
        </p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ── Toggle switch ─────────────────────────────────────────────────────────────

function ToggleSwitch({ checked, onChange, loading, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      disabled={loading}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1 disabled:opacity-50 ${
        checked ? "bg-green-500" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
      {loading && (
        <FaSpinner className="absolute inset-0 m-auto text-white text-xs animate-spin" />
      )}
    </button>
  );
}

// ── Result banner ─────────────────────────────────────────────────────────────

function ResultBanner({ result, onClose }) {
  if (!result) return null;
  const ok = result.type === "success";
  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border mb-5 ${
        ok
          ? "bg-green-50 border-green-200 text-green-800"
          : "bg-red-50 border-red-200 text-red-800"
      }`}
    >
      {ok ? (
        <FaCheckCircle className="mt-0.5 flex-shrink-0 text-green-500" />
      ) : (
        <FaExclamationCircle className="mt-0.5 flex-shrink-0 text-red-500" />
      )}
      <p className="flex-1 text-sm font-medium">{result.message}</p>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}

// ── Section 1: Compose & Send ─────────────────────────────────────────────────

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
    if (!subject.trim())
      e.subject = he ? "נושא הודעה נדרש" : "Subject is required";
    if (!content.trim())
      e.content = he ? "תוכן ההודעה נדרש" : "Message content is required";
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
      const msg =
        res.data?.message ||
        (he
          ? `נשלח בהצלחה ל-${subscriberCount} מנויים`
          : `Sent successfully to ${subscriberCount} subscribers`);
      setResult({ type: "success", message: msg });
      showSuccess(msg);
      setSubject("");
      setContent("");
      setErrors({});
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (he ? "שגיאה בשליחת הניוזלטר" : "Failed to send newsletter");
      setResult({ type: "error", message: msg });
      showError(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
      {/* Header */}
      <div className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
          <FaEnvelopeOpenText className="text-amber-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800">
            {he ? "כתיבת ניוזלטר" : "Compose Newsletter"}
          </h2>
          <p className="text-sm text-gray-500">
            {he
              ? `ישלח לכל ${subscriberCount} המנויים הפעילים`
              : `Will be sent to all ${subscriberCount} active subscribers`}
          </p>
        </div>
      </div>

      <ResultBanner result={result} onClose={() => setResult(null)} />

      <form onSubmit={handleSend} noValidate>
        {/* Subject */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {he ? "נושא *" : "Subject *"}
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              if (errors.subject)
                setErrors((p) => ({ ...p, subject: undefined }));
            }}
            placeholder={he ? "נושא ההודעה…" : "Email subject…"}
            className={`w-full rounded-lg border px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition ${
              errors.subject
                ? "border-red-400 bg-red-50"
                : "border-gray-300 bg-white"
            }`}
          />
          {errors.subject && (
            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
              <FaExclamationCircle /> {errors.subject}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {he ? "תוכן ההודעה (HTML) *" : "Message Content (HTML) *"}
          </label>
          <textarea
            rows={10}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (errors.content)
                setErrors((p) => ({ ...p, content: undefined }));
            }}
            placeholder={
              he
                ? "<p>שלום {{שם}},</p>\n<p>…</p>"
                : "<p>Hello {{name}},</p>\n<p>…</p>"
            }
            className={`w-full rounded-lg border px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition font-mono resize-y ${
              errors.content
                ? "border-red-400 bg-red-50"
                : "border-gray-300 bg-white"
            }`}
          />
          {errors.content && (
            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
              <FaExclamationCircle /> {errors.content}
            </p>
          )}
          <p className="mt-1.5 text-xs text-gray-400">
            {he
              ? "ניתן להשתמש ב-HTML. {{name}} יוחלף בשם הנמען."
              : "HTML is supported. Use {{name}} to personalize."}
          </p>
        </div>

        {/* Send button */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs text-gray-400">
            {he ? "* שדות חובה" : "* Required fields"}
          </p>
          <button
            type="submit"
            disabled={sending || subscriberCount === 0}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            {sending ? (
              <>
                <FaSpinner className="animate-spin" />
                {he ? "שולח…" : "Sending…"}
              </>
            ) : (
              <>
                <FaPaperPlane />
                {he
                  ? `שלח לכל המנויים (${subscriberCount})`
                  : `Send to All Subscribers (${subscriberCount})`}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Section 2: Subscribers table ──────────────────────────────────────────────

function SubscribersTable({
  subscribers,
  loading,
  onToggle,
  onDelete,
  togglingIds,
}) {
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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Table header bar */}
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100 flex-wrap">
        <div className="flex items-center gap-2">
          <FaUsers className="text-amber-500" />
          <h2 className="text-base font-bold text-gray-800">
            {he ? "רשימת מנויים" : "Subscribers List"}
          </h2>
          <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">
            {subscribers.length}
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={he ? "חיפוש…" : "Search…"}
            className="pr-8 pl-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 w-52"
            style={{ direction: he ? "rtl" : "ltr" }}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-14 text-gray-400 gap-2">
          <FaSpinner className="animate-spin" />
          <span>{he ? "טוען…" : "Loading…"}</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-right font-semibold text-gray-500 text-xs uppercase tracking-wide w-10">
                  #
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-500 text-xs uppercase tracking-wide">
                  {he ? "שם" : "Name"}
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-500 text-xs uppercase tracking-wide">
                  {he ? "אימייל" : "Email"}
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-500 text-xs uppercase tracking-wide">
                  {he ? "מנוי לניוזלטר" : "Subscribed"}
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-500 text-xs uppercase tracking-wide">
                  {he ? "תאריך" : "Date"}
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-500 text-xs uppercase tracking-wide">
                  {he ? "פעולות" : "Actions"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    <FaRegEnvelope className="mx-auto text-3xl mb-2 opacity-40" />
                    <p>{he ? "אין מנויים" : "No subscribers found"}</p>
                  </td>
                </tr>
              ) : (
                filtered.map((sub, idx) => {
                  const id = sub._id || sub.id;
                  const isSubscribed =
                    sub.newsletterSubscribed ?? sub.subscribed ?? true;
                  const name =
                    [sub.firstname, sub.lastname].filter(Boolean).join(" ") ||
                    sub.name ||
                    sub.email;

                  return (
                    <tr
                      key={id}
                      className="hover:bg-amber-50/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-800">
                          {name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{sub.email}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center">
                          <ToggleSwitch
                            checked={isSubscribed}
                            loading={togglingIds.has(id)}
                            onChange={() => onToggle(id, !isSubscribed)}
                            label={isSubscribed ? "Unsubscribe" : "Subscribe"}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        <span className="flex items-center gap-1">
                          <FaCalendarAlt className="opacity-50" />
                          {formatDate(sub.subscribedAt || sub.createdAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => onDelete(id)}
                          title={he ? "הסר מנוי" : "Remove subscriber"}
                          className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <FaTrash className="text-xs" />
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

// ── Main component ────────────────────────────────────────────────────────────

export default function NewsletterAdmin() {
  const { showSuccess, showError } = useToast();
  const { language } = useLanguage();
  const he = language === "he";

  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingIds, setTogglingIds] = useState(new Set());

  // Fetch once on mount
  const hasFetched = useRef(false);
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchSubscribers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/newsletter/subscribers`,
        {
          headers: authHeaders(),
        },
      );
      setSubscribers(res.data?.data || res.data?.subscribers || []);
    } catch (err) {
      showError(he ? "שגיאה בטעינת המנויים" : "Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  };

  // Toggle individual subscription status
  const handleToggle = useCallback(
    async (id, newStatus) => {
      setTogglingIds((prev) => new Set(prev).add(id));
      try {
        await axios.patch(
          `${API_BASE_URL}/api/newsletter/subscribers/${id}/toggle`,
          { subscribed: newStatus },
          { headers: authHeaders() },
        );
        setSubscribers((prev) =>
          prev.map((s) =>
            (s._id || s.id) === id
              ? { ...s, newsletterSubscribed: newStatus, subscribed: newStatus }
              : s,
          ),
        );
        showSuccess(
          newStatus
            ? he
              ? "המנוי הופעל"
              : "Subscriber enabled"
            : he
              ? "המנוי הושהה"
              : "Subscriber disabled",
        );
      } catch (err) {
        showError(
          err.response?.data?.message ||
            (he ? "שגיאה בעדכון המנוי" : "Failed to update subscriber"),
        );
      } finally {
        setTogglingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [he, showSuccess, showError],
  );

  // Delete subscriber
  const handleDelete = useCallback(
    async (id) => {
      if (
        !window.confirm(
          he
            ? "האם אתה בטוח שברצונך למחוק מנוי זה?"
            : "Are you sure you want to remove this subscriber?",
        )
      )
        return;

      try {
        await axios.delete(`${API_BASE_URL}/api/newsletter/subscribers/${id}`, {
          headers: authHeaders(),
        });
        setSubscribers((prev) => prev.filter((s) => (s._id || s.id) !== id));
        showSuccess(he ? "המנוי נמחק" : "Subscriber removed");
      } catch (err) {
        showError(
          err.response?.data?.message ||
            (he ? "שגיאה במחיקת המנוי" : "Failed to remove subscriber"),
        );
      }
    },
    [he, showSuccess, showError],
  );

  const activeCount = subscribers.filter(
    (s) => s.newsletterSubscribed ?? s.subscribed ?? true,
  ).length;

  const thisMonthCount = subscribers.filter((s) => {
    const d = new Date(s.subscribedAt || s.createdAt);
    const now = new Date();
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  }).length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8" dir={he ? "rtl" : "ltr"}>
      {/* Page heading */}
      <div className="pb-5 mb-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">
          {he ? "ניהול ניוזלטר" : "Newsletter Management"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {he
            ? "כתיבה ושליחה לכל המנויים, ניהול רשימת הנמענים"
            : "Compose & send campaigns, manage your subscriber list"}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={FaUsers}
          value={subscribers.length}
          label={he ? 'סה"כ מנויים' : "Total Subscribers"}
        />
        <StatCard
          icon={FaToggleOn}
          value={activeCount}
          label={he ? "מנויים פעילים" : "Active Subscribers"}
          color="text-green-600"
        />
        <StatCard
          icon={FaCalendarAlt}
          value={thisMonthCount}
          label={he ? "הצטרפו החודש" : "Joined This Month"}
          color="text-blue-500"
        />
      </div>

      {/* Compose section */}
      <ComposeEmail subscriberCount={activeCount} />

      {/* Subscribers table */}
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
