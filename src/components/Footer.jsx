import { Link } from "react-router-dom";
import {
  FaFacebook,
  FaInstagram,
  FaWhatsapp,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { useLanguage } from "../contexts/LanguageContext";
import "../styles/components/Footer.css";

function Footer() {
  const { t, language } = useLanguage();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>{t("aboutUs")}</h3>
            <p>
              {language === "he"
                ? "שמיים וארץ - חנות תכשיטים יהודיים המתמחה בתכשיטים איכותיים עם סמלים יהודיים. כל תכשיט נעשה באהבה ובקפידה רבה."
                : "Shamayim VaAretz - A Jewish jewelry store specializing in quality jewelry with Jewish symbols. Each piece is made with love and great care."}
            </p>
            <div className="footer-social">
              <a href="#" aria-label="פייסבוק">
                <FaFacebook />
              </a>
              <a
                href="https://www.instagram.com/shmim_ve_eretz"
                aria-label="אינסטגרם"
              >
                <FaInstagram />
              </a>
              <a href="#" aria-label="וואטסאפ">
                <FaWhatsapp />
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h3>{t("quickLinks")}</h3>
            <ul>
              <li>
                <Link to="/">{t("home")}</Link>
              </li>
              <li>
                <Link to="/shop">{t("shop")}</Link>
              </li>
              <li>
                <Link to="/zodiac">{t("zodiac")}</Link>
              </li>
              <li>
                <Link to="/about">{t("about")}</Link>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>{t("customerService")}</h3>
            <ul>
              <li>
                <Link to="/shipping-policy">
                  {language === "he" ? "מדיניות משלוחים" : "Shipping Policy"}
                </Link>
              </li>
              <li>
                <Link to="/return-policy">{t("returnPolicy")}</Link>
              </li>
              <li>
                <Link to="/terms-of-service">{t("termsOfService")}</Link>
              </li>
              <li>
                <Link to="/privacy-policy">{t("privacyPolicy")}</Link>
              </li>
              <li>
                <Link to="/contact">{t("contactUs")}</Link>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>{t("contactUs")}</h3>
            <ul>
              <li>
                <FaEnvelope className="footer-icon" /> shmimveeretz@gmail.com
              </li>
              <li>
                <FaPhone className="footer-icon" /> 052-595-5389
              </li>
              <li>
                <FaMapMarkerAlt className="footer-icon" />{" "}
                {language === "he" ? "תל אביב, ישראל" : "Tel Aviv, Israel"}
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            &copy; {new Date().getFullYear()}{" "}
            {language === "he" ? "שמיים וארץ" : "Shamayim VaAretz"}.{" "}
            {t("allRightsReserved")}.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
