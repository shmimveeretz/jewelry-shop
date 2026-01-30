import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../contexts/LanguageContext";
import "../styles/pages/Auth.css";

function VerifyCode() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError } = useToast();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate code format (6 digits)
      if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
        showError(
          language === "he"
            ? "הקוד חייב להיות 6 ספרות"
            : "Code must be 6 digits",
        );
        setLoading(false);
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/auth/verifycode",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, code }),
        },
      );

      const data = await response.json();

      if (data.success) {
        showSuccess(
          language === "he"
            ? "קוד נאומת בהצלחה!"
            : "Code verified successfully!",
        );

        // 🎯 שמור את resetToken ו-email ב-localStorage
        localStorage.setItem("resetToken", data.resetToken);
        localStorage.setItem("resetEmail", email);

        // Navigate to change password page after 2 seconds
        setTimeout(() => {
          navigate("/change-password");
        }, 2000);
      } else {
        showError(
          data.message ||
            (language === "he"
              ? "קוד לא נכון או פג תוקף"
              : "Invalid or expired code"),
        );
      }
    } catch (error) {
      console.error("Verify code error:", error);
      showError(language === "he" ? "שגיאה בחיבור לשרת" : "Connection error");
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>{language === "he" ? "אימות קוד" : "Verify Code"}</h1>
          <p>
            {language === "he"
              ? "הזן את הקוד 6 הספרות שקיבלת באימייל"
              : "Enter the 6-digit code you received in your email"}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="code">{language === "he" ? "קוד" : "Code"}</label>
            <input
              type="text"
              id="code"
              name="code"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              required
              maxLength="6"
              placeholder={language === "he" ? "000000" : "000000"}
              inputMode="numeric"
              style={{
                fontSize: "1.5rem",
                letterSpacing: "0.5rem",
                textAlign: "center",
              }}
            />
          </div>

          <p
            style={{ fontSize: "0.85rem", color: "#999", textAlign: "center" }}
          >
            {language === "he"
              ? "הקוד תקף ל-10 דקות בלבד"
              : "The code is valid for 10 minutes only"}
          </p>

          <button type="submit" className="btn auth-btn" disabled={loading}>
            {loading
              ? language === "he"
                ? "בודק..."
                : "Verifying..."
              : language === "he"
                ? "אמת קוד"
                : "Verify Code"}
          </button>
        </form>

        <div className="auth-toggle">
          <p>
            <button
              onClick={() => navigate("/forgot-password")}
              className="link-btn"
            >
              {language === "he" ? "חזור לשליחת קוד" : "Back to Send Code"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default VerifyCode;
