import { useState, useEffect, useRef, useLayoutEffect, Fragment } from "react";
import { FaTimes } from "react-icons/fa";
import { useLanguage } from "../contexts/LanguageContext";
import {
  dismissMotd,
  getMotdMessages,
  isMotdDismissed,
} from "../utils/motd";
import "../styles/components/TopBanner.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const MARQUEE_PX_PER_SECOND = 42;
const MARQUEE_MIN_DURATION_SEC = 22;
const MARQUEE_MAX_DURATION_SEC = 72;

function TopBanner() {
  const { language } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [dismissed, setDismissed] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [durationSec, setDurationSec] = useState(24);
  const trackRef = useRef(null);
  const viewportRef = useRef(null);
  const bannerRef = useRef(null);

  useEffect(() => {
    const fetchMotd = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/settings/motd`);
        const data = await response.json();
        if (!data.success) return;

        const activeMessages = getMotdMessages(data.motd, data.motd2);
        if (!activeMessages.length) return;

        if (isMotdDismissed(data.motd, data.motd2)) {
          setDismissed(true);
        }
        setMessages(activeMessages);
      } catch {
        // MOTD is optional; fail silently
      }
    };

    fetchMotd();
  }, []);

  useLayoutEffect(() => {
    if (!messages.length || dismissed) return;

    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport) return;

    const viewportWidth = viewport.clientWidth;
    const trackWidth = track.scrollWidth;
    const unitWidth = trackWidth / 2;
    const fromPx = viewportWidth;
    const toPx = -unitWidth;
    const travelPx = fromPx - toPx;
    const computedDuration = Math.min(
      MARQUEE_MAX_DURATION_SEC,
      Math.max(
        MARQUEE_MIN_DURATION_SEC,
        Math.round(travelPx / MARQUEE_PX_PER_SECOND),
      ),
    );

    track.style.setProperty("--tb-from", `${fromPx}px`);
    track.style.setProperty("--tb-to", `${toPx}px`);
    setDurationSec(computedDuration);
    bannerRef.current?.style.setProperty(
      "--tb-duration",
      `${computedDuration}s`,
    );

    track.style.animation = "none";
    void track.offsetHeight;
    track.style.removeProperty("animation");
  }, [messages, dismissed]);

  const handleDismiss = () => {
    setIsClosing(true);
    window.setTimeout(() => {
      dismissMotd(...messages);
      setDismissed(true);
    }, 350);
  };

  if (!messages.length || dismissed) return null;

  const ariaLabel = language === "he" ? "הודעה מהחנות" : "Store announcement";
  const closeLabel = language === "he" ? "סגור הודעה" : "Close announcement";

  const renderUnit = (duplicate = false) =>
    messages.map((text, index) => (
      <Fragment key={`${duplicate ? "dup" : "unit"}-${index}`}>
        <span
          className="top-banner-text"
          aria-hidden={duplicate ? true : undefined}
        >
          {text}
        </span>
        <span className="top-banner-separator" aria-hidden="true">
          ◆
        </span>
      </Fragment>
    ));

  return (
    <div
      ref={bannerRef}
      className={`top-banner${isClosing ? " top-banner--closing" : ""}`}
      role="region"
      aria-label={ariaLabel}
      dir="rtl"
      style={{ "--tb-duration": `${durationSec}s` }}
    >
      <div className="top-banner-pattern" aria-hidden="true" />
      <div className="top-banner-edge top-banner-edge--start" aria-hidden="true" />
      <div className="top-banner-edge top-banner-edge--end" aria-hidden="true" />

      <button
        type="button"
        className="top-banner-close"
        onClick={handleDismiss}
        aria-label={closeLabel}
      >
        <FaTimes aria-hidden="true" />
      </button>

      <div className="top-banner-viewport" ref={viewportRef}>
        <div className="top-banner-track" ref={trackRef}>
          {renderUnit()}
          {renderUnit(true)}
        </div>
      </div>
    </div>
  );
}

export default TopBanner;
