import { useEffect, useState } from "react";
import { FaDesktop, FaMobileAlt, FaSyncAlt, FaExternalLinkAlt } from "react-icons/fa";
import { createPreviewToken } from "../adminApi";

const WIDTHS = {
  mobile: 390,
  desktop: 1180,
};

/**
 * Renders the draft in an iframe pointed at the real /lp/ route with a signed
 * preview token.
 *
 * Not a re-implementation of the page inside the editor: the preview runs the
 * exact same block components the visitor gets, so it cannot quietly disagree
 * with production.
 */
function DppPreviewFrame({ pageId, slug, refreshKey, onError }) {
  const [token, setToken] = useState(null);
  const [device, setDevice] = useState("mobile");
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;

    createPreviewToken(pageId)
      .then((data) => {
        if (!cancelled) setToken(data.token);
      })
      .catch((error) => onError?.(error.message));

    return () => {
      cancelled = true;
    };
  }, [pageId, onError]);

  // The iframe reloads whenever the draft is saved, so what is on screen is
  // always what is stored — never a stale render of unsaved edits.
  useEffect(() => {
    setNonce((value) => value + 1);
  }, [refreshKey]);

  if (!token) {
    return <div className="dpp-preview__loading">מכינים תצוגה מקדימה…</div>;
  }

  const src = `/lp/${slug}?previewToken=${encodeURIComponent(token)}&v=${nonce}`;

  return (
    <div className="dpp-preview">
      <div className="dpp-preview__bar">
        <button
          type="button"
          className={`admin-shell__icon-btn ${device === "mobile" ? "is-on" : ""}`}
          onClick={() => setDevice("mobile")}
          title="תצוגת מובייל"
        >
          <FaMobileAlt />
        </button>
        <button
          type="button"
          className={`admin-shell__icon-btn ${device === "desktop" ? "is-on" : ""}`}
          onClick={() => setDevice("desktop")}
          title="תצוגת דסקטופ"
        >
          <FaDesktop />
        </button>
        <button
          type="button"
          className="admin-shell__icon-btn"
          onClick={() => setNonce((value) => value + 1)}
          title="רענון"
        >
          <FaSyncAlt />
        </button>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="admin-shell__icon-btn"
          title="פתיחה בחלון חדש"
        >
          <FaExternalLinkAlt />
        </a>
      </div>

      <div className="dpp-preview__stage">
        <iframe
          key={nonce}
          src={src}
          title="תצוגה מקדימה"
          style={{ width: WIDTHS[device] }}
          className="dpp-preview__frame"
        />
      </div>
    </div>
  );
}

export default DppPreviewFrame;
