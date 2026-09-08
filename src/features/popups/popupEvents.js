const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Analytics beacon for popup impressions, conversions and dismissals.
 *
 * Deliberately not in services/dppApi.js: the popup runtime loads on every
 * page of the site, and importing that module would pull axios into the eager
 * bundle for a request that sendBeacon makes better anyway — it survives the
 * page unloading, which is exactly when an exit-intent conversion fires.
 */
export const sendPopupEvent = (popupId, variantKey, event) => {
  const url = `${API_BASE_URL}/api/popups/${popupId}/events`;
  const body = JSON.stringify({ variantKey, event });

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
      return;
    }

    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Analytics must never break the page.
  }
};
