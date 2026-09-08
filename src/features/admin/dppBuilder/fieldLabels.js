/**
 * Hebrew labels for block prop keys.
 *
 * Labels are presentation, so they live on the client while the fields
 * themselves come from the server. A key with no entry here falls back to the
 * raw key, which keeps a newly added prop editable rather than invisible.
 */
export const FIELD_LABELS = {
  // Shared
  title: "כותרת",
  headline: "כותרת ראשית",
  subheadline: "כותרת משנה",
  eyebrow: "טקסט עליון",
  body: "טקסט",
  ctaLabel: "טקסט הכפתור",
  items: "פריטים",
  icon: "סמל",
  text: "טקסט",
  question: "שאלה",
  answer: "תשובה",
  align: "יישור",
  columns: "מספר עמודות",
  background: "רקע",
  size: "גודל",

  // Hero
  benefits: "יתרונות",
  showGallery: "הצגת גלריית תמונות",
  showRating: "הצגת דירוג",
  showPrice: "הצגת מחיר",
  showOptions: "הצגת בחירת אפשרויות",
  showStock: "התראת מלאי נמוך",
  priceNote: "הערה ליד המחיר",
  reassuranceText: "טקסט הרגעה מתחת לכפתור",
  footnote: "הערת שוליים",
  lowStockThreshold: "סף מלאי נמוך",

  // Options
  jewelryTypeLabel: "תווית: סוג תכשיט",
  metalLabel: "תווית: מתכת",
  lengthLabel: "תווית: אורך",
  lengthHint: "רמז לבחירת אורך",
  validationMessage: "הודעת שגיאה בבחירה חסרה",
  showCta: "הצגת כפתור רכישה",

  // Story
  showDescription: "הצגת תיאור המוצר",
  showMeaning: "הצגת המשמעות",
  meaningTitle: "כותרת המשמעות",
  showQuote: "הצגת הציטוט",
  extraBody: "פסקה נוספת",

  // Social proof
  maxReviews: "מספר ביקורות מרבי",
  fallbackTitle: "כותרת חלופית (ללא ביקורות)",
  fallbackText: "טקסט חלופי (ללא ביקורות)",

  // Pricing
  badgeText: "תגית",
  note: "הערה",
  showShippingLine: "הצגת שורת משלוח",

  // Sticky CTA
  totalLabel: 'תווית סה"כ',
  showOnDesktop: "הצגה גם בדסקטופ",

  // Media
  imageUrl: "כתובת תמונה (ריק = התמונה הראשית של התכשיט)",
  alt: "טקסט חלופי לתמונה",
  href: "קישור",
  fullWidth: "רוחב מלא",
  provider: "פלטפורמה",
  videoId: "מזהה הווידאו",
  caption: "כיתוב",

  // Countdown
  endsAt: "מסתיים בתאריך",
  expiredText: "טקסט לאחר הסיום",
};

export const labelFor = (key) => FIELD_LABELS[key] || key;
