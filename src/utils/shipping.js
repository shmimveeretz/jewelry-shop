/**
 * Shipping rates, mirrored from Backend/src/utils/shipping.js — the server
 * recalculates everything, this copy only lets the page show the same number
 * before payment. Keep the two in step.
 */

export const FREE_SHIPPING_THRESHOLD = 300;

const ZONES = {
  IL: { price: 30, freeOver: FREE_SHIPPING_THRESHOLD },
  EUROPE: { price: 150, freeOver: null },
  NORTH_AMERICA: { price: 180, freeOver: null },
  WORLD: { price: 200, freeOver: null },
};

const EUROPE = new Set([
  "AD", "AL", "AT", "BA", "BE", "BG", "BY", "CH", "CY", "CZ", "DE", "DK", "EE",
  "ES", "FI", "FO", "FR", "GB", "GG", "GI", "GR", "HR", "HU", "IE", "IM", "IS",
  "IT", "JE", "LI", "LT", "LU", "LV", "MC", "MD", "ME", "MK", "MT", "NL", "NO",
  "PL", "PT", "RO", "RS", "SE", "SI", "SK", "SM", "UA", "VA", "XK",
]);

export function shippingZone(country) {
  if (!country || country === "IL") return "IL";
  if (EUROPE.has(country)) return "EUROPE";
  if (country === "US" || country === "CA") return "NORTH_AMERICA";
  return "WORLD";
}

/** { price, free, zone, remainingForFree } for a destination and order total. */
export function quoteShipping(country, orderTotal) {
  const zone = shippingZone(country);
  const { price, freeOver } = ZONES[zone];
  const free = freeOver != null && orderTotal >= freeOver;
  return {
    zone,
    free,
    price: free ? 0 : price,
    // How much more the customer needs to add for free delivery (Israel only)
    remainingForFree: freeOver != null && !free ? freeOver - orderTotal : 0,
  };
}

/** ISO 3166-1 alpha-2 codes for the destination picker. */
const COUNTRY_CODES = [
  "IL", "US", "CA", "GB", "FR", "DE", "NL", "BE", "CH", "AT", "IT", "ES", "PT",
  "IE", "DK", "SE", "NO", "FI", "PL", "CZ", "HU", "GR", "CY", "RO", "BG", "HR",
  "SI", "SK", "LT", "LV", "EE", "LU", "MT", "IS", "UA", "MD", "RS", "ME", "AL",
  "MK", "BA", "GE", "AM", "AZ", "TR", "AU", "NZ", "ZA", "AR", "BR", "CL", "CO",
  "MX", "PA", "PE", "UY", "VE", "CR", "JP", "KR", "CN", "HK", "TW", "SG", "TH",
  "IN", "PH", "VN", "MY", "ID", "AE", "BH", "MA", "EG", "JO", "KZ", "UZ",
];

/** [{ code, name }] in the given UI language, Israel first, rest A–Z. */
export function countryOptions(language = "he") {
  let names;
  try {
    names = new Intl.DisplayNames([language === "he" ? "he" : "en"], { type: "region" });
  } catch {
    names = { of: (code) => code };
  }
  const rest = COUNTRY_CODES.filter((c) => c !== "IL")
    .map((code) => ({ code, name: names.of(code) || code }))
    .sort((a, b) => a.name.localeCompare(b.name, language));
  return [{ code: "IL", name: names.of("IL") || "ישראל" }, ...rest];
}
