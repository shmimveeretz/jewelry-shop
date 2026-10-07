/**
 * Display helpers shared by every price on the storefront, so amounts read
 * the same everywhere ("₪1,290" rather than "1290 ₪" on one page and
 * "₪1290" on another).
 */

const formatters = {
  he: new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }),
  en: new Intl.NumberFormat("en-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }),
};

export function formatPrice(amount, language = "he") {
  const value = Number(amount);
  if (!Number.isFinite(value)) return "";
  return (formatters[language] || formatters.he).format(value);
}

/** Localized product name, falling back to Hebrew. */
export function productName(product, language) {
  if (!product) return "";
  return language === "en" && product.nameEn ? product.nameEn : product.name;
}

/** Brand placeholder for products with a missing or broken image. */
export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
      <rect width="400" height="400" fill="#f3efe6"/>
      <circle cx="200" cy="190" r="56" fill="none" stroke="#c9a74a" stroke-width="3"/>
      <path d="M200 120v140M130 190h140" stroke="#c9a74a" stroke-width="2" opacity=".45"/>
      <text x="200" y="300" text-anchor="middle" font-family="serif" font-size="26" fill="#8a7a55">שמים וארץ</text>
    </svg>`,
  );

export function productImage(product) {
  if (!product) return PLACEHOLDER_IMAGE;
  if (Array.isArray(product.images) && product.images[0]) return product.images[0];
  return product.image || PLACEHOLDER_IMAGE;
}

/** onError handler: swap a broken image for the placeholder exactly once. */
export function handleImageError(event) {
  const img = event.currentTarget;
  if (img.dataset.fallback) return;
  img.dataset.fallback = "1";
  img.src = PLACEHOLDER_IMAGE;
}
