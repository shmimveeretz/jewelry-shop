/** Hebrew letters א–ת (includes final forms in Unicode block). */
const HEBREW_LETTER_RE = /[\u05D0-\u05EA]/g;

/** Split free-text input into individual Hebrew letters (never multi-char tokens). */
export function parseExtraHebrewLetters(input) {
  if (!input?.trim()) return [];

  const letters = [];
  for (const token of input.split(/[,\s/|]+/)) {
    const trimmed = token.trim();
    if (!trimmed) continue;
    const matches = trimmed.match(HEBREW_LETTER_RE);
    if (matches) letters.push(...matches);
  }
  return letters;
}

export function getExtraLetterPerBraceletCost(priceAdditions, metalType) {
  const val = priceAdditions?.extraLetterForBracelet;
  if (typeof val === "number") return val;
  if (val && typeof val === "object" && metalType) return val[metalType] ?? 0;
  return 0;
}
