import { quoteShipping } from "./shipping";

/**
 * Order totals exactly as the server charges them
 * (Backend/src/utils/orderPricing.js → priceCart): the discount is applied
 * per unit and rounded to whole shekels before multiplying by quantity, then
 * shipping is added for the destination. Using the same arithmetic here keeps
 * the total on the checkout button equal to the amount on the PayPlus page.
 */

export const GIFT_WRAP_PRODUCT_ID = "gift-wrap";
export const GIFT_WRAP_PRICE = 15;

export function computeOrderTotals(
  items,
  { discountPercent = 0, giftWrap = false, country = "IL" } = {},
) {
  const multiplier = 1 - (Number(discountPercent) || 0) / 100;
  const lines = [...items];
  if (giftWrap) {
    lines.push({ price: GIFT_WRAP_PRICE, quantity: 1 });
  }

  let undiscounted = 0;
  let goods = 0;
  for (const item of lines) {
    const quantity = Number(item.quantity) || 1;
    const unit = Number(item.price) || 0;
    undiscounted += unit * quantity;
    goods += Math.round(unit * multiplier) * quantity;
  }

  const shipping = quoteShipping(country, goods);

  return {
    subtotal: undiscounted,
    discount: undiscounted - goods,
    goods,
    shipping,
    total: goods + shipping.price,
  };
}
