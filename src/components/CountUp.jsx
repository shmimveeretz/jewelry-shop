import { useEffect, useRef, useState } from "react";

/**
 * Counts from 0 to `value` once, the first time it scrolls into view.
 * Renders the final number immediately for reduced-motion users and when
 * IntersectionObserver is unavailable, so the value is never wrong or missing.
 */
function CountUp({ value, duration = 1100 }) {
  const ref = useRef(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const el = ref.current;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (!el || reduceMotion || typeof IntersectionObserver === "undefined") return undefined;

    setDisplay(0);
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          // ease-out-cubic: fast start, gentle landing on the final number
          const eased = 1 - (1 - progress) ** 3;
          setDisplay(Math.round(eased * value));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  return (
    <span ref={ref} aria-label={String(value)}>
      <span aria-hidden="true">{display}</span>
    </span>
  );
}

export default CountUp;
