import {
  getSessionId,
  getVisitorId,
  hasConverted,
  isNewVisitor,
  readFrequency,
  sessionImpressions,
} from "./visitor";

/**
 * Client-side eligibility rules.
 *
 * Path targeting is resolved on the server (see popupTargeting.js) because it
 * is the same for everyone and keeps the response cacheable. Everything here
 * depends on the individual visitor, so it has to run in the browser.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

export function detectDevice() {
  if (typeof window === "undefined") return "desktop";
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

const matchesAny = (haystack, needles) =>
  needles.some((needle) => haystack.includes(needle.toLowerCase()));

export function isEligible(popup, { language, device }) {
  const { targeting = {}, frequency = {} } = popup;

  // A visitor who already took the offer should not keep being asked.
  if (hasConverted(frequency.storageKey)) return false;

  if (targeting.devices?.length && !targeting.devices.includes(device)) {
    return false;
  }

  if (targeting.languages?.length && !targeting.languages.includes(language)) {
    return false;
  }

  if (targeting.newVisitorsOnly && !isNewVisitor()) return false;

  const referrer = (document.referrer || "").toLowerCase();
  if (targeting.referrers?.length && !matchesAny(referrer, targeting.referrers)) {
    return false;
  }
  if (
    targeting.excludeReferrers?.length &&
    matchesAny(referrer, targeting.excludeReferrers)
  ) {
    return false;
  }

  if (targeting.utmSource?.length) {
    const source = (
      new URLSearchParams(window.location.search).get("utm_source") || ""
    ).toLowerCase();
    if (!targeting.utmSource.some((value) => value.toLowerCase() === source)) {
      return false;
    }
  }

  const seen = readFrequency(frequency.storageKey);

  if (frequency.showOncePerVisitor && seen.count > 0) return false;

  if (frequency.cooldownDays > 0 && seen.lastShownAt) {
    if (Date.now() - seen.lastShownAt < frequency.cooldownDays * DAY_MS) {
      return false;
    }
  }

  const perSession = frequency.maxImpressionsPerSession ?? 1;
  if (sessionImpressions(frequency.storageKey) >= perSession) return false;

  return true;
}

/* ------------------------------ A/B split -------------------------------- */

/** FNV-1a. Small, fast, and stable across browsers and sessions. */
function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Deterministic variant assignment.
 *
 * Derived from hash(seed + popupId) rather than stored, so a returning visitor
 * lands in the same bucket with no server round trip and no extra storage —
 * and the split stays stable even if localStorage is cleared mid-test.
 */
export function pickVariant(popup) {
  const variants = popup.variants || [];
  if (variants.length === 0) return null;
  if (!popup.abTest?.enabled || variants.length === 1) return variants[0];

  const seed =
    popup.abTest.splitBy === "session" ? getSessionId() : getVisitorId();
  const bucket = hashString(`${seed}:${popup._id}`) % 100;

  const totalWeight = variants.reduce(
    (total, variant) => total + (variant.weight ?? 0),
    0,
  );

  // Weights that don't add up to 100 would otherwise leave a dead zone, so
  // they are normalized rather than trusted.
  if (totalWeight <= 0) return variants[bucket % variants.length];

  let cursor = 0;
  for (const variant of variants) {
    cursor += ((variant.weight ?? 0) / totalWeight) * 100;
    if (bucket < cursor) return variant;
  }

  return variants[variants.length - 1];
}
