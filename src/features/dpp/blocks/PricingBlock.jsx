import { Truck } from "lucide-react";
import CtaButton from "../components/CtaButton";
import { formatPrice } from "../format";

function PricingBlock({ ctx, ...props }) {
  const {
    title = "המחיר שלכם",
    badgeText,
    note,
    showShippingLine = true,
    ctaLabel,
  } = props;

  const { totalPrice, handleCheckout, defaultCtaLabel } = ctx;

  return (
    <section className="mx-auto max-w-xl px-4 py-12">
      <div className="relative rounded-2xl border-2 border-gold bg-white p-6 text-center shadow-sm">
        {badgeText ? (
          <span className="absolute -top-3 start-1/2 -translate-x-1/2 rounded-full bg-gold px-4 py-1 text-xs font-bold text-navy">
            {badgeText}
          </span>
        ) : null}

        {title ? (
          <h2 className="font-display text-xl text-navy">{title}</h2>
        ) : null}

        <p className="mt-3 text-4xl font-bold text-navy">
          {formatPrice(totalPrice)}
        </p>

        {showShippingLine ? (
          <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-gray-600">
            <Truck className="h-4 w-4 text-gold" strokeWidth={1.75} />
            משלוח חינם מעל ₪300
          </p>
        ) : null}

        {note ? (
          <p className="mt-3 text-sm leading-relaxed text-gray-600">{note}</p>
        ) : null}

        <CtaButton
          label={ctaLabel || defaultCtaLabel}
          price={totalPrice}
          onClick={handleCheckout}
          showPrice={false}
          className="mt-6"
        />
      </div>
    </section>
  );
}

export default PricingBlock;
