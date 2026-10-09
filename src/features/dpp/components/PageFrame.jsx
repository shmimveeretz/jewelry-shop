import { AlertCircle, Truck } from "lucide-react";

const BACKGROUNDS = {
  cream: "bg-cream",
  white: "bg-white",
  navy: "bg-navy",
};

function PageFrame({ children, background = "cream" }) {
  return (
    <div
      dir="rtl"
      className={`dpp-scope min-h-screen font-serif text-navy ${
        BACKGROUNDS[background] || BACKGROUNDS.cream
      }`}
    >
      {/* No navigation: the only way out of this page is the CTA. */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <span className="font-display text-lg tracking-wide text-navy">
            שמים וארץ
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-600 sm:text-sm">
            <Truck className="h-4 w-4 text-gold" strokeWidth={1.75} />
            משלוח חינם מעל ₪300
          </span>
        </div>
      </header>
      {children}
    </div>
  );
}

/**
 * Only reachable when the edge injection did not happen (direct client-side
 * navigation, local dev, or an edge fetch failure). Mirrors the real layout so
 * the page does not jump when data lands.
 */
export function LoadingState() {
  return (
    <PageFrame>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-2">
        <div className="aspect-square w-full animate-dpp-pulse rounded-2xl bg-gray-200" />
        <div className="space-y-4">
          <div className="h-4 w-24 animate-dpp-pulse rounded bg-gray-200" />
          <div className="h-9 w-3/4 animate-dpp-pulse rounded bg-gray-200" />
          <div className="h-6 w-32 animate-dpp-pulse rounded bg-gray-200" />
          <div className="h-24 w-full animate-dpp-pulse rounded bg-gray-200" />
          <div className="h-14 w-full animate-dpp-pulse rounded-xl bg-gray-200" />
        </div>
      </div>
      <span className="sr-only" role="status">
        טוען את פרטי המוצר
      </span>
    </PageFrame>
  );
}

export function MessageState({ title, text, actionLabel, onAction }) {
  return (
    <PageFrame>
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-navy shadow-sm">
          <AlertCircle className="h-7 w-7" strokeWidth={1.5} />
        </span>
        <h1 className="font-display text-2xl text-navy">{title}</h1>
        <p className="text-gray-600">{text}</p>
        {actionLabel ? (
          <button
            type="button"
            onClick={onAction}
            className="mt-2 min-h-12 rounded-xl bg-navy px-6 font-semibold text-white transition hover:bg-navy-deep"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </PageFrame>
  );
}

/**
 * Legal links only, opened in a new tab so the campaign session is never
 * navigated away from.
 */
export function PageFooter() {
  const links = [
    { href: "/terms-of-service", label: "תקנון" },
    { href: "/privacy-policy", label: "מדיניות פרטיות" },
    { href: "/return-policy", label: "מדיניות החזרות" },
  ];

  return (
    <footer className="bg-navy-deep px-4 py-6 text-center text-xs text-white/50">
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-0">
        {links.map(({ href, label }) => (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block py-2.5 hover:text-white"
          >
            {label}
          </a>
        ))}
      </div>
      <p className="mt-3">שמים וארץ — תכשיטי מקור בעבודת יד</p>
    </footer>
  );
}

export default PageFrame;
