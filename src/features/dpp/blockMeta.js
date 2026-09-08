/**
 * Admin-facing block metadata, deliberately kept apart from blockRegistry.js.
 *
 * The builder's palette and canvas need labels, not components — importing the
 * registry would pull all fifteen block implementations into the admin bundle
 * for the sake of a few strings.
 */
export const BLOCK_META = {
  hero: {
    label: "כותרת ראשית",
    description: "תמונה, שם, מחיר, בחירת אפשרויות וכפתור רכישה",
    singleton: true,
  },
  optionSelector: {
    label: "בחירת אפשרויות",
    description: "בורר נוסף למטה בעמוד, מסונכרן עם זה שלמעלה",
  },
  trustSignals: {
    label: "סימני אמון",
    description: "ארבעה סמלים עם הבטחות קצרות",
  },
  features: {
    label: "יתרונות",
    description: "רשת כרטיסים עם סמל, כותרת וטקסט",
  },
  story: {
    label: "הסיפור",
    description: "תיאור המוצר, המשמעות והציטוט",
  },
  socialProof: {
    label: "הוכחה חברתית",
    description: "דירוג וביקורות, עם טקסט חלופי כשאין",
  },
  pricing: {
    label: "תיבת מחיר",
    description: "מחיר בולט עם כפתור רכישה",
  },
  faq: { label: "שאלות ותשובות", description: "אקורדיון שאלות נפוצות" },
  finalCta: {
    label: "קריאה לפעולה מסכמת",
    description: "מקטע סוגר עם כפתור רכישה",
  },
  stickyCta: {
    label: "כפתור דביק",
    description: "נצמד לתחתית המסך במובייל",
    singleton: true,
    pinned: true,
  },
  richText: { label: "טקסט חופשי", description: "כותרת ופסקה" },
  imageBanner: { label: "באנר תמונה", description: "תמונה רחבה, עם קישור" },
  countdown: { label: "ספירה לאחור", description: "טיימר עד תאריך יעד" },
  videoEmbed: { label: "וידאו", description: "הטמעת YouTube או Vimeo" },
  spacer: { label: "רווח", description: "מרווח ריק בין מקטעים" },
};

export const BLOCK_TYPES = Object.keys(BLOCK_META);
