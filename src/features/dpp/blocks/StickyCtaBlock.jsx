import { Lock } from "lucide-react";
import { formatPrice } from "../format";

/**
 * Mobile-first sticky CTA: the single highest-leverage element on a DPP.
 * Pinned rather than part of the flow, so reordering blocks can never bury it.
 * Slides in only once the hero CTA has scrolled out of view.
 */
function StickyCtaBlock({ ctx, ...props }) {
  const { ctaLabel, totalLabel = 'סה"כ', showOnDesktop = false } = props;
  const { totalPrice, isStickyCtaVisible, handleCheckout, defaultCtaLabel } = ctx;

  const desktopVisibility = showOnDesktop ? "" : "lg:hidden";

  return (
    <>
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 p-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur transition-transform duration-300 ${desktopVisibility} ${
          isStickyCtaVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="shrink-0">
            <p className="text-xs text-gray-600">{totalLabel}</p>
            <p className="text-lg font-bold leading-tight text-navy">
              {formatPrice(totalPrice)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCheckout}
            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gold font-bold text-navy transition hover:bg-gold-dark hover:text-white"
          >
            <Lock className="h-4 w-4" strokeWidth={2} />
            {ctaLabel || defaultCtaLabel}
          </button>
        </div>
      </div>

      {/* Keeps the bar from covering the last section. */}
      <div className={`h-20 ${desktopVisibility}`} aria-hidden="true" />
    </>
  );
}

export default StickyCtaBlock;
