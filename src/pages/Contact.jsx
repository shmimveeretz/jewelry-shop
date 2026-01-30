import { useState } from "react";
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaPaperPlane,
} from "react-icons/fa";
import { useLanguage } from "../contexts/LanguageContext";
import "../styles/pages/Contact.css";

function Contact() {
  const { t, language } = useLanguage();

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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setStatus({
          type: "success",
          message: data.message,
        });
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      } else {
        setStatus({
          type: "error",
          message: data.message,
        });
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
      <div className="container">
        <div className="contact-header">
          <h1>{t("contactUs")}</h1>
          <p>
            {language === "he"
              ? "נשמח לשמוע ממך! מלא את הטופס ונחזור אליך בהקדם"
              : "We would love to hear from you! Fill out the form and we will get back to you soon"}
          </p>
        </div>

        {/* Contact Form Section - NOW FIRST */}
        <section className="contact-form-section">
          <form onSubmit={handleSubmit} className="contact-form">
            <h2>{t("sendMessage")}</h2>

            {status.message && (
              <div className={`status-message ${status.type}`}>
                {status.message}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="name">
                {t("fullName")} <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder={
                  language === "he"
                    ? "הכנס את שמך המלא"
                    : "Enter your full name"
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                {t("email")} <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="example@email.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">{t("phoneNumber")}</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="050-1234567"
              />
            </div>

            <div className="form-group">
              <label htmlFor="subject">{t("subject")}</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder={
                  language === "he" ? "נושא ההודעה" : "Message subject"
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">
                {t("message")} <span className="required">*</span>
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
                    ? "כתוב כאן את הודעתך..."
                    : "Write your message here..."
                }
              ></textarea>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <span>{language === "he" ? "שולח..." : "Sending..."}</span>
              ) : (
                <>
                  <FaPaperPlane /> {t("sendMessage")}
                </>
              )}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default Contact;
