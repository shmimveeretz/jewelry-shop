import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { API_BASE_URL } from "../constants/api";
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
 * - the admin "devices" log (it geolocates the visitor via ipapi.co)
 */

function parseUserAgent(ua) {
  const device = /iPhone/.test(ua)
    ? "iPhone"
    : /iPad/.test(ua)
      ? "iPad"
      : /Android/.test(ua)
        ? ua.match(/Android.*?;\s*(.+?)\s*Build/)?.[1] || "Android Device"
        : /Windows/.test(ua)
          ? "Windows PC"
          : /Macintosh/.test(ua)
            ? "Mac"
            : /Linux/.test(ua)
              ? "Linux"
              : "Unknown Device";

  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\//.test(ua)
      ? "Opera"
      : /Chrome\//.test(ua)
        ? "Chrome"
        : /Firefox\//.test(ua)
          ? "Firefox"
          : /Safari\//.test(ua)
            ? "Safari"
            : "Unknown Browser";

  let os = "Unknown OS";
  if (/Windows NT 10/.test(ua)) os = "Windows 10/11";
  else if (/Windows NT 6/.test(ua)) os = "Windows 7/8";
  else if (/Mac OS X ([\d_]+)/.test(ua)) os = `macOS ${ua.match(/Mac OS X ([\d_]+)/)[1].replace(/_/g, ".")}`;
  else if (/Android ([\d.]+)/.test(ua)) os = `Android ${ua.match(/Android ([\d.]+)/)[1]}`;
  else if (/iPhone OS ([\d_]+)/.test(ua)) os = `iOS ${ua.match(/iPhone OS ([\d_]+)/)[1].replace(/_/g, ".")}`;
  else if (/Linux/.test(ua)) os = "Linux";

  return { device, browser, os };
}

async function trackDevice() {
  try {
    if (sessionStorage.getItem("_dtr")) return;
    sessionStorage.setItem("_dtr", "1");
  } catch {
    return;
  }

  try {
    const geo = await fetch("https://ipapi.co/json/")
      .then((r) => (r.ok ? r.json() : {}))
      .catch(() => ({}));
    const { device, browser, os } = parseUserAgent(navigator.userAgent);

    await fetch(`${API_BASE_URL}/api/admin/devices/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: {
          city: geo.city || "",
          country: geo.country_name || "",
          timezone: geo.timezone || "",
        },
        deviceName: `${browser} on ${device}`,
        browser,
        os,
        screen: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language,
      }),
    });
  } catch {
    // Analytics must never affect the visitor
  }
}

function Analytics() {
  const { pathname } = useLocation();
  const isFirstRender = useRef(true);

  useEffect(
    () =>
      whenConsentGranted(() => {
        loadGoogleAnalytics();
        trackDevice();
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
