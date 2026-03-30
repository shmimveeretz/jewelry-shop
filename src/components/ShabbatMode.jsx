import { useEffect, useState, useCallback } from "react";

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
    const cacheKey = `hebcal_holidays_${year}`;
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

    // Walk through items in chronological order.
    // Pair each "candles" item with the next "havdalah" item – this covers
    // both Shabbat and holidays.  We only want holiday periods (not Shabbat)
    // so we skip pairs where the holiday title contains "Shabbat".
    const periods = [];
    let pendingStart = null;
    let pendingTitle = "";

    for (const item of items) {
      if (item.category === "candles") {
        pendingStart = item.date;
        pendingTitle = item.title || "";
      } else if (item.category === "havdalah" && pendingStart) {
        // Exclude pure-Shabbat pairs (we handle those via getShabbatTimes)
        if (!pendingTitle.toLowerCase().includes("shabbat")) {
          periods.push({
            start: pendingStart,
            end: item.date,
            title: pendingTitle,
          });
        }
        pendingStart = null;
        pendingTitle = "";
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

// ─────────────────────────────────────────────────────────────────────────────

function ShabbatMode() {
  const [status, setStatus] = useState({ active: false, reason: "" });

  const checkNow = useCallback(async () => {
    const now = new Date();
    const year = now.getFullYear();

    // Run both fetches in parallel
    const [shabbat, holidays] = await Promise.all([
      getShabbatTimes(),
      getHolidayPeriods(year),
    ]);

    // Check Shabbat
    if (isWithin(now, shabbat.start, shabbat.end)) {
      setStatus({ active: true, reason: "shabbat" });
      document.body.classList.add("shabbat-mode");
      return;
    }

    // Check holidays
    const activeHoliday = holidays.find((h) => isWithin(now, h.start, h.end));
    if (activeHoliday) {
      setStatus({ active: true, reason: activeHoliday.title });
      document.body.classList.add("shabbat-mode");
      return;
    }

    setStatus({ active: false, reason: "" });
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

  const isHoliday = status.reason !== "shabbat";

  return (
    <div className="shabbat-overlay">
      <div>
        {isHoliday ? (
          <>
            <h2>✡️ חג שמח ✡️</h2>
            <p style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
              {status.reason}
            </p>
            <p>
              האתר סגור לכבוד החג.
              <br />
              נשוב לאחר צאת החג.
            </p>
            <p style={{ marginTop: "2rem", fontSize: "1.2rem" }}>
              💫 מועדים לשמחה 💫
            </p>
          </>
        ) : (
          <>
            <h2>🕯️ שבת שלום 🕯️</h2>
            <p>
              האתר נמצא במצב שומר שבת.
              <br />
              האתר יפעל מחדש במוצאי שבת.
            </p>
            <p style={{ marginTop: "2rem", fontSize: "1.2rem" }}>
              💫 שבת שלום ומבורכת 💫
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default ShabbatMode;
