import { useEffect, useState, useCallback } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import "../styles/components/ShabbatMode.css";

// Tel Aviv geonameid for HebCal
const TEL_AVIV_ID = 293397;

/**
 * Fetch this week's Shabbat candle-lighting & havdalah times from HebCal.
 * Cached in localStorage keyed by the Friday date so we only call once per week.
 */
async function getShabbatTimes() {
  try {
    // Key by the date so stale data is auto-replaced
    const cacheKey = `hebcal_shabbat_${new Date().toISOString().slice(0, 10)}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);

    const url = `https://www.hebcal.com/shabbat?cfg=json&geonameid=${TEL_AVIV_ID}&m=50&leyning=off`;
    const res = await fetch(url);
    const data = await res.json();
    const items = data.items || [];

    const candlesItem = items.find((i) => i.category === "candles");
    const havdalahItem = items.find((i) => i.category === "havdalah");

    const result = {
      start: candlesItem?.date ?? null,
      end: havdalahItem?.date ?? null,
    };

    localStorage.setItem(cacheKey, JSON.stringify(result));
    return result;
  } catch {
    return { start: null, end: null };
  }
}

/**
 * Fetch major Jewish holiday periods (candles → havdalah pairs) for the year.
 * Cached in localStorage keyed by year.
 */
async function getHolidayPeriods(year) {
  try {
    const cacheKey = `hebcal_holidays_v2_${year}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);

    // i=on → Israel mode (1-day holidays), maj=on → major holidays only
    const url =
      `https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&min=off&nx=off` +
      `&year=${year}&ss=off&mf=off&c=on&geo=geonameid` +
      `&geonameid=${TEL_AVIV_ID}&m=50&s=off&i=on`;
    const res = await fetch(url);
    const data = await res.json();
    const items = data.items || [];

    // Days on which work is forbidden. HebCal flags these with `yomtov`;
    // the surrounding chol ha-moed days are not flagged and stay open.
    const yomTovByDay = new Map();
    for (const item of items) {
      if (item.category === "holiday" && item.yomtov) {
        yomTovByDay.set(item.date.slice(0, 10), {
          title: item.title || "",
          hebrew: item.hebrew || "",
        });
      }
    }

    // Walk the items in chronological order and pair each "candles" with the
    // next "havdalah". A Shabbat that runs straight into Yom Tov has two
    // candle-lightings and a single havdalah, so only the first one opens a
    // period. Candle-lighting titles are just times ("Candle lighting: 18:32"),
    // so the holiday name comes from the yomtov day the period covers.
    const periods = [];
    let pendingStart = null;

    for (const item of items) {
      if (item.category === "candles") {
        pendingStart ??= item.date;
      } else if (item.category === "havdalah" && pendingStart) {
        const firstDay = pendingStart.slice(0, 10);
        const lastDay = item.date.slice(0, 10);
        const covered = [...yomTovByDay.entries()].find(
          ([day]) => day >= firstDay && day <= lastDay,
        );

        // Pairs with no Yom Tov inside are plain Shabbatot, handled separately
        if (covered) {
          periods.push({
            start: pendingStart,
            end: item.date,
            title: covered[1].title,
            hebrew: covered[1].hebrew,
          });
        }
        pendingStart = null;
      }
    }

    localStorage.setItem(cacheKey, JSON.stringify(periods));
    return periods;
  } catch {
    return [];
  }
}

/** Returns true if `now` falls within [start, end]. */
function isWithin(now, start, end) {
  if (!start || !end) return false;
  return now >= new Date(start) && now <= new Date(end);
}

/** "יום שבת, 5 בספטמבר בשעה 19:50" — always in Israel local time. */
function formatReturnTime(iso, language) {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat(language === "he" ? "he-IL" : "en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jerusalem",
    }).format(new Date(iso));
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────

function ShabbatMode() {
  const [status, setStatus] = useState({ active: false });
  const { language } = useLanguage();

  const checkNow = useCallback(async () => {
    const now = new Date();
    const year = now.getFullYear();

    // Run both fetches in parallel
    const [shabbat, holidays] = await Promise.all([
      getShabbatTimes(),
      getHolidayPeriods(year),
    ]);

    // Holidays first: a Yom Tov that starts on Friday also shows up as Shabbat,
    // and it ends later, so the holiday period is the one worth announcing.
    const activeHoliday = holidays.find((h) => isWithin(now, h.start, h.end));
    if (activeHoliday) {
      setStatus({
        active: true,
        isHoliday: true,
        end: activeHoliday.end,
        title: activeHoliday.title,
        hebrew: activeHoliday.hebrew,
      });
      document.body.classList.add("shabbat-mode");
      return;
    }

    if (isWithin(now, shabbat.start, shabbat.end)) {
      setStatus({ active: true, isHoliday: false, end: shabbat.end });
      document.body.classList.add("shabbat-mode");
      return;
    }

    setStatus({ active: false });
    document.body.classList.remove("shabbat-mode");
  }, []);

  useEffect(() => {
    checkNow();

    // Re-check every minute
    const interval = setInterval(checkNow, 60_000);

    return () => {
      clearInterval(interval);
      document.body.classList.remove("shabbat-mode");
    };
  }, [checkNow]);

  if (!status.active) return null;

  const isHe = language === "he";
  const { isHoliday } = status;
  const returnTime = formatReturnTime(status.end, language);
  const holidayName = isHe ? status.hebrew : status.title;

  const t = isHe
    ? {
        brand: "שמים וארץ",
        badge: isHoliday ? "האתר סגור לרגל החג" : "שומר שבת וחגים כהלכה",
        title: isHoliday ? "חג שמח ומבורך" : "שבת שלום ומבורכת",
        quote:
          (isHoliday && holidayName) ||
          (isHoliday
            ? "״מוֹעֲדֵי ה׳ מִקְרָאֵי קֹדֶשׁ״"
            : "״וְקָרָאתָ לַשַּׁבָּת עֹנֶג לִקְדוֹשׁ ה׳ מְכֻבָּד״"),
        lead: isHoliday
          ? "האתר נמצא כעת במצב שמירת חגי ומועדי ישראל."
          : "האתר נמצא כעת במצב שמירת שבת ומועדי ישראל.",
        sub: "הרכישות, העגלות והפעילות המסחרית מושהות כדי לאפשר מנוחת קודש, שלווה והתחדשות הנפש.",
        returnLabel: "זמני פעילות",
        returnValue: returnTime
          ? `נשוב לפעילות מלאה ב${returnTime}`
          : isHoliday
            ? "נשוב לפעילות מלאה מיד עם צאת החג"
            : "נשוב לפעילות מלאה מיד עם צאת השבת",
        source: "תל אביב · זמנים מסונכרנים HebCal",
        blessing: isHoliday
          ? "מאחלים לכם ולמשפחתכם חג שמח, אור ושמחה"
          : "מאחלים לכם ולמשפחתכם מנוחה שלמה, אור ושמחה",
        marks: ["מועדי ישראל", "נוצר בעבודת יד בארץ הקודש"],
      }
    : {
        brand: "Shamaim VeEretz",
        badge: isHoliday
          ? "Closed in observance of the holiday"
          : "Closed in observance of Shabbat",
        title: isHoliday ? "Chag Sameach" : "Shabbat Shalom",
        quote:
          (isHoliday && holidayName) ||
          (isHoliday
            ? "A Sacred Appointed Time"
            : "A Time for Rest, Sanctuary & Soul"),
        lead: isHoliday
          ? "Our online gallery is currently closed in observance of the holiday."
          : "Our online gallery is currently closed in observance of Shabbat and sacred holidays.",
        sub: "Orders and commerce are paused so we may step back, disconnect from the physical, and embrace holy peace.",
        returnLabel: "Return Schedule",
        returnValue: returnTime
          ? `Reopening ${returnTime}`
          : isHoliday
            ? "Reopening once the holiday ends"
            : "Reopening once the stars emerge (Motzei Shabbat)",
        source: "Tel Aviv · Times synced via HebCal",
        blessing: isHoliday
          ? "Wishing you a joyful and elevated holiday"
          : "Wishing you a peaceful and elevated Shabbat",
        marks: ["Jewish Holidays", "Handcrafted in the Holy Land"],
      };

  return (
    <div
      className={`shabbat-screen ${isHe ? "shabbat-screen--he" : "shabbat-screen--en"}`}
      dir={isHe ? "rtl" : "ltr"}
      lang={isHe ? "he" : "en"}
      role="dialog"
      aria-modal="true"
      aria-label={t.title}
    >
      <div className="shabbat-screen__ambience" aria-hidden="true">
        <div className="shabbat-screen__glow-core" />
        <div className="shabbat-screen__glow-amber" />
        <div className="shabbat-screen__stars" />
        <div className="shabbat-screen__vignette" />
      </div>

      <header className="shabbat-screen__header">
        <div className="shabbat-screen__brand">
          <div className="shabbat-screen__emblem" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <div>
            <span className="shabbat-screen__brand-name">{t.brand}</span>
            <span className="shabbat-screen__brand-tagline">
              Fine Sacred Jewelry
            </span>
          </div>
        </div>
      </header>

      <main className="shabbat-screen__body">
        <div className="shabbat-screen__panel">
          <div className="shabbat-screen__corner shabbat-screen__corner--tl" />
          <div className="shabbat-screen__corner shabbat-screen__corner--tr" />
          <div className="shabbat-screen__corner shabbat-screen__corner--bl" />
          <div className="shabbat-screen__corner shabbat-screen__corner--br" />

          <div className="shabbat-screen__candles" aria-hidden="true">
            <svg viewBox="0 0 64 64" fill="none">
              <rect
                x="20"
                y="26"
                width="7"
                height="30"
                rx="2"
                fill="url(#shb-candle-body)"
                stroke="#d4af37"
                strokeWidth="0.8"
              />
              <path
                d="M23.5 22V26"
                stroke="#d4af37"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <path
                className="shabbat-screen__flame"
                d="M23.5 13C23.5 13 20 18 20 20.5C20 22.43 21.57 24 23.5 24C25.43 24 27 22.43 27 20.5C27 18 23.5 13 23.5 13Z"
                fill="url(#shb-flame-grad)"
              />

              <rect
                x="37"
                y="26"
                width="7"
                height="30"
                rx="2"
                fill="url(#shb-candle-body)"
                stroke="#d4af37"
                strokeWidth="0.8"
              />
              <path
                d="M40.5 22V26"
                stroke="#d4af37"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <path
                className="shabbat-screen__flame shabbat-screen__flame--right"
                d="M40.5 13C40.5 13 37 18 37 20.5C37 22.43 38.57 24 40.5 24C42.43 24 44 22.43 44 20.5C44 18 40.5 13 40.5 13Z"
                fill="url(#shb-flame-grad)"
              />

              <path
                d="M12 56C12 55 20 54 32 54C44 54 52 55 52 56L50 59H14L12 56Z"
                fill="#141d33"
                stroke="#d4af37"
                strokeWidth="0.8"
              />

              <defs>
                <linearGradient
                  id="shb-flame-grad"
                  x1="23.5"
                  y1="13"
                  x2="23.5"
                  y2="24"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="#fff7d6" />
                  <stop offset="40%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
                <linearGradient
                  id="shb-candle-body"
                  x1="20"
                  y1="26"
                  x2="27"
                  y2="56"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="#2a354d" />
                  <stop offset="100%" stopColor="#141d33" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="shabbat-screen__badge">
            <span className="shabbat-screen__badge-dot" aria-hidden="true" />
            <span>{t.badge}</span>
          </div>

          <h1 className="shabbat-screen__title">{t.title}</h1>

          <div className="shabbat-screen__quote">
            <div className="shabbat-screen__quote-rule" aria-hidden="true" />
            <p>{t.quote}</p>
            <div className="shabbat-screen__quote-rule" aria-hidden="true" />
          </div>

          <div className="shabbat-screen__message">
            <p>{t.lead}</p>
            <p>{t.sub}</p>
          </div>

          <div className="shabbat-screen__return">
            <div className="shabbat-screen__return-main">
              <div className="shabbat-screen__return-icon" aria-hidden="true">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="shabbat-screen__return-label">{t.returnLabel}</p>
                <p className="shabbat-screen__return-value">{t.returnValue}</p>
              </div>
            </div>
            <div className="shabbat-screen__return-source">{t.source}</div>
          </div>

          <p className="shabbat-screen__blessing">{t.blessing}</p>
        </div>
      </main>

      <footer className="shabbat-screen__footer">
        <div>© {t.brand} — The Celestial Gallery</div>
        <div className="shabbat-screen__footer-marks">
          <span>{t.marks[0]}</span>
          <span className="shabbat-screen__footer-dot" aria-hidden="true" />
          <span>{t.marks[1]}</span>
        </div>
      </footer>
    </div>
  );
}

export default ShabbatMode;
