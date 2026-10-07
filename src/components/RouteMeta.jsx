import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { applyPageMeta } from "../utils/pageMeta";

/**
 * Default title/description per route, in both languages. Pages with richer
 * context (an open product) refine these with usePageMeta.
 */
const ROUTES = {
  "/": {
    he: {
      title: "תכשיטים יהודיים בעבודת יד",
      description:
        "שמים וארץ — תכשיטים בעבודת יד בהשראת המקורות: אותיות עבריות, מזלות, אבני החושן וכוכבי הלכת. כסף 925, ציפוי זהב וזהב 14K. משלוח חינם מעל ₪300.",
    },
    en: {
      title: "Handmade Jewish Jewelry",
      description:
        "Shamaim VeEretz — handmade jewelry inspired by Jewish sources: Hebrew letters, zodiac signs, the Hoshen stones and the planets. Sterling silver, gold plated and 14K gold. Free shipping in Israel over ₪300.",
    },
  },
  "/shop": {
    he: {
      title: "החנות",
      description:
        "כל הקולקציות של שמים וארץ: שרשראות אותיות עבריות, תליוני מזלות, אבני החושן, כוכבי הלכת ושלישיות מיוחדות. התאמה אישית ומשלוח חינם מעל ₪300.",
    },
    en: {
      title: "Shop",
      description:
        "All Shamaim VeEretz collections: Hebrew letter necklaces, zodiac pendants, Hoshen stones, planets and trinity pendants. Personalized, with free shipping over ₪300.",
    },
  },
  "/zodiac": {
    he: {
      title: "גלגל המזלות — מצאו את התכשיט שלכם",
      description:
        "גלו את המזל, אבן החושן והכוכב שלכם לפי תאריך הלידה העברי, ובחרו תכשיט אישי בעל משמעות.",
    },
    en: {
      title: "Zodiac — Find Your Piece",
      description:
        "Discover your zodiac sign, Hoshen stone and planet by your Hebrew birth date, and choose a meaningful personal piece.",
    },
  },
  "/about": {
    he: {
      title: "הסיפור שלנו",
      description: "הסיפור מאחורי שמים וארץ — תכשיטים בעבודת יד שמחברים בין רוח לחומר.",
    },
    en: {
      title: "Our Story",
      description: "The story behind Shamaim VeEretz — handmade jewelry connecting spirit and matter.",
    },
  },
  "/contact": {
    he: { title: "צור קשר", description: "שאלות, הזמנות מיוחדות או ייעוץ? דברו איתנו בטלפון, בוואטסאפ או בטופס." },
    en: { title: "Contact", description: "Questions, custom orders or advice? Reach us by phone, WhatsApp or the form." },
  },
  "/track-order": {
    he: { title: "מעקב הזמנה", description: "בדקו את סטטוס ההזמנה שלכם לפי מספר ההזמנה." },
    en: { title: "Track Order", description: "Check the status of your order by order number." },
  },
  "/shipping-policy": {
    he: { title: "מדיניות משלוחים", description: "זמני ייצור ומשלוח, אזורי חלוקה ועלויות." },
    en: { title: "Shipping Policy", description: "Production and delivery times, areas and costs." },
  },
  "/return-policy": {
    he: { title: "מדיניות החזרות וביטולים", description: "איך מחזירים או מבטלים הזמנה, בהתאם לחוק הגנת הצרכן." },
    en: { title: "Returns & Cancellations", description: "How to return or cancel an order, per Israeli consumer law." },
  },
  "/terms-of-service": {
    he: { title: "תקנון האתר", description: "תנאי השימוש והרכישה באתר שמים וארץ." },
    en: { title: "Terms of Service", description: "Terms of use and purchase on Shamaim VeEretz." },
  },
  "/privacy-policy": {
    he: { title: "מדיניות פרטיות", description: "איך אנחנו אוספים, שומרים ומגינים על המידע שלכם." },
    en: { title: "Privacy Policy", description: "How we collect, store and protect your information." },
  },
  "/cart": {
    he: { title: "עגלת קניות", description: "העגלה שלך בשמים וארץ." },
    en: { title: "Shopping Cart", description: "Your Shamaim VeEretz cart." },
  },
  "/checkout": {
    he: { title: "השלמת הזמנה", description: "תשלום מאובטח, משלוח חינם מעל ₪300." },
    en: { title: "Checkout", description: "Secure payment, free shipping over ₪300." },
  },
  "/login": {
    he: { title: "התחברות והרשמה", description: "התחברו לחשבון שלכם בשמים וארץ." },
    en: { title: "Login & Register", description: "Sign in to your Shamaim VeEretz account." },
  },
  "/payment-success": {
    he: { title: "תודה על ההזמנה!", description: "ההזמנה התקבלה בהצלחה." },
    en: { title: "Thank you for your order!", description: "Your order was received." },
  },
  "/payment-failure": {
    he: { title: "התשלום לא הושלם", description: "לא בוצע חיוב. אפשר לנסות שוב." },
    en: { title: "Payment not completed", description: "You were not charged. You can try again." },
  },
  "/payment-cancelled": {
    he: { title: "התשלום בוטל", description: "העגלה שלך נשמרה." },
    en: { title: "Payment cancelled", description: "Your cart is saved." },
  },
  "/admin": {
    he: { title: "מרכז ניהול", description: "ניהול החנות" },
    en: { title: "Admin", description: "Store administration" },
  },
  "/unsubscribe": {
    he: { title: "הסרה מרשימת התפוצה", description: "הסרה מהדיוור של שמים וארץ." },
    en: { title: "Unsubscribe", description: "Unsubscribe from Shamaim VeEretz emails." },
  },
  "/accessibility": {
    he: { title: "הצהרת נגישות", description: "הצהרת הנגישות של אתר שמים וארץ." },
    en: { title: "Accessibility Statement", description: "The Shamaim VeEretz accessibility statement." },
  },
};

// Private or transactional pages: no value in search results
const NOINDEX_PREFIXES = [
  "/admin",
  "/cart",
  "/checkout",
  "/login",
  "/forgot-password",
  "/verify-code",
  "/change-password",
  "/payment",
  "/unsubscribe",
];

/** Apply the default metadata for a route (also used to restore it). */
export function applyRouteMeta(pathname, language) {
  // Every admin screen shares one title (never indexed)
  const routeKey = pathname.startsWith("/admin") ? "/admin" : pathname;
  const entry = ROUTES[routeKey]?.[language] || ROUTES[routeKey]?.he;
  const fallback = ROUTES["/"][language] || ROUTES["/"].he;

  applyPageMeta({
    title:
      entry?.title ||
      (pathname === "/" ? fallback.title : language === "he" ? "העמוד לא נמצא" : "Page not found"),
    description: entry?.description || fallback.description,
    path: pathname,
    noindex: !entry || NOINDEX_PREFIXES.some((prefix) => pathname.startsWith(prefix)),
    language,
  });
}

function RouteMeta() {
  const { pathname } = useLocation();
  const { language } = useLanguage();

  useEffect(() => {
    // Campaign pages manage their own head (see DppPage / edge function)
    if (pathname.startsWith("/lp/")) return;
    applyRouteMeta(pathname, language);
  }, [pathname, language]);

  return null;
}

export default RouteMeta;
