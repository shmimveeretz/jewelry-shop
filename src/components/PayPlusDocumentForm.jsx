import { useState } from "react";
import axios from "axios";
import {
  FaPlus,
  FaTrash,
  FaFileInvoice,
  FaEye,
  FaPaperPlane,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import { useLanguage } from "../contexts/LanguageContext";
import "../styles/components/PayPlusDocumentForm.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const DOC_TYPES = [
  { value: "tax_invoice", labelHe: "חשבונית מס", labelEn: "Tax Invoice" },
  { value: "receipt", labelHe: "קבלה", labelEn: "Receipt" },
  { value: "quote", labelHe: "הצעת מחיר", labelEn: "Quote" },
  {
    value: "tax_invoice_receipt",
    labelHe: "חשבונית מס/קבלה",
    labelEn: "Tax Invoice + Receipt",
  },
  {
    value: "delivery_note",
    labelHe: "תעודת משלוח",
    labelEn: "Delivery Note",
  },
];

const PAYMENT_METHODS = [
  { value: "cash", labelHe: "מזומן", labelEn: "Cash" },
  { value: "credit_card", labelHe: "כרטיס אשראי", labelEn: "Credit Card" },
  {
    value: "bank_transfer",
    labelHe: "העברה בנקאית",
    labelEn: "Bank Transfer",
  },
  { value: "check", labelHe: "המחאה", labelEn: "Check" },
];

const EMPTY_ITEM = { name: "", quantity: 1, price: "" };

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function PayPlusDocumentForm() {
  const { language } = useLanguage();
  const L = (he, en) => (language === "en" ? en : he);

  const [docType, setDocType] = useState("tax_invoice");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { type: "success"|"error", message, data }
  const [errors, setErrors] = useState({});

  /* ── Items helpers ── */
  const addItem = () => setItems((prev) => [...prev, { ...EMPTY_ITEM }]);

  const removeItem = (idx) =>
    setItems((prev) => prev.filter((_, i) => i !== idx));

  const updateItem = (idx, field, value) =>
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)),
    );

  /* ── Totals ── */
  const subtotal = items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.price) || 0;
    return sum + qty * price;
  }, 0);

  const vat = subtotal * 0.18;
  const total = subtotal + vat;

  /* ── Validation ── */
  const validate = () => {
    const e = {};
    if (!customerName.trim())
      e.customerName = L("שם לקוח נדרש", "Customer name is required");
    if (!customerEmail.trim())
      e.customerEmail = L("אימייל נדרש", "Email is required");
    else if (!validateEmail(customerEmail))
      e.customerEmail = L("פורמט אימייל לא תקין", "Invalid email format");

    const itemErrors = items.map((item, idx) => {
      const ie = {};
      if (!item.name.trim())
        ie.name = L("שם פריט נדרש", "Item name is required");
      if (!item.price || parseFloat(item.price) <= 0)
        ie.price = L(
          "מחיר חייב להיות גדול מ-0",
          "Price must be greater than 0",
        );
      if (!item.quantity || parseFloat(item.quantity) <= 0)
        ie.quantity = L("כמות חייבת להיות גדולה מ-0", "Quantity must be > 0");
      return ie;
    });

    if (itemErrors.some((ie) => Object.keys(ie).length > 0))
      e.items = itemErrors;
    setErrors(e);
    return (
      Object.keys(e).length === 0 ||
      (e.items &&
        Object.keys(e).length === 1 &&
        e.items.every((ie) => Object.keys(ie).length === 0))
    );
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);

    const isValid =
      !!customerName.trim() &&
      !!customerEmail.trim() &&
      validateEmail(customerEmail) &&
      items.every(
        (item) =>
          item.name.trim() &&
          parseFloat(item.price) > 0 &&
          parseFloat(item.quantity) > 0,
      );

    if (!isValid) {
      validate();
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        docType,
        preview,
        customer: {
          name: customerName.trim(),
          email: customerEmail.trim(),
        },
        paymentMethod,
        items: items.map((item) => ({
          name: item.name.trim(),
          quantity: parseFloat(item.quantity),
          price: parseFloat(item.price),
        })),
      };

      const res = await axios.post(
        `${API_BASE_URL}/api/payplus/create-document`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setResult({
        type: "success",
        message:
          res.data?.message ||
          L("המסמך נוצר בהצלחה", "Document created successfully"),
        data: res.data?.data,
      });

      // Reset form on success (unless preview)
      if (!preview) {
        setCustomerName("");
        setCustomerEmail("");
        setItems([{ ...EMPTY_ITEM }]);
        setErrors({});
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        L("שגיאה ביצירת המסמך", "Failed to create document");
      setResult({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ppdf-wrap">
      {/* ── Header ── */}
      <div className="section-header">
        <div>
          <h1>
            <FaFileInvoice
              style={{
                marginInlineEnd: "0.5rem",
                color: "var(--color-secondary)",
              }}
            />
            {L("יצירת מסמך PayPlus", "Create PayPlus Document")}
          </h1>
          <p className="section-subtitle">
            {L(
              "הפקת חשבוניות, קבלות והצעות מחיר ידנית דרך PayPlus",
              "Manually generate invoices, receipts, and quotes via PayPlus",
            )}
          </p>
        </div>
      </div>

      {/* ── Result Banner ── */}
      {result && (
        <div className={`ppdf-banner ppdf-banner-${result.type}`}>
          {result.type === "success" ? (
            <FaCheckCircle className="ppdf-banner-icon" />
          ) : (
            <FaExclamationTriangle className="ppdf-banner-icon" />
          )}
          <div>
            <p className="ppdf-banner-msg">{result.message}</p>
            {result.data?.documentUrl && (
              <a
                href={result.data.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ppdf-banner-link"
              >
                {L("פתח מסמך", "Open Document")} →
              </a>
            )}
          </div>
          <button className="ppdf-banner-close" onClick={() => setResult(null)}>
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="ppdf-grid">
          {/* ── Left Column ── */}
          <div className="ppdf-col">
            {/* Document Type */}
            <div className="ppdf-card">
              <h3 className="ppdf-card-title">
                {L("סוג מסמך", "Document Type")}
              </h3>
              <div className="ppdf-field">
                <label className="ppdf-label">
                  {L("בחר סוג מסמך", "Select Document Type")}
                </label>
                <select
                  className="ppdf-select"
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                >
                  {DOC_TYPES.map((d) => (
                    <option key={d.value} value={d.value}>
                      {L(d.labelHe, d.labelEn)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="ppdf-field">
                <label className="ppdf-label">
                  {L("אמצעי תשלום", "Payment Method")}
                </label>
                <div className="ppdf-radio-group">
                  {PAYMENT_METHODS.map((pm) => (
                    <label
                      key={pm.value}
                      className={`ppdf-radio-btn ${paymentMethod === pm.value ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={pm.value}
                        checked={paymentMethod === pm.value}
                        onChange={() => setPaymentMethod(pm.value)}
                      />
                      {L(pm.labelHe, pm.labelEn)}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="ppdf-card">
              <h3 className="ppdf-card-title">
                {L("פרטי לקוח", "Customer Details")}
              </h3>

              <div className="ppdf-field">
                <label className="ppdf-label">
                  {L("שם מלא *", "Full Name *")}
                </label>
                <input
                  className={`ppdf-input ${errors.customerName ? "ppdf-input-error" : ""}`}
                  type="text"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (errors.customerName)
                      setErrors((prev) => ({ ...prev, customerName: null }));
                  }}
                  placeholder={L("שם הלקוח", "Customer full name")}
                />
                {errors.customerName && (
                  <span className="ppdf-error">{errors.customerName}</span>
                )}
              </div>

              <div className="ppdf-field">
                <label className="ppdf-label">{L("אימייל *", "Email *")}</label>
                <input
                  className={`ppdf-input ${errors.customerEmail ? "ppdf-input-error" : ""}`}
                  type="email"
                  value={customerEmail}
                  onChange={(e) => {
                    setCustomerEmail(e.target.value);
                    if (errors.customerEmail)
                      setErrors((prev) => ({ ...prev, customerEmail: null }));
                  }}
                  placeholder="customer@example.com"
                />
                {errors.customerEmail && (
                  <span className="ppdf-error">{errors.customerEmail}</span>
                )}
              </div>
            </div>

            {/* Preview Toggle + Submit */}
            <div className="ppdf-card ppdf-actions-card">
              <label className="ppdf-toggle-row">
                <span className="ppdf-label" style={{ margin: 0 }}>
                  <FaEye style={{ marginInlineEnd: "0.4rem" }} />
                  {L("מצב תצוגה מקדימה", "Preview Mode")}
                </span>
                <span className="ppdf-label ppdf-toggle-hint">
                  {L(
                    "המסמך לא יישמר — רק לבדיקה",
                    "Document won't be saved — for review only",
                  )}
                </span>
                <div
                  className={`ppdf-toggle ${preview ? "ppdf-toggle-on" : ""}`}
                  onClick={() => setPreview((v) => !v)}
                  role="switch"
                  aria-checked={preview}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === " " && setPreview((v) => !v)}
                >
                  <div className="ppdf-toggle-thumb" />
                </div>
              </label>

              <button
                type="submit"
                className="ppdf-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <span className="ppdf-spinner" />
                ) : (
                  <FaPaperPlane style={{ marginInlineEnd: "0.5rem" }} />
                )}
                {loading
                  ? L("שולח...", "Sending...")
                  : preview
                    ? L("תצוגה מקדימה", "Preview Document")
                    : L("צור מסמך", "Create Document")}
              </button>
            </div>
          </div>

          {/* ── Right Column — Items ── */}
          <div className="ppdf-col">
            <div className="ppdf-card ppdf-items-card">
              <div className="ppdf-items-header">
                <h3 className="ppdf-card-title" style={{ margin: 0 }}>
                  {L("פריטים", "Items")}
                </h3>
                <button
                  type="button"
                  className="ppdf-add-item-btn"
                  onClick={addItem}
                >
                  <FaPlus />
                  {L("הוסף פריט", "Add Item")}
                </button>
              </div>

              <div className="ppdf-items-list">
                {/* Column headers */}
                <div className="ppdf-items-col-headers">
                  <span style={{ flex: "1 1 40%" }}>
                    {L("שם פריט", "Item Name")}
                  </span>
                  <span style={{ flex: "0 0 80px", textAlign: "center" }}>
                    {L("כמות", "Qty")}
                  </span>
                  <span style={{ flex: "0 0 100px", textAlign: "center" }}>
                    {L("מחיר ₪", "Price ₪")}
                  </span>
                  <span style={{ flex: "0 0 90px", textAlign: "center" }}>
                    {L('סה"כ', "Total")}
                  </span>
                  <span style={{ flex: "0 0 36px" }} />
                </div>

                {items.map((item, idx) => {
                  const lineTotal =
                    (parseFloat(item.quantity) || 0) *
                    (parseFloat(item.price) || 0);
                  const itemErr = errors.items?.[idx] || {};
                  return (
                    <div key={idx} className="ppdf-item-row">
                      <div className="ppdf-item-fields">
                        <div
                          className="ppdf-item-field"
                          style={{ flex: "1 1 40%" }}
                        >
                          <input
                            className={`ppdf-input ppdf-input-sm ${itemErr.name ? "ppdf-input-error" : ""}`}
                            type="text"
                            value={item.name}
                            onChange={(e) =>
                              updateItem(idx, "name", e.target.value)
                            }
                            placeholder={L("שם פריט", "Item name")}
                          />
                          {itemErr.name && (
                            <span className="ppdf-error">{itemErr.name}</span>
                          )}
                        </div>

                        <div
                          className="ppdf-item-field"
                          style={{ flex: "0 0 80px" }}
                        >
                          <input
                            className={`ppdf-input ppdf-input-sm ppdf-input-center ${itemErr.quantity ? "ppdf-input-error" : ""}`}
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(idx, "quantity", e.target.value)
                            }
                          />
                        </div>

                        <div
                          className="ppdf-item-field"
                          style={{ flex: "0 0 100px" }}
                        >
                          <input
                            className={`ppdf-input ppdf-input-sm ppdf-input-center ${itemErr.price ? "ppdf-input-error" : ""}`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.price}
                            onChange={(e) =>
                              updateItem(idx, "price", e.target.value)
                            }
                            placeholder="0.00"
                          />
                          {itemErr.price && (
                            <span className="ppdf-error">{itemErr.price}</span>
                          )}
                        </div>

                        <div
                          className="ppdf-item-total"
                          style={{ flex: "0 0 90px" }}
                        >
                          ₪{lineTotal.toFixed(2)}
                        </div>

                        <div style={{ flex: "0 0 36px", textAlign: "center" }}>
                          {items.length > 1 && (
                            <button
                              type="button"
                              className="ppdf-remove-btn"
                              onClick={() => removeItem(idx)}
                              title={L("הסר פריט", "Remove item")}
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <div className="ppdf-totals">
                <div className="ppdf-totals-row">
                  <span>{L("סכום ביניים", "Subtotal")}</span>
                  <span>₪{subtotal.toFixed(2)}</span>
                </div>
                <div className="ppdf-totals-row">
                  <span>{L('מע"מ (18%)', "VAT (18%)")}</span>
                  <span>₪{vat.toFixed(2)}</span>
                </div>
                <div className="ppdf-totals-row ppdf-totals-grand">
                  <span>{L('סה"כ לתשלום', "Grand Total")}</span>
                  <span>₪{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
