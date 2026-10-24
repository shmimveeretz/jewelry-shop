import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackEvent } from "../utils/tracking";
import {
  hasTrackingConsent,
  whenConsentGranted,
  loadGoogleAnalytics,
} from "../utils/consent";

/**
 * All optional tracking, in one place and only after cookie consent:
 * - Meta Pixel PageView on client-side navigation (index.html sends the first)
 * - Google Analytics, when VITE_GA_MEASUREMENT_ID is configured
 */

function Analytics() {
  const { pathname } = useLocation();
  const isFirstRender = useRef(true);

  useEffect(
    () =>
      whenConsentGranted(() => {
        loadGoogleAnalytics();
      }),
    [],
  );

  // A WhatsApp chat is how many customers ask before buying; count it as a
  // Contact wherever the link lives (footer, contact page, checkout)
  useEffect(() => {
    const onClick = (event) => {
      const link = event.target.closest?.('a[href*="wa.me/"]');
      if (link) trackEvent("Contact", { method: "whatsapp", value: 0 });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return; // The first PageView comes from index.html
    }
    if (hasTrackingConsent() && typeof window.fbq === "function") {
      window.fbq("track", "PageView");
    }
  }, [pathname]);

  return null;
}

export default Analytics;
