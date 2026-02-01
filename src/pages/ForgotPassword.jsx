import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../contexts/LanguageContext";
import "../styles/pages/Auth.css";

function ForgotPassword() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/forgotpassword`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        },
      );

      const data = await response.json();

      if (data.success) {
        setEmailSent(true);
        showSuccess(
          language === "he"
            ? "נשלח קוד 6 ספרות לאימייל שלך"
            : "6-digit code sent to your email",
        );

        // Navigate to verify code page after 2 seconds
        setTimeout(() => {
          navigate("/verify-code", { state: { email } });
        }, 2000);
      } else {
        showError(
          data.message ||
            (language === "he" ? "שגיאה בשליחת אימייל" : "Error sending email"),
        );
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      showError(language === "he" ? "שגיאה בחיבור לשרת" : "Connection error");
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-header">
            <h1>
              ✅{" "}
              {language === "he"
                ? "קוד נשלח בהצלחה!"
                : "Code Sent Successfully!"}
            </h1>
            <p
              style={{
                color: "#4CAF50",
                fontSize: "1.1rem",
                fontWeight: "bold",
              }}
            >
              {language === "he"
                ? "קוד 6 ספרות נשלח לאימייל שלך"
                : "A 6-digit code has been sent to your email"}
            </p>
          </div>

          <div className="email-sent-message">
            <p>
              <strong>{language === "he" ? "כתובת:" : "Email:"}</strong>
              <br />
              {email}
            </p>
            <hr style={{ margin: "1rem 0", borderColor: "#ddd" }} />
            <p style={{ color: "#d32f2f", fontWeight: "bold" }}>
              ⏱️{" "}
              {language === "he"
                ? "הקוד תקף ל-10 דקות בלבד"
                : "The code is valid for 10 minutes only"}
            </p>
            <p>
              {language === "he"
                ? 'בדוק את תיבת הדוא"ל (וגם ספאם) והעתק את הקוד 6 הספרות'
                : "Check your email (including spam) and copy the 6-digit code"}
            </p>
          </div>

          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              backgroundColor: "#e3f2fd",
              borderRadius: "5px",
            }}
          >
            <p style={{ fontSize: "0.9rem", color: "#1976d2" }}>
              {language === "he"
                ? "⏳ מעביר אותך לעמוד אימות הקוד בעוד כמה שניות..."
                : "⏳ Redirecting you to code verification page in a few seconds..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>{language === "he" ? "שכחת סיסמה?" : "Forgot Password?"}</h1>
          <p>
            {language === "he"
              ? "הזן את כתובת האימייל שלך ונשלח לך קוד 6 ספרות"
              : "Enter your email address and we'll send you a 6-digit code"}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">
              {language === "he" ? "אימייל" : "Email"}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder={
                language === "he" ? "example@email.com" : "example@email.com"
              }
            />
          </div>

          <button type="submit" className="btn auth-btn" disabled={loading}>
            {loading
              ? language === "he"
                ? "שולח..."
                : "Sending..."
              : language === "he"
                ? "שלח קוד"
                : "Send Code"}
          </button>
        </form>

        <div className="auth-toggle">
          <p>
            <button onClick={() => navigate("/login")} className="link-btn">
              {language === "he" ? "חזרה להתחברות" : "Back to Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
