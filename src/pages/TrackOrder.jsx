import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FaSearch,
  FaBoxOpen,
  FaCog,
  FaShippingFast,
  FaCheckCircle,
} from "react-icons/fa";
import { useLanguage } from "../contexts/LanguageContext";
import "../styles/pages/TrackOrder.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const STATUS_STEPS = [
  {
    key: "received",
    statuses: ["Pending", "Paid"],
    he: "התקבל",
    en: "Received",
    Icon: FaBoxOpen,
  },
  {
    key: "processing",
    statuses: ["Processing"],
    he: "בהכנה",
    en: "Crafting",
    Icon: FaCog,
  },
  {
    key: "shipped",
    statuses: ["Shipped"],
    he: "נשלח",
    en: "In Transit",
    Icon: FaShippingFast,
  },
  {
    key: "delivered",
    statuses: ["Delivered"],
    he: "נמסר",
    en: "Delivered",
    Icon: FaCheckCircle,
  },
];

function getActiveStepIndex(status) {
  if (status === "Cancelled") return -1;
  if (status === "Delivered") return 3;
  if (status === "Shipped") return 2;
  if (status === "Processing") return 1;
  if (status === "Pending" || status === "Paid") return 0;
  return 0;
}

const fmtPrice = (n) =>
  Number(n).toLocaleString("he-IL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

function TrackOrder() {
  const { language } = useLanguage();
  const he = language === "he";
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(() => searchParams.get("orderId") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [autoSearched, setAutoSearched] = useState(false);

  const fetchOrder = async (id) => {
    const trimmed = id.trim();
    if (!trimmed) {
      setError(he ? "נא להזין מספר הזמנה" : "Please enter an order number");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/orders/track/${encodeURIComponent(trimmed)}`,
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(
          data.message || (he ? "הזמנה לא נמצאה" : "Order not found"),
        );
        return;
      }

      setResult(data.data);
    } catch {
      setError(
        he
          ? "שגיאה בחיבור לשרת. נסה שוב."
          : "Connection error. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fromQuery = searchParams.get("orderId");
    if (fromQuery && !autoSearched) {
      setAutoSearched(true);
      setOrderId(fromQuery);
      fetchOrder(fromQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, autoSearched]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetchOrder(orderId);
  };

  const activeIndex = result ? getActiveStepIndex(result.status) : -1;
  const isCancelled = result?.status === "Cancelled";
  const progressPct =
    activeIndex <= 0
      ? 0
      : (activeIndex / (STATUS_STEPS.length - 1)) * 100;

  const orderDate = result?.createdAt
    ? new Date(result.createdAt).toLocaleDateString(he ? "he-IL" : "en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="track-order" dir={he ? "rtl" : "ltr"}>
      <div className="track-order__inner">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <header className="track-order__header to-fade to-fade--1">
          <span className="track-order__eyebrow">
            {he ? "המסע של התכשיט שלך" : "The journey of your piece"}
          </span>
          <h1>{he ? "מעקב הזמנה" : "Track Your Order"}</h1>
          <p>
            {he
              ? "הזינו את מספר ההזמנה שקיבלתם באישור הרכישה — אין צורך בהתחברות."
              : "Enter the order number from your purchase confirmation — no login required."}
          </p>
        </header>

        {/* ── Search ─────────────────────────────────────────────────── */}
        <form
          className="track-order__form to-fade to-fade--2"
          onSubmit={handleSubmit}
        >
          <div className="track-order__search">
            <input
              id="orderId"
              type="text"
              className="track-order__input"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder={
                he ? "מספר הזמנה (לדוגמה: order_…)" : "Order number (e.g. order_…)"
              }
              autoComplete="off"
              spellCheck={false}
              aria-label={he ? "מספר הזמנה" : "Order number"}
            />
            <button
              type="submit"
              className={`track-order__submit${loading ? " is-loading" : ""}`}
              disabled={loading}
              aria-label={he ? "חיפוש" : "Search"}
            >
              <FaSearch />
            </button>
          </div>
          {loading && (
            <p className="track-order__searching">
              {he ? "מחפש…" : "Searching…"}
            </p>
          )}
        </form>

        {error && <p className="track-order__error">{error}</p>}

        {/* ── Result panel ───────────────────────────────────────────── */}
        {result && (
          <div className="track-order__panel to-fade to-fade--3">
            <div className="track-order__panel-glow" aria-hidden="true" />

            <div className="track-order__panel-head">
              <div>
                <span className="track-order__panel-eyebrow">
                  {he ? "סטטוס הזמנה" : "Order Status"}
                </span>
                <h2 className="track-order__panel-title">
                  {he ? "הזמנה" : "Order"}{" "}
                  <span dir="ltr">#{result.orderId}</span>
                </h2>
              </div>
              {orderDate && (
                <div className="track-order__panel-date">
                  <span className="track-order__panel-date-label">
                    {he ? "תאריך הזמנה" : "Order Date"}
                  </span>
                  <span className="track-order__panel-date-value">
                    {orderDate}
                  </span>
                </div>
              )}
            </div>

            {isCancelled ? (
              <p className="track-order__cancelled">
                {he ? "ההזמנה בוטלה" : "This order was cancelled"}
              </p>
            ) : (
              <div className="track-order__timeline">
                <div className="track-order__timeline-line" aria-hidden />
                <div
                  className="track-order__timeline-progress"
                  style={{ width: `${progressPct}%` }}
                  aria-hidden
                />
                <ol className="track-order__steps">
                  {STATUS_STEPS.map((step, index) => {
                    const done = index <= activeIndex;
                    const current = index === activeIndex;
                    const { Icon } = step;
                    return (
                      <li
                        key={step.key}
                        className={`track-order__step${done ? " is-done" : ""}${current ? " is-current" : ""}`}
                      >
                        <span className="track-order__step-badge">
                          <Icon aria-hidden />
                        </span>
                        <span className="track-order__step-label">
                          {he ? step.he : step.en}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}

            {result.items?.length > 0 && (
              <div className="track-order__items">
                <h3>{he ? "פריטים בהזמנה" : "Items in Order"}</h3>
                <ul>
                  {result.items.map((item, i) => (
                    <li key={i} className="track-order__item">
                      {item.image && (
                        <img
                          className="track-order__item-img"
                          src={item.image}
                          alt={item.name}
                          loading="lazy"
                        />
                      )}
                      <div className="track-order__item-info">
                        <h4 className="track-order__item-name">{item.name}</h4>
                        <p className="track-order__item-qty">
                          {he ? "כמות" : "Qty"}: {item.quantity}
                        </p>
                      </div>
                      {item.price != null && (
                        <span className="track-order__item-price">
                          {fmtPrice(item.price)} ₪
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TrackOrder;
