import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../contexts/LanguageContext";
import "../styles/pages/Auth.css";

function Auth() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  // Get return path and cart data from location state
  const returnTo = location.state?.returnTo || "/";
  const cartItems = location.state?.cartItems;
  const total = location.state?.total;

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
      if (!isLogin) {
        // Register validation
        if (formData.password !== formData.confirmPassword) {
          showError(t("passwordMismatch"));
          setLoading(false);
          return;
        }

        // Password strength validation
        const passwordRegex =
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
        if (!passwordRegex.test(formData.password)) {
          showError(
            language === "he"
              ? "הסיסמה חייבת להכיל לפחות 8 ספרות, אות קטנה, אות גדולה ותו מיוחד"
              : "Password must contain at least 8 characters, including uppercase, lowercase, and special character",
          );
          setLoading(false);
          return;
        }
      }

      const endpoint = isLogin ? "login" : "register";
      const body = isLogin
        ? { email: formData.email, password: formData.password }
        : {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
          };

      const API_BASE_URL =
        import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${API_BASE_URL}/api/auth/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        // Save token
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.data));

        const userName =
          data.data.fullName ||
          `${data.data.firstName} ${data.data.lastName}` ||
          data.data.name ||
          (language === "he" ? "משתמש" : "User");
        showSuccess(
          isLogin
            ? `${language === "he" ? "שלום" : "Hello"} ${userName}! ${t("loginSuccess")}`
            : `${language === "he" ? `ברוך הבא` : "Welcome"} ${userName}! ${t(
                "registerSuccess",
              )}`,
        );

        // Navigate after a short delay to allow toast to show
        setTimeout(() => {
          // If coming from checkout, return to checkout with cart data
          if (returnTo === "/checkout" && cartItems && total) {
            navigate("/checkout", { state: { cartItems, total } });
          } else {
            navigate(returnTo);
          }
        }, 1000);
      } else {
        showError(data.message || t("error"));
      }
    } catch (error) {
      console.error("Auth error:", error);
      showError(
        language === "he"
          ? "שגיאה בהתחברות. אנא נסה שוב."
          : "Connection error. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>{isLogin ? t("signIn") : t("signUp")}</h1>
          <p>{isLogin ? t("welcomeBack") : t("joinUs")}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label htmlFor="firstName">
                  {language === "he" ? "שם פרטי" : "First Name"}
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">
                  {language === "he" ? "שם משפחה" : "Last Name"}
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">
                  {language === "he" ? "טלפון" : "Phone"}
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder={
                    language === "he" ? "05X-XXXXXXX" : "05X-XXXXXXX"
                  }
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="email">{t("email")}</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t("password")}</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">{t("confirmPassword")}</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <button type="submit" className="btn auth-btn" disabled={loading}>
            {loading
              ? language === "he"
                ? "מעבד..."
                : "Processing..."
              : isLogin
                ? t("signIn")
                : t("signUp")}
          </button>

          {isLogin && (
            <div className="forgot-password-link">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="link-btn"
              >
                {language === "he" ? "שכחת סיסמה?" : "Forgot password?"}
              </button>
            </div>
          )}
        </form>

        <div className="auth-toggle">
          <p>
            {isLogin ? t("dontHaveAccount") : t("alreadyHaveAccount")}
            <button onClick={toggleMode} className="toggle-btn">
              {isLogin ? t("signUp") : t("signIn")}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Auth;
