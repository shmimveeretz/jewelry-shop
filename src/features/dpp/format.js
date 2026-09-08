const CURRENCY = new Intl.NumberFormat("he-IL", {
  style: "currency",
  currency: "ILS",
  maximumFractionDigits: 0,
});

export const formatPrice = (value) => CURRENCY.format(Number(value) || 0);

export const trackPixel = (event, payload) => {
  if (typeof window.fbq === "function") {
    window.fbq("track", event, payload);
  }
};
