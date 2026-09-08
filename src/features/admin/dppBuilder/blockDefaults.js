import { nanoid } from "nanoid";

/**
 * Sensible starting props when a block is added from the palette.
 *
 * A block dropped onto the canvas should look like something immediately —
 * an empty section reads as broken and gets deleted instead of filled in.
 */
const DEFAULT_PROPS = {
  hero: {
    showGallery: true,
    showRating: true,
    showPrice: true,
    showOptions: true,
    showStock: true,
    priceNote: 'כולל מע"מ ומשלוח',
    ctaLabel: "לרכישה מאובטחת",
    reassuranceText: "תשלום מאובטח, ללא התחייבות, 14 יום להחזרה",
    lowStockThreshold: 5,
  },
  optionSelector: {
    title: "בחרו את התכשיט שלכם",
    showCta: true,
  },
  trustSignals: {
    items: [
      { icon: "lock", title: "תשלום מאובטח", text: "סליקה מוצפנת בתקן PCI" },
      { icon: "truck", title: "משלוח חינם", text: "לכל יעד בישראל" },
      { icon: "hammer", title: "עבודת יד", text: "נוצר בהזמנה אישית באולפן שלנו" },
      { icon: "rotateCcw", title: "14 יום להחזרה", text: "מחזירים או מחליפים" },
    ],
  },
  features: {
    title: "למה דווקא אצלנו",
    columns: 3,
    items: [
      { icon: "gem", title: "חומרים אמיתיים", text: "כסף 925, ציפוי זהב וזהב 14 קראט" },
      { icon: "heart", title: "בעבודת יד", text: "כל תכשיט נוצר אחד אחד" },
      { icon: "gift", title: "אריזת מתנה", text: "מגיע מוכן למסירה" },
    ],
  },
  story: {
    title: "הסיפור שמאחורי התכשיט",
    showDescription: true,
    showMeaning: true,
    meaningTitle: "המשמעות",
    showQuote: true,
  },
  socialProof: {
    title: "מה הלקוחות מספרים",
    showRating: true,
    maxReviews: 4,
    fallbackTitle: "תכשיטי מקור בעבודת יד",
    fallbackText:
      "כל תכשיט נוצר אצלנו באולפן בישראל, אחד אחד, מחומרים אמיתיים.",
  },
  pricing: {
    title: "המחיר שלכם",
    showShippingLine: true,
    ctaLabel: "לרכישה מאובטחת",
  },
  faq: {
    title: "שאלות שנשאלות לפני הרכישה",
    items: [
      {
        question: "מתי התכשיט יגיע אליי?",
        answer: "נשלח תוך עד 14 ימי עסקים, משלוח חינם לכל הארץ.",
      },
    ],
  },
  finalCta: {
    subheadline: "עבודת יד בהזמנה אישית, משלוח חינם ו-14 יום להחזרה.",
    ctaLabel: "לרכישה מאובטחת",
    background: "navy",
  },
  stickyCta: {
    ctaLabel: "לרכישה מאובטחת",
    totalLabel: 'סה"כ',
    showOnDesktop: false,
  },
  richText: { align: "start" },
  imageBanner: { fullWidth: false },
  countdown: { title: "המבצע נגמר בעוד", expiredText: "המבצע הסתיים" },
  videoEmbed: { provider: "youtube" },
  spacer: { size: "md" },
};

export function createBlock(type) {
  return {
    key: nanoid(12),
    type,
    enabled: true,
    placement: type === "stickyCta" ? "pinned" : "flow",
    visibility: { mobile: true, desktop: true },
    props: structuredClone(DEFAULT_PROPS[type] || {}),
  };
}

export function duplicateBlock(block) {
  return { ...structuredClone(block), key: nanoid(12) };
}
