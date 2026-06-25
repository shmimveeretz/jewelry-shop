export const productMatchesZodiac = (product, zodiacSign) => {
  if (!zodiacSign || !product) return true;
  if (product.zodiacSign === zodiacSign) return true;
  if (product.zodiac === zodiacSign) return true;
  if (Array.isArray(product.zodiacSigns) && product.zodiacSigns.includes(zodiacSign)) {
    return true;
  }
  return false;
};
