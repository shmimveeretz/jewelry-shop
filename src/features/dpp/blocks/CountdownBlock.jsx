import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

const UNITS = [
  { key: "days", label: "ימים", ms: 24 * 60 * 60 * 1000 },
  { key: "hours", label: "שעות", ms: 60 * 60 * 1000 },
  { key: "minutes", label: "דקות", ms: 60 * 1000 },
  { key: "seconds", label: "שניות", ms: 1000 },
];

const breakdown = (remaining) => {
  let left = remaining;
  return UNITS.map((unit) => {
    const value = Math.floor(left / unit.ms);
    left -= value * unit.ms;
    return { ...unit, value };
  });
};

/**
 * A real deadline only. When it passes the block shows the expired copy rather
 * than resetting — a countdown that restarts on refresh is the fastest way to
 * lose the trust the rest of the page is built on.
 */
function CountdownBlock({ title, endsAt, expiredText = "המבצע הסתיים" }) {
  const target = endsAt ? new Date(endsAt).getTime() : null;
  const [remaining, setRemaining] = useState(() =>
    target ? Math.max(target - Date.now(), 0) : 0,
  );

  useEffect(() => {
    if (!target) return undefined;

    const tick = () => setRemaining(Math.max(target - Date.now(), 0));
    tick();

    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [target]);

  if (!target) return null;

  if (remaining <= 0) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-8 text-center">
        <p className="text-gray-600">{expiredText}</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-8">
      <div className="rounded-2xl bg-navy p-6 text-center text-white">
        {title ? (
          <p className="flex items-center justify-center gap-2 font-display text-lg">
            <Clock className="h-5 w-5 text-gold" strokeWidth={1.75} />
            {title}
          </p>
        ) : null}

        <div className="mt-4 flex items-start justify-center gap-4" dir="ltr">
          {breakdown(remaining).map((unit) => (
            <div key={unit.key} className="min-w-14">
              <p className="text-3xl font-bold tabular-nums text-gold">
                {String(unit.value).padStart(2, "0")}
              </p>
              <p className="mt-1 text-xs text-white/60">{unit.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CountdownBlock;
