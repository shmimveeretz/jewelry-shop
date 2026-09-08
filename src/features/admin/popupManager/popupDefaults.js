/** Mirrors the shapes in Backend/src/utils/popupValidation.js. */

export const TRIGGER_OPTIONS = [
  { value: "immediate", label: "מיד עם הטעינה" },
  { value: "timeDelay", label: "אחרי השהייה" },
  { value: "scrollDepth", label: "אחרי גלילה" },
  { value: "exitIntent", label: "כוונת יציאה" },
  { value: "idle", label: "חוסר פעילות" },
  { value: "onCtaAbandon", label: "כשה-CTA יוצא מהמסך" },
];

export const LAYOUT_OPTIONS = [
  { value: "modal", label: "חלון מרכזי" },
  { value: "slideIn", label: "פינה נגללת" },
  { value: "bar", label: "פס תחתון" },
  { value: "fullscreen", label: "מסך מלא" },
];

export const POSITION_OPTIONS = [
  { value: "center", label: "מרכז" },
  { value: "bottom", label: "תחתית" },
  { value: "bottomStart", label: "תחתית ימין" },
  { value: "bottomEnd", label: "תחתית שמאל" },
  { value: "top", label: "עליון" },
];

export const CTA_ACTION_OPTIONS = [
  { value: "close", label: "סגירה בלבד" },
  { value: "url", label: "מעבר לכתובת" },
  { value: "scrollToCta", label: "גלילה ל-CTA" },
  { value: "newsletter", label: "הרשמה לניוזלטר" },
  { value: "applyCoupon", label: "הצגת קוד קופון" },
];

export const GOAL_OPTIONS = [
  { value: "ctaClick", label: "לחיצה על CTA" },
  { value: "newsletterSignup", label: "הרשמה לניוזלטר" },
  { value: "couponApplied", label: "שימוש בקופון" },
  { value: "checkoutStarted", label: "התחלת רכישה" },
];

/** What `ctaValue` means, per action — the field is reused, the meaning is not. */
export const CTA_VALUE_HINTS = {
  url: { label: "כתובת יעד", placeholder: "https://example.com/sale" },
  scrollToCta: { label: "מזהה אלמנט (id)", placeholder: "hero-cta" },
  applyCoupon: { label: "קוד קופון", placeholder: "WELCOME10" },
};

export const DEVICES = [
  { value: "mobile", label: "מובייל" },
  { value: "desktop", label: "דסקטופ" },
  { value: "tablet", label: "טאבלט" },
];

export const LANGUAGES = [
  { value: "he", label: "עברית" },
  { value: "en", label: "אנגלית" },
];

export const blankVariant = (key) => ({
  key,
  label: key === "a" ? "מקורי" : `וריאנט ${key.toUpperCase()}`,
  weight: 50,
  content: {
    headline: "",
    subheadline: "",
    body: "",
    ctaLabel: "",
    ctaAction: "close",
    ctaValue: "",
    dismissLabel: "",
  },
  style: {
    layout: "modal",
    position: "center",
    accentColor: "#C9A227",
    backgroundColor: "#FFFFFF",
    textColor: "#1B2A4A",
    borderRadius: 16,
    showOverlay: true,
  },
});

export const blankPopup = () => ({
  name: "פופאפ חדש",
  status: "draft",
  priority: 0,
  // A visitor who has been reading for five seconds is engaged; one who has
  // been there for none is still deciding whether to stay.
  trigger: { type: "timeDelay", delayMs: 5000, scrollPercent: 50 },
  targeting: {
    devices: ["mobile", "desktop", "tablet"],
    languages: ["he", "en"],
  },
  frequency: {
    storageKey: `popup-${Date.now().toString(36)}`,
    showOncePerVisitor: true,
    cooldownDays: 30,
    maxImpressionsPerSession: 1,
  },
  schedule: {},
  abTest: { enabled: false, splitBy: "visitor", goal: "ctaClick" },
  variants: [blankVariant("a")],
});
