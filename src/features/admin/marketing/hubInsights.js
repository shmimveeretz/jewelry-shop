/**
 * Derives the "needs attention" list for the marketing hub.
 *
 * A hub that only counts things is a link farm. These rules answer the
 * question an admin actually opens the page with: what is quietly broken or
 * costing me conversions right now?
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** Enough impressions that a zero or a gap means something rather than nothing. */
const MIN_SAMPLE = 100;
const STALE_DRAFT_DAYS = 14;

const daysSince = (date) => (Date.now() - new Date(date).getTime()) / DAY_MS;

export function buildInsights({ pages = [], popups = [] }) {
  const items = [];

  for (const popup of popups) {
    if (popup.status !== "active") continue;

    const ended =
      popup.schedule?.endAt && new Date(popup.schedule.endAt) < new Date();
    if (ended) {
      items.push({
        id: `expired-${popup._id}`,
        severity: "warn",
        title: `"${popup.name}" פעיל אבל התזמון שלו הסתיים`,
        detail:
          "הוא כבר לא מוצג לאף אחד, אבל עדיין נחשב מועמד ויכול לחסום פופאפ אחר בעדיפות נמוכה יותר.",
        to: `/admin/popups/${popup._id}`,
        action: "לתזמון",
      });
      continue;
    }

    if (popup.impressions === 0) {
      items.push({
        id: `silent-${popup._id}`,
        severity: "warn",
        title: `"${popup.name}" פעיל אבל לא הוצג אף פעם`,
        detail:
          "בדרך כלל זה אומר שהטירגוט לא תואם לאף עמוד — נתיב שלא קיים, מכשיר שלא נבחר, או עדיפות נמוכה מפופאפ אחר.",
        to: `/admin/popups/${popup._id}`,
        action: "לטירגוט",
      });
      continue;
    }

    if (popup.impressions >= MIN_SAMPLE && popup.conversions === 0) {
      items.push({
        id: `dead-${popup._id}`,
        severity: "warn",
        title: `"${popup.name}" הוצג ${popup.impressions} פעמים בלי המרה אחת`,
        detail:
          "פופאפ שלא ממיר עדיין עולה — הוא מפריע לגלישה ופוגע בעמוד שהוא מופיע עליו. שווה לשנות הצעה או לכבות.",
        to: `/admin/popups/${popup._id}`,
        action: "לעריכה",
      });
    }
  }

  for (const page of pages) {
    if (
      page.status === "draft" &&
      daysSince(page.updatedAt) > STALE_DRAFT_DAYS
    ) {
      items.push({
        id: `stale-${page._id}`,
        severity: "info",
        title: `"${page.internalName || page.slug}" בטיוטה כבר ${Math.floor(
          daysSince(page.updatedAt),
        )} ימים`,
        detail: "עמוד שלא פורסם לא מקבל תנועה. לפרסם או לארכב?",
        to: `/admin/pages/${page._id}`,
        action: "לעמוד",
      });
    }
  }

  // Warnings first — the list is meant to be worked from the top down.
  const order = { warn: 0, info: 1 };
  return items.sort((a, b) => order[a.severity] - order[b.severity]);
}

export function summarize({ pages = [], popups = [] }) {
  const activePopups = popups.filter((popup) => popup.status === "active");

  const impressions = popups.reduce((sum, p) => sum + (p.impressions || 0), 0);
  const conversions = popups.reduce((sum, p) => sum + (p.conversions || 0), 0);

  return {
    publishedPages: pages.filter((page) => page.status === "published").length,
    draftPages: pages.filter((page) => page.status === "draft").length,
    activePopups: activePopups.length,
    totalPopups: popups.length,
    impressions,
    conversions,
    conversionRate: impressions > 0 ? conversions / impressions : 0,
  };
}
