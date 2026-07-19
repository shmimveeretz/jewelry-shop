import { useEffect, useRef, useState } from "react";
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
          {he ? "תודה על ההזמנה!" : "Thank You for Your Order!"}
        </h1>
        <p className="ps-subtitle">
          {he
            ? "ההזמנה התקבלה בהצלחה. שלחנו אליך אישור למייל עם מספר המעקב."
            : "Your order was received successfully. We sent a confirmation email with your tracking number."}
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
                    {he ? "מספר מעקב הזמנה:" : "Tracking #:"}
                  </span>
                  <span className="ps-row__value ps-row__value--mono">
                    {orderDetails.orderId}
                  </span>
                </div>
              )}

              {orderDetails.transactionUid && (
                <div className="ps-row">
                  <span className="ps-row__label">
                    {he ? "מזהה עסקה:" : "Transaction ID:"}
                  </span>
                  <span className="ps-row__value ps-row__value--mono ps-row__value--truncate">
                    {orderDetails.transactionUid}
                  </span>
                </div>
              )}

              {orderDetails.amount != null && orderDetails.amount !== "" && (
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
                      {item.price != null && (
                        <span className="ps-item__price">
                          {fmt(item.price)} ₪
                        </span>
                      )}
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
                    orderDetails.shippingAddress.fullName ||
                      orderDetails.shippingAddress.name,
                    orderDetails.shippingAddress.street ||
                      orderDetails.shippingAddress.address,
                    orderDetails.shippingAddress.city,
                    orderDetails.shippingAddress.zip ||
                      orderDetails.shippingAddress.zipCode,
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
                    ? "שלחנו אישור הזמנה ומספר מעקב למייל שלך"
                    : "We sent an order confirmation and tracking number to your email"}
                </li>
                <li>
                  {he
                    ? "נתחיל להכין את ההזמנה שלך בהקדם"
                    : "We'll start preparing your order shortly"}
                </li>
                <li>
                  {he
                    ? "ניתן לעקוב אחרי סטטוס ההזמנה בעמוד מעקב הזמנה"
                    : "You can track your order status on the Track Order page"}
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
            className={`ps-btn ${orderDetails?.orderId ? "ps-btn--secondary" : "ps-btn--primary"}`}
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
