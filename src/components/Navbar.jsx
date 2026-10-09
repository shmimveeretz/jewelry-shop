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
  const { getCartCount, openCartDrawer } = useCart();
  const { showSuccess } = useToast();
  const { language, toggleLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Refresh the signed-in user on navigation (login/logout happen elsewhere)
    try {
      const userStr = localStorage.getItem("user");
      setUser(userStr ? JSON.parse(userStr) : null);
    } catch {
      setUser(null);
    }
    // Any navigation closes the mobile menu
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  }, [location.pathname, location.search]);

  // Mobile menu: Escape closes it and the page behind does not scroll
  useEffect(() => {
    if (!isMenuOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [isMenuOpen]);

  // Lift the header off the page once content scrolls beneath it
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setIsScrolled(window.scrollY > 8));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.name || ""
    : "";

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  const handleLogout = () => {
    const userName = displayName || t("user");
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
    <nav className={`navbar${isScrolled ? " navbar--scrolled" : ""}`} aria-label={language === "he" ? "ניווט ראשי" : "Main navigation"}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img
            src={logo}
            alt={language === "he" ? "שמים וארץ" : "Shamaim VeEretz"}
            className="logo-image"
            // Intrinsic ratio, so the header doesn't shift while the logo loads
            width="2951"
            height="1477"
          />
        </Link>

        <ul id="main-menu" className={`navbar-menu ${isMenuOpen ? "active" : ""}`}>
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
            onMouseEnter={() => !isMenuOpen && setIsDropdownOpen(true)}
            onMouseLeave={() => !isMenuOpen && setIsDropdownOpen(false)}
            onFocus={() => !isMenuOpen && setIsDropdownOpen(true)}
            onBlur={(e) => {
              // Close once keyboard focus leaves the whole dropdown
              if (!isMenuOpen && !e.currentTarget.contains(e.relatedTarget)) {
                setIsDropdownOpen(false);
              }
            }}
          >
            <Link
              to="/shop"
              className={isActive("/shop")}
              onClick={() => {
                if (isMenuOpen) {
                  setIsDropdownOpen((prev) => !prev);
                } else {
                  setIsMenuOpen(false);
                }
              }}
            >
              {t("shop")} <FaChevronDown className="dropdown-icon" aria-hidden="true" />
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
                    ? "כתב עברי קדום"
                    : "Ancient Hebrew Letters"}
                </Link>
              </li>
              <li>
                <Link
                  to="/shop?category=כוכבים"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsDropdownOpen(false);
                  }}
                >
                  {language === "he" ? "כוכבי הלכת" : "Stars Pendants"}
                </Link>
              </li>
              <li>
                <Link
                  to="/shop?category=תליוני מזלות"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsDropdownOpen(false);
                  }}
                >
                  {language === "he" ? "מזלות" : "Zodiac Pendants"}
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
                  {language === "he" ? "אבני החושן" : "Hoshen Stones"}
                </Link>
              </li>
              <li>
                <Link
                  to="/shop?category=שלישיות מיוחדות"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsDropdownOpen(false);
                  }}
                >
                  {language === "he"
                    ? "כוכב, מזל ואבן חושן"
                    : "Trinity Pendants"}
                </Link>
              </li>
              <li>
                <Link
                  to="/shop?category=סמלי בני ישראל"
                  className={isActive("/shop?category=סמלי בני ישראל")}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {language === "he" ? "סמלי בני ישראל" : "Symbols of Israel"}
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
              to="/track-order"
              className={isActive("/track-order")}
              onClick={() => setIsMenuOpen(false)}
            >
              {language === "he" ? "מעקב הזמנה" : "Track Order"}
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
                {language === "he" ? " ניהול" : " Admin"}
              </Link>
            </li>
          )}
        </ul>

        <div className="navbar-icons">
          <button
            type="button"
            onClick={toggleLanguage}
            className="navbar-icon language-btn"
            title={language === "he" ? "Switch to English" : "עבור לעברית"}
            aria-label={language === "he" ? "Switch to English" : "עבור לעברית"}
            lang={language === "he" ? "en" : "he"}
          >
            <FaGlobe aria-hidden="true" />
            <span className="language-text">
              {language === "he" ? "EN" : "עב"}
            </span>
          </button>
          {user ? (
            <>
              <span className="user-name">
                {language === "he"
                  ? `שלום, ${displayName || "משתמש"}`
                  : `Hello, ${displayName || "User"}`}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="navbar-icon logout-btn"
                title={t("logout")}
                aria-label={t("logout")}
              >
                <FaSignOutAlt aria-hidden="true" />
              </button>
            </>
          ) : (
            <Link to="/login" className="navbar-icon" title={t("login")} aria-label={t("login")}>
              <FaUser aria-hidden="true" />
            </Link>
          )}
          <button
            type="button"
            className="navbar-icon cart-icon"
            onClick={openCartDrawer}
            aria-label={
              language === "he"
                ? `עגלת קניות, ${getCartCount()} פריטים`
                : `Shopping cart, ${getCartCount()} items`
            }
          >
            <FaShoppingCart aria-hidden="true" />
            {getCartCount() > 0 && (
              <span className="cart-badge" aria-hidden="true" key={getCartCount()}>
                {getCartCount()}
              </span>
            )}
          </button>
          <button
            type="button"
            className="navbar-mobile-toggle"
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-controls="main-menu"
            aria-label={
              isMenuOpen
                ? language === "he"
                  ? "סגירת התפריט"
                  : "Close menu"
                : language === "he"
                  ? "פתיחת התפריט"
                  : "Open menu"
            }
          >
            {isMenuOpen ? <FaTimes aria-hidden="true" /> : <FaBars aria-hidden="true" />}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
