import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaShoppingCart,
  FaBars,
  FaTimes,
  FaUser,
  FaSignOutAlt,
  FaChevronDown,
  FaGlobe,
} from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../contexts/LanguageContext";
import "../styles/components/Navbar.css";
import logo from "../assets/logo.svg";

function Navbar() {
  const { getCartCount } = useCart();
  const { showSuccess } = useToast();
  const { language, toggleLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, [location]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  const handleLogout = () => {
    const userName = user?.name || t("user");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
    showSuccess(
      `${
        language === "he" ? `להתראות ${userName}! ` : `Goodbye ${userName}! `
      }${t("logoutSuccess")}`,
    );
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src={logo} alt="שמיים וארץ" className="logo-image" />
        </Link>

        <ul className={`navbar-menu ${isMenuOpen ? "active" : ""}`}>
          <li>
            <Link
              to="/"
              className={isActive("/")}
              onClick={() => setIsMenuOpen(false)}
            >
              {t("home")}
            </Link>
          </li>
          <li
            className="dropdown"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <Link
              to="/shop"
              className={isActive("/shop")}
              onClick={() => setIsMenuOpen(false)}
            >
              {t("shop")} <FaChevronDown className="dropdown-icon" />
            </Link>
            <ul className={`dropdown-menu ${isDropdownOpen ? "show" : ""}`}>
              <li>
                <Link
                  to="/shop?category=אותיות עבריות"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsDropdownOpen(false);
                  }}
                >
                  {language === "he"
                    ? "אותיות עבריות עתיקות"
                    : "Ancient Hebrew Letters"}
                </Link>
              </li>
              <li>
                <Link
                  to="/shop?category=אבני חושן"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsDropdownOpen(false);
                  }}
                >
                  {language === "he" ? "אבני חושן" : "Hoshen Stones"}
                </Link>
              </li>
              <li>
                <Link
                  to="/shop?category=כוכב חושן מזל"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsDropdownOpen(false);
                  }}
                >
                  {language === "he"
                    ? "כוכב + חושן + מזל"
                    : "Star + Hoshen + Zodiac"}
                </Link>
              </li>
            </ul>
          </li>
          <li>
            <Link
              to="/zodiac"
              className={isActive("/zodiac")}
              onClick={() => setIsMenuOpen(false)}
            >
              {t("zodiac")}
            </Link>
          </li>
          <li>
            <Link
              to="/about"
              className={isActive("/about")}
              onClick={() => setIsMenuOpen(false)}
            >
              {t("about")}
            </Link>
          </li>
          <li>
            <Link
              to="/contact"
              className={isActive("/contact")}
              onClick={() => setIsMenuOpen(false)}
            >
              {t("contactUs")}
            </Link>
          </li>
          {(user?.role === "admin" || user?.role === "roi") && (
            <li>
              <Link
                to="/admin"
                className={isActive("/admin")}
                onClick={() => setIsMenuOpen(false)}
              >
                {language === "he" ? "📊 ניהול" : "📊 Admin"}
              </Link>
            </li>
          )}
        </ul>

        <div className="navbar-icons">
          <button
            onClick={toggleLanguage}
            className="navbar-icon language-btn"
            title={language === "he" ? "Switch to English" : "עבור לעברית"}
          >
            <FaGlobe />
            <span className="language-text">
              {language === "he" ? "EN" : "עב"}
            </span>
          </button>
          {user ? (
            <>
              <span className="user-name">
                {language === "he"
                  ? `שלום, ${user.firstName ? `${user.firstName} ${user.lastName}` : user.name || "משתמש"}`
                  : `Hello, ${user.firstName ? `${user.firstName} ${user.lastName}` : user.name || "User"}`}
              </span>
              <button
                onClick={handleLogout}
                className="navbar-icon logout-btn"
                title={t("logout")}
              >
                <FaSignOutAlt />
              </button>
            </>
          ) : (
            <Link to="/login" className="navbar-icon" title={t("login")}>
              <FaUser />
            </Link>
          )}
          <Link to="/cart" className="navbar-icon cart-icon">
            <FaShoppingCart />
            {getCartCount() > 0 && (
              <span className="cart-badge">{getCartCount()}</span>
            )}
          </Link>
          <button className="navbar-mobile-toggle" onClick={toggleMenu}>
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
