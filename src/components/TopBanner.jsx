import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import "../styles/components/TopBanner.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const DISMISS_KEY = "motd_dismissed_id";

function TopBanner() {
  const [message, setMessage] = useState("");
  const [dismissed, setDismissed] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const fetchMotd = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/settings/motd`);
        const data = await response.json();
        const text = data.success && (data.motd || data.message);
        if (text && text.trim()) {
          const id = btoa(encodeURIComponent(text.trim())).slice(0, 32);
          if (sessionStorage.getItem(DISMISS_KEY) === id) {
            setDismissed(true);
          }
          setMessage(text.trim());
        }
      } catch {
        // Silent fail
      }
    };
    fetchMotd();
  }, []);

  const handleDismiss = () => {
    setIsClosing(true);
    setTimeout(() => {
      const id = btoa(encodeURIComponent(message)).slice(0, 32);
      sessionStorage.setItem(DISMISS_KEY, id);
      setDismissed(true);
    }, 400);
  };

  if (!message || dismissed) return null;

  return (
    <div
      className={`top-banner${isClosing ? " top-banner--closing" : ""}`}
      role="region"
      aria-label="הודעה"
    >
      <div className="top-banner-pattern" aria-hidden="true" />
      <div className="top-banner-track">
        <span className="top-banner-text">{message}</span>
        <span className="top-banner-text" aria-hidden="true">
          {message}
        </span>
      </div>
      <button
        className="top-banner-close"
        onClick={handleDismiss}
        aria-label="סגור הודעה"
      >
        <FaTimes />
      </button>
    </div>
  );
}

export default TopBanner;
