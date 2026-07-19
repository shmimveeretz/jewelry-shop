import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import "../styles/pages/TrackOrder.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const STATUS_STEPS = [
  { key: "received", statuses: ["Pending", "Paid"], he: "התקבל", en: "Received" },
  { key: "processing", statuses: ["Processing"], he: "בטיפול", en: "Processing" },
  { key: "shipped", statuses: ["Shipped"], he: "נשלח", en: "Shipped" },
  { key: "delivered", statuses: ["Delivered"], he: "נמסר", en: "Delivered" },
];

function getActiveStepIndex(status) {
  if (status === "Cancelled") return -1;
  if (status === "Delivered") return 3;
  if (status === "Shipped") return 2;
  if (status === "Processing") return 1;
  if (status === "Pending" || status === "Paid") return 0;
  return 0;
}

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

  return (
    <div className="track-order" dir={he ? "rtl" : "ltr"}>
      <div className="track-order__inner">
        <header className="track-order__header">
          <h1>{he ? "מעקב הזמנה" : "Track Your Order"}</h1>
          <p>
            {he
              ? "הזינו את מספר ההזמנה שקיבלתם באישור הרכישה — אין צורך בהתחברות."
              : "Enter the order number from your purchase confirmation — no login required."}
          </p>
        </header>

        <form className="track-order__form" onSubmit={handleSubmit}>
          <label htmlFor="orderId" className="track-order__label">
            {he ? "מספר הזמנה" : "Order number"}
          </label>
          <div className="track-order__row">
            <input
              id="orderId"
              type="text"
              className="track-order__input"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder={he ? "לדוגמה: order_…" : "e.g. order_…"}
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="submit"
              className="track-order__submit"
              disabled={loading}
            >
              {loading
                ? he
                  ? "מחפש…"
                  : "Searching…"
                : he
                  ? "חיפוש"
                  : "Search"}
            </button>
          </div>
        </form>

        {error && <p className="track-order__error">{error}</p>}

        {result && (
          <div className="track-order__result">
            <div className="track-order__meta">
              <span className="track-order__meta-label">
                {he ? "מספר הזמנה" : "Order #"}
              </span>
              <span className="track-order__meta-value">{result.orderId}</span>
            </div>

            {isCancelled ? (
              <p className="track-order__cancelled">
                {he ? "ההזמנה בוטלה" : "This order was cancelled"}
              </p>
            ) : (
              <ol className="track-order__steps">
                {STATUS_STEPS.map((step, index) => {
                  const done = index <= activeIndex;
                  const current = index === activeIndex;
                  return (
                    <li
                      key={step.key}
                      className={`track-order__step${done ? " is-done" : ""}${current ? " is-current" : ""}`}
                    >
                      <span className="track-order__step-dot" aria-hidden />
                      <span className="track-order__step-label">
                        {he ? step.he : step.en}
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}

            {result.items?.length > 0 && (
              <div className="track-order__items">
                <h2>{he ? "פריטים בהזמנה" : "Items in order"}</h2>
                <ul>
                  {result.items.map((item, i) => (
                    <li key={i}>
                      <span>{item.name}</span>
                      <span>×{item.quantity}</span>
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
