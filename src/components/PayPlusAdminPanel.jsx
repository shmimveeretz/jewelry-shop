import { useState, useCallback } from "react";
import axios from "axios";
import {
  FaLink,
  FaFileInvoiceDollar,
  FaPlus,
  FaTrash,
  FaSpinner,
  FaCheckCircle,
  FaExclamationCircle,
  FaExternalLinkAlt,
  FaCopy,
} from "react-icons/fa";
import { useToast } from "../context/ToastContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── Constants ─────────────────────────────────────────────────────────────────

const DOC_TYPES = [
  { value: "inv_tax_receipt", label: "חשבונית מס/קבלה  (inv_tax_receipt)" },
  { value: "inv_receipt", label: "קבלה  (inv_receipt)" },
  { value: "inv_tax", label: "חשבונית מס  (inv_tax)" },
  { value: "receipt", label: "קבלה פשוטה  (receipt)" },
  { value: "credit_inv", label: "חשבונית זיכוי  (credit_inv)" },
  { value: "proforma", label: "חשבונית עסקה  (proforma)" },
  { value: "quote", label: "הצעת מחיר  (quote)" },
  { value: "delivery_note", label: "תעודת משלוח  (delivery_note)" },
];

const EMPTY_ITEM = { name: "", quantity: 1, price: "" };

// ── Helpers ───────────────────────────────────────────────────────────────────

const getToken = () => localStorage.getItem("token");

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeading({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
        <Icon className="text-amber-600 text-lg" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
      <FaExclamationCircle className="inline" /> {msg}
    </p>
  );
}

function ResultBanner({ result, onClose }) {
  if (!result) return null;
  const isSuccess = result.type === "success";
  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border mb-6 ${
        isSuccess
          ? "bg-green-50 border-green-200 text-green-800"
          : "bg-red-50 border-red-200 text-red-800"
      }`}
    >
      {isSuccess ? (
        <FaCheckCircle className="mt-0.5 text-green-500 flex-shrink-0" />
      ) : (
        <FaExclamationCircle className="mt-0.5 text-red-500 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium">{result.message}</p>
        {result.paymentUrl && (
          <a
            href={result.paymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-2 text-sm font-medium text-amber-700 underline underline-offset-2 hover:text-amber-900"
          >
            <FaExternalLinkAlt className="text-xs" /> פתח קישור תשלום
          </a>
        )}
        {result.documentUrl && (
          <a
            href={result.documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-2 text-sm font-medium text-amber-700 underline underline-offset-2 hover:text-amber-900"
          >
            <FaExternalLinkAlt className="text-xs" /> פתח מסמך
          </a>
        )}
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 text-lg leading-none"
        aria-label="סגור"
      >
        ×
      </button>
    </div>
  );
}

// ── Section 1: Generate Payment Link ─────────────────────────────────────────

function GeneratePaymentLink() {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Optional: amount + description for the link
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      e.amount = "יש להזין סכום תקין גדול מ-0";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleGenerate = async () => {
    if (!validate()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/payplus/payment-link`,
        {
          amount: parseFloat(amount),
          description: description.trim() || undefined,
        },
        { headers: { Authorization: `Bearer ${getToken()}` } },
      );
      const url =
        res.data?.data?.payment_page_link ||
        res.data?.paymentUrl ||
        res.data?.url;
      const msg = res.data?.message || "קישור תשלום נוצר בהצלחה";
      setResult({ type: "success", message: msg, paymentUrl: url });
      showSuccess(msg);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "שגיאה ביצירת קישור תשלום";
      setResult({ type: "error", message: msg });
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (result?.paymentUrl) {
      navigator.clipboard
        .writeText(result.paymentUrl)
        .then(() => showSuccess("הקישור הועתק ללוח"));
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <SectionHeading
        icon={FaLink}
        title="יצירת קישור תשלום"
        subtitle="שלח ללקוח קישור לדף תשלום מאובטח של PayPlus"
      />

      <ResultBanner result={result} onClose={() => setResult(null)} />

      {/* Inline copy chip when we have a URL */}
      {result?.type === "success" && result.paymentUrl && (
        <div className="flex items-center gap-2 mb-5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          <span className="flex-1 text-sm text-gray-700 truncate">
            {result.paymentUrl}
          </span>
          <button
            onClick={copyLink}
            title="העתק קישור"
            className="flex-shrink-0 text-amber-600 hover:text-amber-800 transition-colors"
          >
            <FaCopy />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            סכום (₪) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              if (errors.amount)
                setErrors((p) => ({ ...p, amount: undefined }));
            }}
            className={`w-full rounded-lg border px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition ${
              errors.amount
                ? "border-red-400 bg-red-50"
                : "border-gray-300 bg-white"
            }`}
          />
          <FieldError msg={errors.amount} />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            תיאור (אופציונלי)
          </label>
          <input
            type="text"
            placeholder="למשל: תשלום עבור הזמנה #123"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
          />
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm"
      >
        {loading ? <FaSpinner className="animate-spin" /> : <FaLink />}
        {loading ? "יוצר קישור..." : "צור קישור תשלום"}
      </button>
    </div>
  );
}

// ── Section 2: Create Manual Document ────────────────────────────────────────

function CreateManualDocument() {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});

  const [docType, setDocType] = useState("inv_tax_receipt");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);

  // ── Items helpers ──────────────────────────────────────────────────────────

  const addItem = () => setItems((prev) => [...prev, { ...EMPTY_ITEM }]);

  const removeItem = useCallback(
    (idx) => setItems((prev) => prev.filter((_, i) => i !== idx)),
    [],
  );

  const updateItem = useCallback((idx, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)),
    );
    // Clear item-level errors on change
    setErrors((prev) => {
      if (!prev.items?.[idx]) return prev;
      const newItemErrors = [...(prev.items || [])];
      newItemErrors[idx] = { ...newItemErrors[idx], [field]: undefined };
      return { ...prev, items: newItemErrors };
    });
  }, []);

  // ── Totals ─────────────────────────────────────────────────────────────────

  const subtotal = items.reduce((sum, item) => {
    return (
      sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0)
    );
  }, 0);
  const vat = subtotal * 0.18;
  const total = subtotal + vat;

  // ── Validation ─────────────────────────────────────────────────────────────

  const validate = () => {
    const e = {};
    if (!customerName.trim()) e.customerName = "שם לקוח נדרש";
    if (!customerEmail.trim()) e.customerEmail = "אימייל נדרש";
    else if (!validateEmail(customerEmail))
      e.customerEmail = "פורמט אימייל לא תקין";

    const itemErrors = items.map((item) => {
      const ie = {};
      if (!item.name.trim()) ie.name = "שם פריט נדרש";
      if (!item.price || parseFloat(item.price) <= 0)
        ie.price = "מחיר > 0 נדרש";
      if (!item.quantity || parseFloat(item.quantity) <= 0)
        ie.quantity = "כמות > 0 נדרשת";
      return ie;
    });

    if (itemErrors.some((ie) => Object.keys(ie).length > 0))
      e.items = itemErrors;
    setErrors(e);

    const itemsValid =
      !e.items || e.items.every((ie) => Object.keys(ie).length === 0);
    return (
      Object.keys(e).filter((k) => k !== "items").length === 0 && itemsValid
    );
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setResult(null);

    try {
      const payload = {
        docType,
        customer: {
          name: customerName.trim(),
          email: customerEmail.trim(),
        },
        items: items.map((item) => ({
          name: item.name.trim(),
          quantity: parseFloat(item.quantity),
          price: parseFloat(item.price),
        })),
      };

      const res = await axios.post(
        `${API_BASE_URL}/api/payplus/manual-document`,
        payload,
        { headers: { Authorization: `Bearer ${getToken()}` } },
      );

      const msg = res.data?.message || "המסמך נוצר בהצלחה";
      const documentUrl =
        res.data?.data?.documentUrl ||
        res.data?.documentUrl ||
        res.data?.data?.document_url;

      setResult({ type: "success", message: msg, documentUrl });
      showSuccess(msg);

      // Reset form on success
      setCustomerName("");
      setCustomerEmail("");
      setItems([{ ...EMPTY_ITEM }]);
      setErrors({});
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "שגיאה ביצירת המסמך";
      setResult({ type: "error", message: msg });
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <SectionHeading
        icon={FaFileInvoiceDollar}
        title="יצירת מסמך ידני"
        subtitle="הפק חשבוניות, קבלות ומסמכים ידנית דרך PayPlus"
      />

      <ResultBanner result={result} onClose={() => setResult(null)} />

      <form onSubmit={handleSubmit} noValidate>
        {/* ── Row 1: Doc type + customer ─────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          {/* Doc Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              סוג מסמך <span className="text-red-500">*</span>
            </label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
            >
              {DOC_TYPES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Customer Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              שם לקוח <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="ישראל ישראלי"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                if (errors.customerName)
                  setErrors((p) => ({ ...p, customerName: undefined }));
              }}
              className={`w-full rounded-lg border px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition ${
                errors.customerName
                  ? "border-red-400 bg-red-50"
                  : "border-gray-300 bg-white"
              }`}
            />
            <FieldError msg={errors.customerName} />
          </div>

          {/* Customer Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              אימייל לקוח <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="customer@example.com"
              value={customerEmail}
              onChange={(e) => {
                setCustomerEmail(e.target.value);
                if (errors.customerEmail)
                  setErrors((p) => ({ ...p, customerEmail: undefined }));
              }}
              className={`w-full rounded-lg border px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition ${
                errors.customerEmail
                  ? "border-red-400 bg-red-50"
                  : "border-gray-300 bg-white"
              }`}
            />
            <FieldError msg={errors.customerEmail} />
          </div>
        </div>

        {/* ── Items table ────────────────────────────────────────────────── */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              פריטים <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 hover:text-amber-900 border border-amber-300 hover:border-amber-500 bg-amber-50 hover:bg-amber-100 rounded-lg px-3 py-1.5 transition-colors"
            >
              <FaPlus className="text-xs" /> הוסף פריט
            </button>
          </div>

          {/* Header row */}
          <div className="hidden sm:grid grid-cols-[1fr_90px_110px_36px] gap-2 mb-1 px-1">
            {["שם פריט", "כמות", "מחיר (₪)", ""].map((h) => (
              <span
                key={h}
                className="text-xs font-semibold text-gray-500 uppercase tracking-wide"
              >
                {h}
              </span>
            ))}
          </div>

          <div className="space-y-2">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 sm:grid-cols-[1fr_90px_110px_36px] gap-2 items-start"
              >
                {/* Item Name */}
                <div>
                  <input
                    type="text"
                    placeholder="שם פריט"
                    value={item.name}
                    onChange={(e) => updateItem(idx, "name", e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition ${
                      errors.items?.[idx]?.name
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300 bg-white"
                    }`}
                  />
                  <FieldError msg={errors.items?.[idx]?.name} />
                </div>

                {/* Quantity */}
                <div>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(idx, "quantity", e.target.value)
                    }
                    className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition ${
                      errors.items?.[idx]?.quantity
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300 bg-white"
                    }`}
                  />
                  <FieldError msg={errors.items?.[idx]?.quantity} />
                </div>

                {/* Price */}
                <div>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={item.price}
                    onChange={(e) => updateItem(idx, "price", e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition ${
                      errors.items?.[idx]?.price
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300 bg-white"
                    }`}
                  />
                  <FieldError msg={errors.items?.[idx]?.price} />
                </div>

                {/* Remove */}
                <div className="flex items-center justify-center pt-1.5">
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    disabled={items.length === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                    title="הסר פריט"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Totals summary ─────────────────────────────────────────────── */}
        <div className="bg-gray-50 rounded-xl border border-gray-100 px-5 py-4 mb-6">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>סכום לפני מע"מ</span>
              <span>{subtotal.toFixed(2)} ₪</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>מע"מ (18%)</span>
              <span>{vat.toFixed(2)} ₪</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-1.5 mt-1.5">
              <span>סה"כ לתשלום</span>
              <span className="text-amber-600">{total.toFixed(2)} ₪</span>
            </div>
          </div>
        </div>

        {/* ── Submit ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            {loading ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaFileInvoiceDollar />
            )}
            {loading ? "יוצר מסמך..." : "צור מסמך"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function PayPlusAdminPanel() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8" dir="rtl">
      {/* Page header */}
      <div className="pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">PayPlus — לוח בקרה</h1>
        <p className="text-sm text-gray-500 mt-1">
          ניהול תשלומים ומסמכים דרך PayPlus API
        </p>
      </div>

      <GeneratePaymentLink />
      <CreateManualDocument />
    </div>
  );
}
