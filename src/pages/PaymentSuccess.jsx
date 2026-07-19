import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../contexts/LanguageContext";
import "../styles/pages/PaymentSuccess.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── helpers ───────────────────────────────────────────────────────────────────

const fmt = (n) =>
  Number(n).toLocaleString("he-IL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function isPayPlusApproved(searchParams) {
  const status = (searchParams.get("status") || "").toLowerCase();
  const code = searchParams.get("status_code");
  return status === "approved" || code === "000" || code === "0";
}

/** Prefer page_request_uid — PayPlus verify API & PendingOrder are keyed by it */
function resolvePageRequestUid(searchParams) {
  return (
    searchParams.get("page_request_uid") ||
    searchParams.get("transaction_uid") ||
    null
  );
}

function resolvePublicOrderId(data, searchParams, pendingOrder) {
  return (
    data?.orderId ||
    data?.data?.orderId ||
    pendingOrder?.orderId ||
    searchParams.get("more_info") ||
    data?.data?._id ||
    data?.data?.id ||
    null
  );
}

// ── Confetti ──────────────────────────────────────────────────────────────────

const CONFETTI_COLORS = ["#735c00", "#e9c349", "#162839", "#e8e8e3"];

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        left: Math.random() * 100,
        duration: 2 + Math.random() * 2,
        delay: Math.random() * 2,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      })),
    [],
  );

  return (
    <div className="ps-confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="ps-confetti__piece"
          style={{
            left: `${p.left}vw`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            backgroundColor: p.color,
          }}
        />
      ))}
    </div>
  );
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
      const pendingOrder = JSON.parse(
        localStorage.getItem("pendingOrder") || "{}",
      );
      const pageRequestUid = resolvePageRequestUid(searchParams);
      const approvedInUrl = isPayPlusApproved(searchParams);

      const buildSuccessDetails = (data = {}) => ({
        orderId: resolvePublicOrderId(data, searchParams, pendingOrder),
        transactionUid: pageRequestUid,
        amount:
          data.amount ??
          data.data?.totalPrice ??
          searchParams.get("amount") ??
          pendingOrder.totalPrice ??
          pendingOrder.amount,
        customerName:
          data.customerName ??
          data.data?.customerName ??
          (decodeURIComponent(
            searchParams.get("customer_name") ||
              searchParams.get("customer_name_invoice") ||
              "",
          ) ||
            pendingOrder.customerName),
        email:
          data.email ??
          data.data?.customerEmail ??
          searchParams.get("customer_email") ??
          pendingOrder.customerEmail,
        shippingAddress:
          data.shippingAddress ??
          data.data?.shippingAddress ??
          pendingOrder.shippingAddress ??
          null,
        items: data.items ?? data.data?.items ?? pendingOrder.items ?? [],
      });

      try {
        if (!pageRequestUid) {
          throw new Error(
            language === "he"
              ? "מזהה עסקה לא נמצא בכתובת"
              : "Transaction ID not found in URL",
          );
        }

        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const payload = {
          paymentPageRequestUid: pageRequestUid,
          page_request_uid: pageRequestUid,
          orderData: {
            ...pendingOrder,
            orderId: pendingOrder.orderId || searchParams.get("more_info") || undefined,
            customerEmail:
              pendingOrder.customerEmail ||
              searchParams.get("customer_email") ||
              undefined,
            customerName:
              pendingOrder.customerName ||
              decodeURIComponent(
                searchParams.get("customer_name") || "",
              ) ||
              undefined,
          },
        };

        const { data } = await axios.post(
          `${API_BASE_URL}/api/orders/verify-transaction`,
          payload,
          { headers },
        );

        if (!data.success) {
          throw new Error(
            data.message ||
              (language === "he"
                ? "אימות התשלום נכשל"
                : "Payment verification failed"),
          );
        }

        setOrderDetails(buildSuccessDetails(data));
        clearCart();
        localStorage.removeItem("cart");
        localStorage.removeItem("pendingOrder");
        setCountdown(20);
        setPhase("success");
      } catch (err) {
        console.error("PaymentSuccess error:", err);

        // PayPlus already confirmed approval in the redirect URL — still show thank-you
        if (approvedInUrl) {
          setOrderDetails(buildSuccessDetails({}));
          clearCart();
          localStorage.removeItem("cart");
          localStorage.removeItem("pendingOrder");
          setCountdown(20);
          setPhase("success");
          return;
        }

        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            err.message,
        );
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
  const addr = orderDetails?.shippingAddress;

  return (
    <div className="ps-page ps-page--success">
      <Confetti />

      <div className="ps-card ps-card--success">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="ps-hero ps-fade ps-fade--1">
          <div className="ps-hero__badge">
            <svg
              className="ps-checkmark"
              viewBox="0 0 52 52"
              aria-hidden="true"
            >
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
          <h1 className="ps-title ps-title--success">
            {he ? "התשלום בוצע בהצלחה" : "Payment Successful"}
          </h1>
          <p className="ps-subtitle">
            {he
              ? "תודה על ההזמנה! שלחנו אליך אישור למייל עם מספר המעקב."
              : "Thank you for your order! We sent a confirmation email with your tracking number."}
          </p>
          {countdown !== null && (
            <p className="ps-countdown">
              <span className="ps-countdown__icon" aria-hidden="true">
                ⏱
              </span>
              {he
                ? `מועבר לדף הבית בעוד ${countdown} שניות…`
                : `Redirecting in ${countdown}s…`}
            </p>
          )}
        </section>

        {/* ── Summary + Shipping (side by side on desktop) ─────────────── */}
        {orderDetails && (
          <div className="ps-panels ps-fade ps-fade--2">
            <div className="ps-panel">
              <h3 className="ps-panel__heading">
                {he ? "סיכום הזמנה" : "Order Summary"}
              </h3>

              {orderDetails.orderId && (
                <div className="ps-row">
                  <span className="ps-row__label">
                    {he ? "מספר מעקב" : "Tracking #"}
                  </span>
                  <span className="ps-row__value ps-row__value--mono">
                    {orderDetails.orderId}
                  </span>
                </div>
              )}

              {orderDetails.transactionUid && (
                <div className="ps-row">
                  <span className="ps-row__label">
                    {he ? "מזהה עסקה" : "Transaction ID"}
                  </span>
                  <span className="ps-row__value ps-row__value--mono ps-row__value--truncate">
                    {orderDetails.transactionUid}
                  </span>
                </div>
              )}

              {orderDetails.amount != null && orderDetails.amount !== "" && (
                <div className="ps-row">
                  <span className="ps-row__label">
                    {he ? "סכום שולם" : "Amount Paid"}
                  </span>
                  <span className="ps-row__value ps-row__value--amount">
                    {fmt(orderDetails.amount)} ₪
                  </span>
                </div>
              )}

              {orderDetails.email && (
                <div className="ps-row">
                  <span className="ps-row__label">
                    {he ? "אישור נשלח ל" : "Confirmation"}
                  </span>
                  <span className="ps-row__value ps-row__value--truncate">
                    {orderDetails.email}
                  </span>
                </div>
              )}
            </div>

            {addr && (
              <div className="ps-panel">
                <h3 className="ps-panel__heading">
                  {he ? "כתובת למשלוח" : "Shipping Destination"}
                </h3>
                <address className="ps-address">
                  {[
                    addr.fullName || addr.name,
                    addr.street || addr.address,
                    addr.city,
                    addr.zip || addr.zipCode,
                    addr.country,
                  ]
                    .filter(Boolean)
                    .map((line, i) => (
                      <span key={i} className="ps-address__line">
                        {line}
                      </span>
                    ))}
                </address>
              </div>
            )}
          </div>
        )}

        {/* ── Items purchased ──────────────────────────────────────────── */}
        {orderDetails?.items?.length > 0 && (
          <section className="ps-panel ps-fade ps-fade--3">
            <h3 className="ps-panel__heading">
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
                  <div className="ps-item__info">
                    <h4 className="ps-item__name">{item.name}</h4>
                    <p className="ps-item__qty">
                      {he ? "כמות" : "Qty"}: {item.quantity}
                    </p>
                  </div>
                  {item.price != null && (
                    <span className="ps-item__price">{fmt(item.price)} ₪</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ── Actions ──────────────────────────────────────────────────── */}
        <section className="ps-actions ps-fade ps-fade--4">
          {orderDetails?.orderId && (
            <button
              className="ps-btn ps-btn--primary"
              onClick={() =>
                navigate(
                  `/track-order?orderId=${encodeURIComponent(orderDetails.orderId)}`,
                )
              }
            >
              {he ? "עקוב אחרי ההזמנה" : "Track Order"}
            </button>
          )}
          <button
            className={`ps-btn ${orderDetails?.orderId ? "ps-btn--gold" : "ps-btn--primary"}`}
            onClick={() => navigate("/shop")}
          >
            {he ? "המשך קניות" : "Continue Shopping"}
          </button>
        </section>
      </div>
    </div>
  );
}

export default PaymentSuccess;
