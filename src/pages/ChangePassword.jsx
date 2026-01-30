import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../contexts/LanguageContext";
import "../styles/pages/Auth.css";

function ChangePassword() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // בדוק שיש resetToken ב-localStorage
    const token = localStorage.getItem("resetToken");
    if (!token) {
      showError(
        language === "he"
          ? "אין לך הרשאה לשינוי סיסמה"
          : "You don't have permission to change password",
      );
      navigate("/forgot-password");
    }
  }, [navigate, language, showError]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (formData.newPassword.length < 6) {
        showError(
          language === "he"
            ? "הסיסמה החדשה חייבת להכיל לפחות 6 תווים"
            : "New password must be at least 6 characters",
        );
        setLoading(false);
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        showError(
          language === "he" ? "הסיסמאות אינן תואמות" : "Passwords don't match",
        );
        setLoading(false);
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/auth/changepassword",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: localStorage.getItem("resetEmail"),
            newPassword: formData.newPassword,
            resetToken: localStorage.getItem("resetToken"),
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        showSuccess(
          language === "he"
            ? "הסיסמה שונתה בהצלחה!"
            : "Password changed successfully!",
        );

        // 🎉 נקה את localStorage
        localStorage.removeItem("resetToken");
        localStorage.removeItem("resetEmail");

        // Navigate to login after 2 seconds
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        showError(
          data.message ||
            (language === "he"
              ? "שגיאה בשינוי הסיסמה"
              : "Error changing password"),
        );
      }
    } catch (error) {
      console.error("Change password error:", error);
      showError(language === "he" ? "שגיאה בחיבור לשרת" : "Connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>{language === "he" ? "שינוי סיסמה" : "Change Password"}</h1>
          <p>{language === "he" ? "הזן סיסמה חדשה" : "Enter a new password"}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="newPassword">
              {language === "he" ? "סיסמה חדשה" : "New Password"}
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
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
              {language === "he" ? "אימות סיסמה חדשה" : "Confirm New Password"}
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
                ? "משנה..."
                : "Changing..."
              : language === "he"
                ? "שנה סיסמה"
                : "Change Password"}
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

export default ChangePassword;
