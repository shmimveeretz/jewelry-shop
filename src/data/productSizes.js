export const MEASUREMENTS_IMAGE_URL =
  "https://res.cloudinary.com/dhayarvh3/image/upload/v1782247411/Measurements.jpg";

export const NECKLACE_LENGTHS = ["39", "40", "42", "45", "47", "50"];
export const SINGLE_LETTER_NECKLACE_LENGTHS = [
  "39",
  "40",
  "41",
  "42",
  "43",
  "44",
  "45",
];
export const LETTER_CHAIN_NECKLACE_LENGTHS = ["39", "40", "42", "45", "47", "50"];
export const BRACELET_LENGTHS = ["15", "16", "17", "18", "19"];
export const LETTER_CHAIN_BRACELET_LENGTHS = [
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
];

export const LETTER_CHAIN_PRODUCT_ID = "letter-chain";

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

function isNestedJewelryLengths(lengthVal) {
  return Boolean(lengthVal?.שרשרת || lengthVal?.צמיד);
}

function mapLengthEntries(lengthVal) {
  if (!lengthVal || typeof lengthVal !== "object") return [];
  return Object.entries(lengthVal).map(([size, price]) => ({
    size,
    price: price ?? 0,
  }));
}

/** Build length options with prices from product data (defaults to 0). */
export function getLengthOptions(
  priceAdditions,
  jewelryType,
  isHebrewLetters,
  productId = "",
) {
  const lengthVal = priceAdditions?.length;
  const typeKey = resolveJewelryTypeKey(jewelryType);

  if (isHebrewLetters && jewelryType && isNestedJewelryLengths(lengthVal)) {
    const nested = lengthVal?.[typeKey];
    if (nested) return mapLengthEntries(nested);
  }

  if (isHebrewLetters && lengthVal && !isNestedJewelryLengths(lengthVal)) {
    return mapLengthEntries(lengthVal);
  }

  const sizes =
    productId === LETTER_CHAIN_PRODUCT_ID && isBraceletJewelryType(jewelryType)
      ? LETTER_CHAIN_BRACELET_LENGTHS
      : productId === LETTER_CHAIN_PRODUCT_ID
        ? LETTER_CHAIN_NECKLACE_LENGTHS
        : isHebrewLetters && isBraceletJewelryType(jewelryType)
          ? BRACELET_LENGTHS
          : isHebrewLetters
            ? SINGLE_LETTER_NECKLACE_LENGTHS
            : NECKLACE_LENGTHS;

  return sizes.map((size) => {
    const flat = priceAdditions?.length;
    const price = flat?.[size] ?? flat?.[Number(size)] ?? 0;
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
  const lengthVal = priceAdditions?.length;

  if (isHebrewLetters && jewelryType && isNestedJewelryLengths(lengthVal)) {
    const typeKey = resolveJewelryTypeKey(jewelryType);
    const nested = lengthVal?.[typeKey];
    return nested?.[length] ?? nested?.[Number(length)] ?? 0;
  }

  const flat = priceAdditions?.length;
  return flat?.[length] ?? flat?.[Number(length)] ?? 0;
}

export function isLetterChainProduct(product) {
  return product?.id === LETTER_CHAIN_PRODUCT_ID;
}

export function allowsExtraLetters(product, jewelryType) {
  if (!product?.priceAdditions?.extraLetterForBracelet) return false;
  if (isLetterChainProduct(product)) {
    return Boolean(jewelryType);
  }
  return isBraceletJewelryType(jewelryType);
}

export function buildDefaultNecklaceLengthPrices() {
  return Object.fromEntries(NECKLACE_LENGTHS.map((s) => [s, 0]));
}

export function buildDefaultBraceletLengthPrices() {
  return Object.fromEntries(BRACELET_LENGTHS.map((s) => [s, 0]));
}
