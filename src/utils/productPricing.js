import {
  allowsExtraLetters,
  getLengthAddition,
  isHebrewLetterProduct,
  isLetterChainProduct,
} from "../data/productSizes";
import { getExtraLetterPerBraceletCost } from "./extraHebrewLetters";

/**
 * Single source of truth for what a configured product costs and for the cart
 * item shape the checkout/order API expects. Shared by ProductModal and the
 * campaign landing pages so a price shown next to a CTA can never disagree
 * with the price charged at checkout.
 */

/**
 * Selectable option groups in `priceAdditions`. Values that are plain numbers
 * (such as extraLetterForBracelet) are pricing data, not selectors.
 */
export function getOptionKeys(priceAdditions) {
  const additions = priceAdditions || {};
  return Object.keys(additions).filter(
    (key) => typeof additions[key] === "object" && additions[key] !== null,
  );
}

export function calculateProductPrice(product, selectedOptions = {}, extraLetters = []) {
  const priceAdditions = product?.priceAdditions || {};
  const isHebrewLetters = isHebrewLetterProduct(product);

  let totalPrice = product.price;

  for (const key of getOptionKeys(priceAdditions)) {
    if (key === "length" || key === "jewelryType") continue;
    const selected = selectedOptions[key];
    if (selected && priceAdditions[key]) {
      totalPrice += priceAdditions[key][selected] || 0;
    }
  }

  if (selectedOptions.jewelryType && priceAdditions.jewelryType) {
    totalPrice += priceAdditions.jewelryType[selectedOptions.jewelryType] || 0;
  }

  totalPrice += getLengthAddition(
    priceAdditions,
    selectedOptions.jewelryType,
    selectedOptions.length,
    isHebrewLetters,
  );

  if (
    allowsExtraLetters(product, selectedOptions.jewelryType) &&
    extraLetters.length > 0
  ) {
    const perLetterCost = getExtraLetterPerBraceletCost(
      priceAdditions,
      selectedOptions.metalType,
    );
    if (perLetterCost > 0) {
      totalPrice += extraLetters.length * perLetterCost;
    }
  }

  return totalPrice;
}

/** Full product data for display, plus `selections` for the backend. */
export function buildCartItem(product, selectedOptions = {}, extraLetters = []) {
  const finalPrice = calculateProductPrice(product, selectedOptions, extraLetters);
  const isHebrewLetters = isHebrewLetterProduct(product);
  const isLetterChain = isLetterChainProduct(product);

  // jewelryType and extraLetters are only relevant for Hebrew Letters.
  const selections = {};
  if (selectedOptions.metalType) selections.metalType = selectedOptions.metalType;
  if (selectedOptions.length) selections.length = selectedOptions.length;
  if (isHebrewLetters) {
    if (isLetterChain && selectedOptions.jewelryType) {
      selections.jewelryType = selectedOptions.jewelryType;
    }
    selections.extraLetters = allowsExtraLetters(
      product,
      selectedOptions.jewelryType,
    )
      ? extraLetters
      : [];
  }

  return {
    ...product,
    price: finalPrice,
    basePrice: product.price,
    selectedOptions: { ...selectedOptions },
    selections,
    cartItemId: `${product.id}__${JSON.stringify(selections)}`,
  };
}
