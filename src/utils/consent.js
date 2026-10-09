/**
 * Cookie / tracking consent shared by the banner and everything that tracks.
 *
 * Nothing optional (Meta Pixel, GA, visitor geolocation) may run until the
 * visitor accepts. index.html starts the pixel in "revoked" mode; granting
 * here releases it.
 */
export const CONSENT_KEY = "cookieConsent";
const EVENT = "consent-change";

export function hasTrackingConsent() {
  try {
    return localStorage.getItem(CONSENT_KEY) === "granted";
  } catch {
    return false;
  }
}

export function setTrackingConsent(granted) {
  try {
    localStorage.setItem(CONSENT_KEY, granted ? "granted" : "denied");
  } catch {
    // Storage blocked: the choice still applies to this page view
  }

  if (typeof window.gtag === "function") {
    const value = granted ? "granted" : "denied";
    window.gtag("consent", "update", {
      analytics_storage: value,
      ad_storage: value,
      ad_user_data: value,
      ad_personalization: value,
    });
  }
  if (typeof window.fbq === "function") {
    window.fbq("consent", granted ? "grant" : "revoke");
    if (granted) window.fbq("track", "PageView");
  }

  window.dispatchEvent(new CustomEvent(EVENT, { detail: { granted } }));
}

/** Whether the visitor has answered the cookie banner either way */
export function hasAnsweredConsent() {
  try {
    return localStorage.getItem(CONSENT_KEY) !== null;
  } catch {
    // Storage blocked: the banner can't remember an answer, so don't wait on it
    return true;
  }
}

/** Run `callback` once the banner is (or becomes) answered. Returns a cleanup. */
export function whenConsentAnswered(callback) {
  if (hasAnsweredConsent()) {
    callback();
    return () => {};
  }
  const listener = () => {
    window.removeEventListener(EVENT, listener);
    callback();
  };
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}

/** Run `callback` once consent is (or becomes) granted. Returns a cleanup. */
export function whenConsentGranted(callback) {
  if (hasTrackingConsent()) {
    callback();
    return () => {};
  }
  const listener = (event) => {
    if (event.detail?.granted) {
      window.removeEventListener(EVENT, listener);
      callback();
    }
  };
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}

/** Load Google Analytics only when a measurement id is configured. */
export function loadGoogleAnalytics() {
  const id = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!id || document.getElementById("ga-script")) return;
  const script = document.createElement("script");
  script.id = "ga-script";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);
  window.gtag?.("config", id);
}
