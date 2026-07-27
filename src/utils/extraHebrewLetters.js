/** Hebrew letters א–ת (includes final forms in Unicode block). */
const HEBREW_LETTER_RE = /[\u05D0-\u05EA]/g;
const SINGLE_HEBREW_LETTER_RE = /^[\u05D0-\u05EA]$/;

/** Max extra letters a customer can add to one letter product. */
export const MAX_EXTRA_LETTERS = 5;

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

export function isValidSingleHebrewLetter(char) {
  return typeof char === "string" && SINGLE_HEBREW_LETTER_RE.test(char);
}

/**
 * Default per-letter pricing by metal type. Used for letter products whose
 * DB document has no `extraLetterForBracelet` entry (mirrors letter-chain pricing).
 */
export const DEFAULT_EXTRA_LETTER_PRICING = {
  "כסף 925": 90,
  "ציפוי זהב": 110,
  "זהב 14 קראט": 240,
};

export function getExtraLetterPerBraceletCost(priceAdditions, metalType) {
  const val = priceAdditions?.extraLetterForBracelet;
  if (typeof val === "number") return val;
  if (val && typeof val === "object" && metalType) return val[metalType] ?? 0;
  if (!val && metalType) return DEFAULT_EXTRA_LETTER_PRICING[metalType] ?? 0;
  return 0;
}

const EXTRA_LETTERS_NAME_MARKER = "(צירוף:";

/**
 * Order-item name format: `[Main Item Name] (צירוף: [Letter 1],[Letter 2])`.
 * Example: "אלף" + ["ד", "ר"] → "אלף (צירוף: ד,ר)".
 * Idempotent — a name that already carries the marker is returned unchanged.
 */
export function formatItemNameWithExtraLetters(name, extraLetters) {
  const baseName = typeof name === "string" ? name : "";
  const letters = Array.isArray(extraLetters)
    ? extraLetters.filter(Boolean)
    : [];
  if (letters.length === 0 || baseName.includes(EXTRA_LETTERS_NAME_MARKER)) {
    return baseName;
  }
  return `${baseName} (צירוף: ${letters.join(",")})`;
}
