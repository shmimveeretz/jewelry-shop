import { Component } from "react";

/**
 * Last line of defence: a rendering error anywhere below shows a friendly,
 * bilingual message with a way out instead of a blank white page.
 *
 * A failed lazy chunk (common right after a deploy, when the browser still
 * holds the old index.html) is fixed by a reload, so that case reloads once
 * automatically.
 */
const RELOAD_FLAG = "chunkReloadedAt";

function isChunkLoadError(error) {
  const message = String(error?.message || "");
  return (
    error?.name === "ChunkLoadError" ||
    /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(
      message,
    )
  );
}

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled UI error:", error, info?.componentStack);

    if (isChunkLoadError(error)) {
      try {
        const last = Number(sessionStorage.getItem(RELOAD_FLAG) || 0);
        // At most one automatic reload per minute, to avoid a reload loop
        if (Date.now() - last > 60_000) {
          sessionStorage.setItem(RELOAD_FLAG, String(Date.now()));
          window.location.reload();
        }
      } catch {
        // Storage blocked: fall through to the error screen
      }
    }
  }

  componentDidUpdate(prevProps) {
    // Navigating elsewhere clears the error
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    if (!this.state.error) return this.props.children;

    let language = "he";
    try {
      language = localStorage.getItem("language") || "he";
    } catch {
      // ignore
    }
    const he = language === "he";

    return (
      <div className="app-error" role="alert" dir={he ? "rtl" : "ltr"}>
        <h1>{he ? "משהו השתבש" : "Something went wrong"}</h1>
        <p>
          {he
            ? "אירעה שגיאה בטעינת העמוד. אפשר לנסות לרענן, ואם הבעיה נמשכת — נשמח לעזור בוואטסאפ."
            : "This page failed to load. Please try refreshing — if it keeps happening, we're happy to help on WhatsApp."}
        </p>
        <div className="app-error__actions">
          <button type="button" className="btn" onClick={() => window.location.reload()}>
            {he ? "רענון העמוד" : "Reload page"}
          </button>
          <a className="btn btn-secondary" href="/">
            {he ? "לדף הבית" : "Home page"}
          </a>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
