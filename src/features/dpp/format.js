const CURRENCY = new Intl.NumberFormat("he-IL", {
  style: "currency",
  currency: "ILS",
  maximumFractionDigits: 0,
});

export const formatPrice = (value) => CURRENCY.format(Number(value) || 0);

// Campaign pages share the store-wide funnel tracking (Pixel + GA4)
export { trackEvent as trackPixel } from "../../utils/tracking";
