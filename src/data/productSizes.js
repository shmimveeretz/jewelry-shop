export const MEASUREMENTS_IMAGE_URL =
  "https://res.cloudinary.com/dhayarvh3/image/upload/v1782247411/Measurements.jpg";

export const NECKLACE_LENGTHS = ["39", "40", "42", "45", "47", "50"];
export const BRACELET_LENGTHS = ["15", "16", "17", "18", "19"];

export const JEWELRY_TYPE_NECKLACE = "שרשרת";
export const JEWELRY_TYPE_BRACELET = "צמיד";

export function isBraceletJewelryType(jewelryType) {
  if (!jewelryType) return false;
  return jewelryType === JEWELRY_TYPE_BRACELET || jewelryType.startsWith("צמיד");
}

export function isNecklaceJewelryType(jewelryType) {
  if (!jewelryType) return false;
  return (
    jewelryType === JEWELRY_TYPE_NECKLACE || jewelryType.startsWith("שרשרת")
  );
}

function resolveJewelryTypeKey(jewelryType) {
  if (isBraceletJewelryType(jewelryType)) return JEWELRY_TYPE_BRACELET;
  if (isNecklaceJewelryType(jewelryType)) return JEWELRY_TYPE_NECKLACE;
  return jewelryType;
}

/** Build length options with prices from product data (defaults to 0). */
export function getLengthOptions(priceAdditions, jewelryType, isHebrewLetters) {
  const sizes =
    isHebrewLetters && isBraceletJewelryType(jewelryType)
      ? BRACELET_LENGTHS
      : NECKLACE_LENGTHS;

  const typeKey = resolveJewelryTypeKey(jewelryType);

  return sizes.map((size) => {
    let price = 0;
    if (isHebrewLetters && jewelryType) {
      const nested = priceAdditions?.length?.[typeKey];
      price = nested?.[size] ?? nested?.[Number(size)] ?? 0;
    } else {
      const flat = priceAdditions?.length;
      price = flat?.[size] ?? flat?.[Number(size)] ?? 0;
    }
    return { size, price };
  });
}

export function getLengthAddition(
  priceAdditions,
  jewelryType,
  length,
  isHebrewLetters,
) {
  if (!length) return 0;
  if (isHebrewLetters && jewelryType) {
    const typeKey = resolveJewelryTypeKey(jewelryType);
    const nested = priceAdditions?.length?.[typeKey];
    return nested?.[length] ?? nested?.[Number(length)] ?? 0;
  }
  const flat = priceAdditions?.length;
  return flat?.[length] ?? flat?.[Number(length)] ?? 0;
}

export function buildDefaultNecklaceLengthPrices() {
  return Object.fromEntries(NECKLACE_LENGTHS.map((s) => [s, 0]));
}

export function buildDefaultBraceletLengthPrices() {
  return Object.fromEntries(BRACELET_LENGTHS.map((s) => [s, 0]));
}
