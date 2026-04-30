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
import "../styles/components/AdminPanel.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
const getToken = () => localStorage.getItem("token");
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function SectionHeading({ icon: Icon, title, subtitle }) {
  return (
    <div className="ap-heading">
      <div className="ap-heading__icon"><Icon /></div>
      <div>
        <h2 className="ap-heading__title">{title}</h2>
        {subtitle && <p className="ap-heading__sub">{subtitle}</p>}
      </div>
    </div>
  );
}

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <p className="ap-field-error"><FaExclamationCircle /> {msg}</p>
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
      <div className="ap-banner__body">
        <p style={{ margin: 0 }}>{result.message}</p>
        {result.paymentUrl && (
          <a href={result.paymentUrl} target="_blank" rel="noopener noreferrer" className="ap-banner__link">
            <FaExternalLinkAlt style={{ fontSize: "0.7rem" }} /> פתח קישור תשלום
          </a>
        )}
        {result.documentUrl && (
          <a href={result.documentUrl} target="_blank" rel="noopener noreferrer" className="ap-banner__link">
            <FaExternalLinkAlt style={{ fontSize: "0.7rem" }} /> פתח מסמך
          </a>
        )}
      </div>
      <button onClick={onClose} className="ap-banner__close" aria-label="סגור">×</button>
    </div>
  );
}

function GeneratePaymentLink() {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0)
      e.amount = "יש להזין סכום תקין גדול מ-0";
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
        { amount: parseFloat(amount), description: description.trim() || undefined },
        { headers: { Authorization: `Bearer ${getToken()}` } },
      );
      const url = res.data?.data?.payment_page_link || res.data?.paymentUrl || res.data?.url;
      const msg = res.data?.message || "קישור תשלום נוצר בהצלחה";
      setResult({ type: "success", message: msg, paymentUrl: url });
      showSuccess(msg);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || "שגיאה ביצירת קישור תשלום";
      setResult({ type: "error", message: msg });
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (result?.paymentUrl)
      navigator.clipboard.writeText(result.paymentUrl).then(() => showSuccess("הקישור הועתק ללוח"));
  };

  return (
    <div className="ap-card">
      <SectionHeading icon={FaLink} title="יצירת קישור תשלום" subtitle="שלח ללקוח קישור לדף תשלום מאובטח של PayPlus" />
      <ResultBanner result={result} onClose={() => setResult(null)} />
      {result?.type === "success" && result.paymentUrl && (
        <div className="ap-copy-chip">
          <span className="ap-copy-chip__url">{result.paymentUrl}</span>
          <button onClick={copyLink} className="ap-copy-chip__btn" title="העתק קישור"><FaCopy /></button>
        </div>
      )}
      <div className="ap-grid-2">
        <div className={`ap-field${errors.amount ? " ap-field--error" : ""}`}>
          <label>סכום (&#8362;) <span style={{ color: "#ef4444" }}>*</span></label>
          <input type="number" min="0.01" step="0.01" placeholder="0.00" value={amount}
            onChange={(e) => { setAmount(e.target.value); if (errors.amount) setErrors((p) => ({ ...p, amount: undefined })); }} />
          <FieldError msg={errors.amount} />
        </div>
        <div className="ap-field">
          <label>תיאור (אופציונלי)</label>
          <input type="text" placeholder="למשל: תשלום עבור הזמנה #123" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
      </div>
      <button onClick={handleGenerate} disabled={loading} className="ap-btn-primary">
        {loading ? <FaSpinner className="ap-spin" /> : <FaLink />}
        {loading ? "יוצר קישור..." : "צור קישור תשלום"}
      </button>
    </div>
  );
}

function CreateManualDocument() {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [docType, setDocType] = useState("inv_tax_receipt");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);

  const addItem = () => setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  const removeItem = useCallback((idx) => setItems((prev) => prev.filter((_, i) => i !== idx)), []);
  const updateItem = useCallback((idx, field, value) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
    setErrors((prev) => {
      if (!prev.items?.[idx]) return prev;
      const ne = [...(prev.items || [])];
      ne[idx] = { ...ne[idx], [field]: undefined };
      return { ...prev, items: ne };
    });
  }, []);

  const subtotal = items.reduce((s, it) => s + (parseFloat(it.quantity) || 0) * (parseFloat(it.price) || 0), 0);
  const vat = subtotal * 0.18;
  const total = subtotal + vat;

  const validate = () => {
    const e = {};
    if (!customerName.trim()) e.customerName = "שם לקוח נדרש";
    if (!customerEmail.trim()) e.customerEmail = "אימייל נדרש";
    else if (!validateEmail(customerEmail)) e.customerEmail = "פורמט אימייל לא תקין";
    const itemErrors = items.map((item) => {
      const ie = {};
      if (!item.name.trim()) ie.name = "שם פריט נדרש";
      if (!item.price || parseFloat(item.price) <= 0) ie.price = "מחיר > 0 נדרש";
      if (!item.quantity || parseFloat(item.quantity) <= 0) ie.quantity = "כמות > 0 נדרשת";
      return ie;
    });
    if (itemErrors.some((ie) => Object.keys(ie).length > 0)) e.items = itemErrors;
    setErrors(e);
    const itemsValid = !e.items || e.items.every((ie) => Object.keys(ie).length === 0);
    return Object.keys(e).filter((k) => k !== "items").length === 0 && itemsValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/payplus/manual-document`,
        {
          docType,
          customer: { name: customerName.trim(), email: customerEmail.trim() },
          items: items.map((it) => ({ name: it.name.trim(), quantity: parseFloat(it.quantity), price: parseFloat(it.price) })),
        },
        { headers: { Authorization: `Bearer ${getToken()}` } },
      );
      const msg = res.data?.message || "המסמך נוצר בהצלחה";
      const documentUrl = res.data?.data?.documentUrl || res.data?.documentUrl || res.data?.data?.document_url;
      setResult({ type: "success", message: msg, documentUrl });
      showSuccess(msg);
      setCustomerName(""); setCustomerEmail(""); setItems([{ ...EMPTY_ITEM }]); setErrors({});
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || "שגיאה ביצירת המסמך";
      setResult({ type: "error", message: msg });
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ap-card">
      <SectionHeading icon={FaFileInvoiceDollar} title="יצירת מסמך ידני" subtitle="הפק חשבוניות, קבלות ומסמכים ידנית דרך PayPlus" />
      <ResultBanner result={result} onClose={() => setResult(null)} />
      <form onSubmit={handleSubmit} noValidate>
        <div className="ap-grid-3">
          <div className="ap-field">
            <label>סוג מסמך <span style={{ color: "#ef4444" }}>*</span></label>
            <select value={docType} onChange={(e) => setDocType(e.target.value)}>
              {DOC_TYPES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
          <div className={`ap-field${errors.customerName ? " ap-field--error" : ""}`}>
            <label>שם לקוח <span style={{ color: "#ef4444" }}>*</span></label>
            <input type="text" placeholder="ישראל ישראלי" value={customerName}
              onChange={(e) => { setCustomerName(e.target.value); if (errors.customerName) setErrors((p) => ({ ...p, customerName: undefined })); }} />
            <FieldError msg={errors.customerName} />
          </div>
          <div className={`ap-field${errors.customerEmail ? " ap-field--error" : ""}`}>
            <label>אימייל לקוח <span style={{ color: "#ef4444" }}>*</span></label>
            <input type="email" placeholder="customer@example.com" value={customerEmail}
              onChange={(e) => { setCustomerEmail(e.target.value); if (errors.customerEmail) setErrors((p) => ({ ...p, customerEmail: undefined })); }} />
            <FieldError msg={errors.customerEmail} />
          </div>
        </div>

        <div style={{ marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151" }}>
              פריטים <span style={{ color: "#ef4444" }}>*</span>
            </span>
            <button type="button" onClick={addItem} className="ap-btn-outline-sm"><FaPlus /> הוסף פריט</button>
          </div>
          <div className="ap-items-header">
            {["שם פריט", "כמות", "מחיר (&#8362;)", ""].map((h) => <span key={h} dangerouslySetInnerHTML={{ __html: h }} />)}
          </div>
          {items.map((item, idx) => (
            <div key={idx} className="ap-item-row">
              <div className={`ap-field${errors.items?.[idx]?.name ? " ap-field--error" : ""}`} style={{ marginBottom: 0 }}>
                <input type="text" placeholder="שם פריט" value={item.name} onChange={(e) => updateItem(idx, "name", e.target.value)} />
                <FieldError msg={errors.items?.[idx]?.name} />
              </div>
              <div className={`ap-field${errors.items?.[idx]?.quantity ? " ap-field--error" : ""}`} style={{ marginBottom: 0 }}>
                <input type="number" min="1" step="1" placeholder="1" value={item.quantity} onChange={(e) => updateItem(idx, "quantity", e.target.value)} />
                <FieldError msg={errors.items?.[idx]?.quantity} />
              </div>
              <div className={`ap-field${errors.items?.[idx]?.price ? " ap-field--error" : ""}`} style={{ marginBottom: 0 }}>
                <input type="number" min="0.01" step="0.01" placeholder="0.00" value={item.price} onChange={(e) => updateItem(idx, "price", e.target.value)} />
                <FieldError msg={errors.items?.[idx]?.price} />
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", paddingTop: "0.25rem" }}>
                <button type="button" onClick={() => removeItem(idx)} disabled={items.length === 1} className="ap-btn-icon-del" title="הסר פריט">
                  <FaTrash style={{ fontSize: "0.75rem" }} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="ap-totals">
          <div className="ap-totals-row"><span>סכום לפני מע"מ</span><span>{subtotal.toFixed(2)} &#8362;</span></div>
          <div className="ap-totals-row"><span>מע"מ (18%)</span><span>{vat.toFixed(2)} &#8362;</span></div>
          <div className="ap-totals-row ap-totals-row--total"><span>סה"כ לתשלום</span><span>{total.toFixed(2)} &#8362;</span></div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button type="submit" disabled={loading} className="ap-btn-primary">
            {loading ? <FaSpinner className="ap-spin" /> : <FaFileInvoiceDollar />}
            {loading ? "יוצר מסמך..." : "צור מסמך"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function PayPlusAdminPanel() {
  return (
    <div className="ap-wrap" dir="rtl">
      <div className="ap-page-heading">
        <h1>PayPlus — לוח בקרה</h1>
        <p>ניהול תשלומים ומסמכים דרך PayPlus API</p>
      </div>
      <GeneratePaymentLink />
      <CreateManualDocument />
    </div>
  );
}