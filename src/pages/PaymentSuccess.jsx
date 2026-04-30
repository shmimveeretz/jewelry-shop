import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../contexts/LanguageContext";
import { payPlusService } from "../utils/payPlusService";
import "../styles/pages/PaymentSuccess.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── helpers ───────────────────────────────────────────────────────────────────

const fmt = (n) =>
  Number(n).toLocaleString("he-IL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

async function saveOrderToDb(transactionUid, orderData) {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/api/orders/success`, {
    method: "POST",
    headers,
    body: JSON.stringify({ transactionUid, ...orderData }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Loading screen ────────────────────────────────────────────────────────────

function LoadingScreen({ language }) {
  const he = language === "he";
  return (
    <div className="ps-page">
      <div className="ps-card ps-card--loading">
        <div className="ps-spinner" />
        <h2 className="ps-loading-title">
          {he ? "מאמת תשלום…" : "Verifying payment…"}
        </h2>
        <p className="ps-loading-sub">
          {he
            ? "אנא המתן, אנחנו מאמתים את התשלום שלך"
            : "Please wait while we verify your payment"}
        </p>
      </div>
    </div>
  );
}

// ── Error screen ──────────────────────────────────────────────────────────────

function ErrorScreen({ language, message, navigate }) {
  const he = language === "he";
  return (
    <div className="ps-page">
      <div className="ps-card ps-card--error">
        <div className="ps-icon ps-icon--error">✕</div>
        <h1 className="ps-title">
          {he ? "שגיאה באימות התשלום" : "Payment Verification Error"}
        </h1>
        <p className="ps-error-msg">{message}</p>
        <p className="ps-error-hint">
          {he
            ? "אם הכסף נחתך — פנה אלינו ונסדר."
            : "If you were charged, please contact us and we'll sort it out."}
        </p>
        <div className="ps-actions">
          <button
            className="ps-btn ps-btn--primary"
            onClick={() => navigate("/contact")}
          >
            {he ? "צור קשר" : "Contact Us"}
          </button>
          <button
            className="ps-btn ps-btn--secondary"
            onClick={() => navigate("/")}
          >
            {he ? "חזרה לדף הבית" : "Back to Home"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const { language } = useLanguage();

  // "verifying" | "success" | "error"
  const [phase, setPhase] = useState("verifying");
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(null);

  // Prevent double-execution in React StrictMode
  const ran = useRef(false);

  // ── Verify + persist ───────────────────────────────────────────────────────

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const run = async () => {
      try {
        const transactionUid =
          searchParams.get("transaction_uid") ||
          searchParams.get("page_request_uid");

        // ?status=success is sent directly by PayPlus on redirect
        const urlStatus = searchParams.get("status");

        if (!transactionUid) {
          throw new Error(
            language === "he"
              ? "מזהה עסקה לא נמצא בכתובת"
              : "Transaction ID not found in URL",
          );
        }

        // Retrieve the order data we stored before redirecting to PayPlus
        const raw = localStorage.getItem("pendingOrder");
        const pendingOrder = raw ? JSON.parse(raw) : {};

        let details = null;

        if (urlStatus === "success") {
          // ── Fast path: PayPlus confirmed success via URL ─────────────────
          // POST to backend to persist the order; backend can re-verify
          // the signature with the PayPlus API for extra security.
          const saved = await saveOrderToDb(transactionUid, pendingOrder);

          details = {
            orderId: saved?.orderId ?? saved?.data?.orderId ?? null,
            transactionUid,
            amount: saved?.amount ?? pendingOrder?.amount,
            customerName: saved?.customerName ?? pendingOrder?.customerName,
            email: saved?.email ?? pendingOrder?.customerEmail,
            shippingAddress: pendingOrder?.shippingAddress ?? null,
            items: pendingOrder?.items ?? [],
          };
        } else {
          // ── Full verification via PayPlus API ────────────────────────────
          const result = await payPlusService.verifyPayment(
            transactionUid,
            pendingOrder,
          );

          if (!result.success || result.status !== "completed") {
            throw new Error(
              language === "he"
                ? "אימות התשלום נכשל"
                : "Payment verification failed",
            );
          }

          // Persist to DB — non-blocking; don't fail the success page on DB errors
          saveOrderToDb(transactionUid, {
            ...pendingOrder,
            amount: result.transactionDetails?.amount,
            customerName: result.transactionDetails?.customerName,
            customerEmail: result.transactionDetails?.email,
          }).catch((e) => console.warn("Order save failed (non-fatal):", e));

          details = {
            orderId: null,
            transactionUid,
            amount: result.transactionDetails?.amount,
            customerName: result.transactionDetails?.customerName,
            email: result.transactionDetails?.email,
            shippingAddress: pendingOrder?.shippingAddress ?? null,
            items: pendingOrder?.items ?? [],
          };
        }

        setOrderDetails(details);
        clearCart();
        localStorage.removeItem("cart");
        localStorage.removeItem("pendingOrder");
        setCountdown(10);
        setPhase("success");
      } catch (err) {
        console.error("PaymentSuccess error:", err);
        setError(err.message);
        setPhase("error");
      }
    };

    run();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Countdown → redirect ───────────────────────────────────────────────────

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      navigate("/");
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, navigate]);

  // ── Render guards ──────────────────────────────────────────────────────────

  if (phase === "verifying") return <LoadingScreen language={language} />;
  if (phase === "error")
    return (
      <ErrorScreen language={language} message={error} navigate={navigate} />
    );

  const he = language === "he";

  return (
    <div className="ps-page">
      <div className="ps-card ps-card--success">
        {/* ── Animated checkmark ──────────────────────────────────────── */}
        <div className="ps-checkmark-wrap">
          <svg className="ps-checkmark" viewBox="0 0 52 52" aria-hidden="true">
            <circle
              className="ps-checkmark__circle"
              cx="26"
              cy="26"
              r="25"
              fill="none"
            />
            <path
              className="ps-checkmark__check"
              fill="none"
              d="M14.1 27.2l7.1 7.2 16.7-16.8"
            />
          </svg>
        </div>

        {/* ── Hero copy ────────────────────────────────────────────────── */}
        <h1 className="ps-title ps-title--success">
          {he ? "ההזמנה התקבלה בהצלחה!" : "Order Placed Successfully!"}
        </h1>
        <p className="ps-subtitle">
          {he
            ? "תודה על הרכישה! אישור הזמנה נשלח לכתובת המייל שלך."
            : "Thank you for your purchase! An order confirmation has been sent to your email."}
        </p>

        {/* ── Order summary ────────────────────────────────────────────── */}
        {orderDetails && (
          <div className="ps-summary">
            {/* Transaction / order IDs */}
            <div className="ps-summary__section">
              <h3 className="ps-summary__heading">
                {he ? "פרטי עסקה" : "Transaction Details"}
              </h3>

              {orderDetails.orderId && (
                <div className="ps-row">
                  <span className="ps-row__label">
                    {he ? "מספר הזמנה:" : "Order #:"}
                  </span>
                  <span className="ps-row__value ps-row__value--mono">
                    {orderDetails.orderId}
                  </span>
                </div>
              )}

              <div className="ps-row">
                <span className="ps-row__label">
                  {he ? "מזהה עסקה:" : "Transaction ID:"}
                </span>
                <span className="ps-row__value ps-row__value--mono ps-row__value--truncate">
                  {orderDetails.transactionUid}
                </span>
              </div>

              {orderDetails.amount != null && (
                <div className="ps-row ps-row--total">
                  <span className="ps-row__label">
                    {he ? "סכום שולם:" : "Amount Paid:"}
                  </span>
                  <span className="ps-row__value ps-row__value--amount">
                    {fmt(orderDetails.amount)} ₪
                  </span>
                </div>
              )}

              {orderDetails.email && (
                <div className="ps-row">
                  <span className="ps-row__label">
                    {he ? "אישור נשלח ל:" : "Confirmation to:"}
                  </span>
                  <span className="ps-row__value">{orderDetails.email}</span>
                </div>
              )}
            </div>

            {/* Items list */}
            {orderDetails.items?.length > 0 && (
              <div className="ps-summary__section">
                <h3 className="ps-summary__heading">
                  {he ? "מוצרים שנרכשו" : "Items Purchased"}
                </h3>
                <ul className="ps-items">
                  {orderDetails.items.map((item, i) => (
                    <li key={i} className="ps-item">
                      {item.image && (
                        <img
                          className="ps-item__img"
                          src={item.image}
                          alt={item.name}
                          loading="lazy"
                        />
                      )}
                      <span className="ps-item__name">{item.name}</span>
                      <span className="ps-item__qty">×{item.quantity}</span>
                      <span className="ps-item__price">
                        {fmt(item.price)} ₪
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Shipping address */}
            {orderDetails.shippingAddress && (
              <div className="ps-summary__section">
                <h3 className="ps-summary__heading">
                  {he ? "כתובת למשלוח" : "Shipping Address"}
                </h3>
                <address className="ps-address">
                  {[
                    orderDetails.shippingAddress.fullName,
                    orderDetails.shippingAddress.street,
                    orderDetails.shippingAddress.city,
                    orderDetails.shippingAddress.zip,
                    orderDetails.shippingAddress.country,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </address>
              </div>
            )}

            {/* Next steps */}
            <div className="ps-next-steps">
              <h3 className="ps-next-steps__heading">
                {he ? "מה הלאה?" : "What's Next?"}
              </h3>
              <ul className="ps-next-steps__list">
                <li>
                  {he
                    ? "קיבלת אישור הזמנה למייל"
                    : "You'll receive an order confirmation email"}
                </li>
                <li>
                  {he
                    ? "נתחיל להכין את ההזמנה שלך בהקדם"
                    : "We'll start preparing your order shortly"}
                </li>
                <li>
                  {he
                    ? "תקבל מספר מעקב כשהחבילה תישלח"
                    : "You'll get a tracking number when your order ships"}
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* ── Countdown ────────────────────────────────────────────────── */}
        {countdown !== null && (
          <p className="ps-countdown">
            {he
              ? `מועבר לדף הבית בעוד ${countdown} שניות…`
              : `Redirecting to home in ${countdown} seconds…`}
          </p>
        )}

        {/* ── Actions ──────────────────────────────────────────────────── */}
        <div className="ps-actions">
          <button
            className="ps-btn ps-btn--primary"
            onClick={() => navigate("/")}
          >
            {he ? "חזרה לדף הבית" : "Back to Home"}
          </button>
          <button
            className="ps-btn ps-btn--secondary"
            onClick={() => navigate("/shop")}
          >
            {he ? "המשך קניות" : "Continue Shopping"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;
