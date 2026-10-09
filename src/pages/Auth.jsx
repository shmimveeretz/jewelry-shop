import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../contexts/LanguageContext";
import "../styles/pages/Auth.css";
import { API_BASE_URL } from "../constants/api";

function Auth() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    // Opt-in must be an active choice (Israeli anti-spam law, GDPR)
    newsletterSubscribe: false,
  });

  // Get return path and cart data from location state
  const returnTo = location.state?.returnTo || "/";
  const cartItems = location.state?.cartItems;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
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
            firstName: formData.firstname,
            lastName: formData.lastname,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            newsletterSubscribe: formData.newsletterSubscribe,
          };

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

        // The server sends the welcome email itself on registration.
        const userName =
          [data.data.firstName, data.data.lastName].filter(Boolean).join(" ") ||
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
          // A "buy now" item survives the login detour; otherwise checkout
          // reads the cart itself.
          if (returnTo === "/checkout" && cartItems?.length) {
            navigate("/checkout", { state: { cartItems } });
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
      newsletterSubscribe: false,
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
                <label htmlFor="firstname">
                  {language === "he" ? "שם פרטי" : "First name"}
                </label>
                <input
                  type="text"
                  id="firstname"
                  name="firstname"
                  autoComplete="given-name"
                  value={formData.firstname}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastname">
                  {language === "he" ? "שם משפחה" : "Last name"}
                </label>
                <input
                  type="text"
                  id="lastname"
                  name="lastname"
                  autoComplete="family-name"
                  value={formData.lastname}
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
                  autoComplete="tel"
                  inputMode="tel"
                  dir="ltr"
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
              autoComplete="email"
              inputMode="email"
              dir="ltr"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t("password")}</label>
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-pressed={showPassword}
                aria-controls="password"
              >
                {showPassword
                  ? language === "he" ? "הסתרה" : "Hide"
                  : language === "he" ? "הצגה" : "Show"}
              </button>
            </div>
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label htmlFor="confirmPassword">{t("confirmPassword")}</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Newsletter opt-in */}
              <div className="form-group form-group--checkbox">
                <label htmlFor="newsletterSubscribe" className="checkbox-label">
                  <input
                    type="checkbox"
                    id="newsletterSubscribe"
                    name="newsletterSubscribe"
                    checked={formData.newsletterSubscribe}
                    onChange={handleChange}
                  />
                  <span>
                    {language === "he"
                      ? "אשמח לקבל עדכונים, מבצעים וחדשות במייל"
                      : "Subscribe to our newsletter for updates & exclusive offers"}
                  </span>
                </label>
              </div>
            </>
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
