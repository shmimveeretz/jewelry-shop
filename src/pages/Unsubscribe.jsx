import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { API_BASE_URL } from "../constants/api";

/**
 * Landing page for the unsubscribe link in newsletter emails. The link
 * carries the address and a server-signed token; one click opts out.
 */
function Unsubscribe() {
  const { language } = useLanguage();
  const he = language === "he";
  const [params] = useSearchParams();
  const [status, setStatus] = useState("working"); // working | done | error

  useEffect(() => {
    const email = params.get("email");
    const token = params.get("token");
    if (!email || !token) {
      setStatus("error");
      return;
    }
    fetch(`${API_BASE_URL}/api/newsletter/unsubscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token }),
    })
      .then((r) => r.json())
      .then((data) => setStatus(data.success ? "done" : "error"))
      .catch(() => setStatus("error"));
  }, [params]);

  return (
    <div className="not-found" role="status" aria-live="polite">
      {status === "working" && <h1>{he ? "מעדכנים…" : "Updating…"}</h1>}
      {status === "done" && (
        <>
          <h1>{he ? "הוסרת מרשימת התפוצה" : "You've been unsubscribed"}</h1>
          <p>
            {he
              ? "לא נשלח אליך יותר דיוור שיווקי. מיילים על הזמנות שביצעת ימשיכו להגיע כרגיל."
              : "You won't receive marketing emails anymore. Emails about your orders will still arrive."}
          </p>
        </>
      )}
      {status === "error" && (
        <>
          <h1>{he ? "הקישור אינו תקין" : "This link is invalid"}</h1>
          <p>
            {he
              ? "לא הצלחנו לעדכן את ההרשמה. אפשר לפנות אלינו ונסיר אותך ידנית."
              : "We couldn't update your subscription. Contact us and we'll remove you manually."}
          </p>
        </>
      )}
      <div className="not-found__actions">
        <Link to="/" className="btn">
          {he ? "לדף הבית" : "Home page"}
        </Link>
        {status === "error" && (
          <Link to="/contact" className="btn btn-secondary">
            {he ? "צור קשר" : "Contact us"}
          </Link>
        )}
      </div>
    </div>
  );
}

export default Unsubscribe;
