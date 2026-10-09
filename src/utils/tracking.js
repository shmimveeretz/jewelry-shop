/**
 * E-commerce funnel events for Meta Pixel (and GA4 when configured):
 * ViewContent → AddToCart → InitiateCheckout → Purchase.
 *
 * Ads optimise for the Purchase event, so without it Facebook cannot tell
 * which ads sell. Consent is enforced by the pixel itself: index.html starts it
 * in "revoked" mode, so events before the visitor accepts cookies are dropped.
 */

const GA_EVENT_NAMES = {
  ViewContent: "view_item",
  AddToCart: "add_to_cart",
  InitiateCheckout: "begin_checkout",
  Purchase: "purchase",
  // Newsletter signup (popup or footer) and a WhatsApp chat started
  Lead: "generate_lead",
  Contact: "contact",
};

/**
 * @param {string} event   Meta standard event name
 * @param {object} payload { value, currency, content_ids, content_name, num_items, ... }
 * @param {object} [options] { eventID } — lets a future server-side (CAPI)
 *   event with the same id be de-duplicated against this one
 */
export function trackEvent(event, payload = {}, options = {}) {
  const data = { currency: "ILS", ...payload };

  try {
    if (typeof window.fbq === "function") {
      if (options.eventID) window.fbq("track", event, data, { eventID: options.eventID });
      else window.fbq("track", event, data);
    }

    const gaName = GA_EVENT_NAMES[event];
    if (gaName && typeof window.gtag === "function") {
      window.gtag("event", gaName, {
        currency: data.currency,
        value: data.value,
        transaction_id: options.eventID,
        // GA4's item reports need a name or id, price and quantity per item
        items: (data.content_ids || []).map((id, index) => ({
          item_id: id,
          ...(index === 0 && data.content_name ? { item_name: data.content_name } : {}),
          ...(index === 0 && data.content_category ? { item_category: data.content_category } : {}),
          ...(data.content_ids.length === 1 && data.value
            ? { price: data.value / (Number(data.num_items) || 1), quantity: Number(data.num_items) || 1 }
            : {}),
        })),
        ...(data.lead_source ? { lead_source: data.lead_source } : {}),
      });
    }
  } catch {
    // Tracking must never break the shop
  }
}

/** Standard payload for a single product. */
export function productEventPayload(product, price = product?.price, quantity = 1) {
  return {
    content_ids: [product?.id].filter(Boolean),
    content_name: product?.name,
    content_type: "product",
    content_category: product?.category,
    value: Number(price) || 0,
    num_items: quantity,
  };
}

/**
 * Fire Purchase once per order, even if the success page is refreshed or
 * revisited from history.
 */
export function trackPurchaseOnce({ orderId, value, items = [] }) {
  if (!orderId) return;
  const key = `purchase_tracked_${orderId}`;
  try {
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, "1");
  } catch {
    // Storage blocked: still track this time
  }

  trackEvent(
    "Purchase",
    {
      value: Number(value) || 0,
      content_ids: items.map((i) => i.productId || i.id).filter(Boolean),
      content_type: "product",
      num_items: items.reduce((n, i) => n + (Number(i.quantity) || 1), 0),
    },
    { eventID: String(orderId) },
  );
}
