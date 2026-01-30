import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../contexts/LanguageContext";
import "../styles/pages/Auth.css";

function ResetPassword() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { token } = useParams();
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(true);

  useEffect(() => {
    if (!token) {
      setValidToken(false);
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      showError(
        language === "he" ? "הסיסמאות אינן תואמות" : "Passwords don't match",
      );
      return;
    }

    if (formData.password.length < 6) {
      showError(
        language === "he"
          ? "הסיסמה חייבת להכיל לפחות 6 תווים"
          : "Password must be at least 6 characters",
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/auth/resetpassword/${token}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password: formData.password }),
        },
      );

      const data = await response.json();

      if (data.success) {
        showSuccess(
          language === "he"
            ? "הסיסמה שונתה בהצלחה!"
            : "Password reset successful!",
        );

        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        showError(
          data.message ||
            (language === "he"
              ? "שגיאה באיפוס הסיסמה. הקישור אולי פג תוקף"
              : "Error resetting password. Link may have expired"),
        );
        setValidToken(false);
      }
    } catch (error) {
      console.error("Reset password error:", error);
      showError(language === "he" ? "שגיאה בחיבור לשרת" : "Connection error");
    } finally {
      setLoading(false);
    }
  };

  if (!validToken) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-header">
            <h1>❌ {language === "he" ? "קישור לא תקין" : "Invalid Link"}</h1>
            <p>
              {language === "he"
                ? "הקישור לאיפוס סיסמה פג תוקף או אינו תקין"
                : "The password reset link has expired or is invalid"}
            </p>
          </div>

          <button
            className="btn"
            onClick={() => navigate("/forgot-password")}
            style={{ marginTop: "20px" }}
          >
            {language === "he" ? "בקש קישור חדש" : "Request New Link"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>{language === "he" ? "איפוס סיסמה" : "Reset Password"}</h1>
          <p>
            {language === "he"
              ? "הזן סיסמה חדשה לחשבון שלך"
              : "Enter a new password for your account"}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password">
              {language === "he" ? "סיסמה חדשה" : "New Password"}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              placeholder={
                language === "he" ? "לפחות 6 תווים" : "At least 6 characters"
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">
              {language === "he" ? "אימות סיסמה" : "Confirm Password"}
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder={
                language === "he" ? "הזן את הסיסמה שוב" : "Enter password again"
              }
            />
          </div>

          <button type="submit" className="btn auth-btn" disabled={loading}>
            {loading
              ? language === "he"
                ? "מאפס..."
                : "Resetting..."
              : language === "he"
                ? "אפס סיסמה"
                : "Reset Password"}
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

export default ResetPassword;
