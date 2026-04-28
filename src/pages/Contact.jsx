import { useState } from "react";
import {
  FaEnvelope,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaClock,
  FaWhatsapp,
} from "react-icons/fa";
import { useLanguage } from "../contexts/LanguageContext";
import "../styles/pages/Contact.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Contact() {
  const { language } = useLanguage();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setStatus({ type: "success", message: data.message });
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      } else {
        setStatus({ type: "error", message: data.message });
      }
    } catch (error) {
      setStatus({
        type: "error",
        message:
          language === "he"
            ? "אירעה שגיאה בשליחת ההודעה. אנא נסה שוב מאוחר יותר."
            : "An error occurred while sending the message. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-container">
        {/* Page Header */}
        <section className="contact-header">
          <h1>{language === "he" ? "צור קשר" : "Contact Us"}</h1>
          <p>
            {language === "he"
              ? "נשמח ללוות אתכם בבחירת התכשיט המושלם שיחבר בין שמיים לארץ"
              : "We'd love to guide you in choosing the perfect jewelry that connects heaven and earth"}
          </p>
        </section>

        {/* Contact Info Cards */}
        <section className="contact-methods-grid">
          <div className="method-card">
            <div className="method-icon-wrap">
              <FaWhatsapp />
            </div>
            <h3>{language === "he" ? "וואטסאפ" : "WhatsApp"}</h3>
            <p dir="ltr">052-595-5389</p>
          </div>
          <div className="method-card">
            <div className="method-icon-wrap">
              <FaEnvelope />
            </div>
            <h3>{language === "he" ? "דואר אלקטרוני" : "Email"}</h3>
            <p>shmimveeretz@gmail.com</p>
          </div>
          <div className="method-card">
            <div className="method-icon-wrap">
              <FaMapMarkerAlt />
            </div>
            <h3>{language === "he" ? "סטודיו" : "Studio"}</h3>
            <p>Tel Aviv, Israel</p>
          </div>
          <div className="method-card">
            <div className="method-icon-wrap">
              <FaClock />
            </div>
            <h3>{language === "he" ? "שעות פעילות" : "Business Hours"}</h3>
            <p>
              {language === "he"
                ? "א׳–ה׳, 09:00–18:00"
                : "Sun–Thu, 09:00–18:00"}
            </p>
          </div>
        </section>

        {/* Contact Form */}
        <section className="contact-form-section">
          <div className="contact-form-card">
            <form onSubmit={handleSubmit} className="contact-form">
              {status.message && (
                <div className={`status-message ${status.type}`}>
                  {status.message}
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">
                    {language === "he" ? "שם מלא" : "Full Name"}{" "}
                    <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder={
                      language === "he" ? "ישראל ישראלי" : "John Doe"
                    }
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">
                    {language === "he" ? "אימייל" : "Email"}{" "}
                    <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="example@domain.com"
                  />
                </div>
              </div>

              <div className="form-row">
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
                    placeholder="050-000-0000"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="subject">
                    {language === "he" ? "נושא" : "Subject"}
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder={
                      language === "he"
                        ? "בירור לגבי קולקציה"
                        : "Inquiry about collection"
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="message">
                  {language === "he" ? "הודעה" : "Message"}{" "}
                  <span className="required">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  placeholder={
                    language === "he"
                      ? "נשמח לשמוע ממך..."
                      : "We'd love to hear from you..."
                  }
                />
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <span>{language === "he" ? "שולח..." : "Sending..."}</span>
                ) : (
                  <>
                    <FaPaperPlane />
                    {language === "he" ? "שלח הודעה" : "Send Message"}
                  </>
                )}
              </button>
            </form>
          </div>
        </section>

        {/* Decorative Banner */}
        <section className="contact-banner">
          <div className="contact-banner-overlay" />
          <div className="contact-banner-content">
            <h2>
              {language === "he" ? "אומנות שבאה מאהבה" : "Art Born from Love"}
            </h2>
            <p>
              {language === "he"
                ? "כל תכשיט מספר סיפור אחר"
                : "Every jewel tells a different story"}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Contact;
