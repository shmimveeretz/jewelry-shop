import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../contexts/LanguageContext";
import { payPlusService } from "../utils/payPlusService";
import "../styles/pages/PaymentSuccess.css";

function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const { language } = useLanguage();
  const [verifying, setVerifying] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get transaction UID from URL parameters
        const transactionUid =
          searchParams.get("transaction_uid") ||
          searchParams.get("page_request_uid");

        if (!transactionUid) {
          throw new Error("Transaction ID not found");
        }

        // Get pending order data from localStorage
        const pendingOrderData = localStorage.getItem("pendingOrder");
        const orderData = pendingOrderData
          ? JSON.parse(pendingOrderData)
          : null;

        // Verify payment with backend
        const result = await payPlusService.verifyPayment(
          transactionUid,
          orderData,
        );

        if (result.success && result.status === "completed") {
          setOrderDetails({
            transactionUid,
            amount: result.transactionDetails.amount,
            customerName: result.transactionDetails.customerName,
            email: result.transactionDetails.email,
            items: orderData?.items || [],
          });

          // Clear cart and pending order
          clearCart();
          localStorage.removeItem("cart");
          localStorage.removeItem("pendingOrder");
        } else {
          throw new Error("Payment verification failed");
        }
      } catch (err) {
        console.error("Payment verification error:", err);
        setError(err.message);
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams, clearCart]);

  if (verifying) {
    return (
      <div className="payment-status-page">
        <div className="payment-status-container">
          <div className="loading-spinner"></div>
          <h2>
            {language === "he" ? "מאמת תשלום..." : "Verifying payment..."}
          </h2>
          <p>
            {language === "he"
              ? "אנא המתן, אנחנו מאמתים את התשלום שלך"
              : "Please wait while we verify your payment"}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-status-page">
        <div className="payment-status-container error">
          <div className="status-icon">❌</div>
          <h1>
            {language === "he"
              ? "שגיאה באימות התשלום"
              : "Payment Verification Error"}
          </h1>
          <p>{error}</p>
          <button className="btn" onClick={() => navigate("/contact")}>
            {language === "he" ? "צור קשר" : "Contact Us"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-status-page">
      <div className="payment-status-container success">
        <div className="status-icon">✅</div>
        <h1>
          {language === "he" ? "התשלום הושלם בהצלחה!" : "Payment Successful!"}
        </h1>

        {orderDetails && (
          <div className="order-details">
            <p className="success-message">
              {language === "he"
                ? "תודה על הרכישה! אישור הזמנה נשלח לכתובת המייל שלך."
                : "Thank you for your purchase! Order confirmation has been sent to your email."}
            </p>

            <div className="order-info">
              <h3>{language === "he" ? "פרטי הזמנה:" : "Order Details:"}</h3>
              <div className="info-row">
                <span className="label">
                  {language === "he" ? "מספר עסקה:" : "Transaction ID:"}
                </span>
                <span className="value">{orderDetails.transactionUid}</span>
              </div>
              <div className="info-row">
                <span className="label">
                  {language === "he" ? "סכום:" : "Amount:"}
                </span>
                <span className="value">{orderDetails.amount} ₪</span>
              </div>
              <div className="info-row">
                <span className="label">
                  {language === "he" ? "אימייל:" : "Email:"}
                </span>
                <span className="value">{orderDetails.email}</span>
              </div>
            </div>

            {orderDetails.items && orderDetails.items.length > 0 && (
              <div className="order-items">
                <h3>
                  {language === "he" ? "מוצרים שנרכשו:" : "Items Purchased:"}
                </h3>
                {orderDetails.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <span>{item.name}</span>
                    <span>x{item.quantity}</span>
                    <span>{item.price} ₪</span>
                  </div>
                ))}
              </div>
            )}

            <div className="next-steps">
              <h3>{language === "he" ? "מה הלאה?" : "What's Next?"}</h3>
              <ul>
                <li>
                  {language === "he"
                    ? "קיבלת אישור הזמנה למייל"
                    : "You've received an order confirmation email"}
                </li>
                <li>
                  {language === "he"
                    ? "נתחיל להכין את ההזמנה שלך"
                    : "We'll start preparing your order"}
                </li>
                <li>
                  {language === "he"
                    ? "תקבל עדכון כשההזמנה תישלח"
                    : "You'll receive an update when your order ships"}
                </li>
              </ul>
            </div>
          </div>
        )}

        <div className="action-buttons">
          <button className="btn btn-primary" onClick={() => navigate("/")}>
            {language === "he" ? "חזרה לדף הבית" : "Back to Home"}
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/shop")}
          >
            {language === "he" ? "המשך קניות" : "Continue Shopping"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;
