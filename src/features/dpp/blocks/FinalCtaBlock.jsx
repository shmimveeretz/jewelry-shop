import CtaButton from "../components/CtaButton";

const BACKGROUNDS = {
  navy: { section: "bg-navy", heading: "text-white", body: "text-white/70" },
  cream: { section: "bg-cream", heading: "text-navy", body: "text-gray-600" },
  white: { section: "bg-white", heading: "text-navy", body: "text-gray-600" },
  gold: { section: "bg-gold", heading: "text-navy", body: "text-navy/70" },
};

function FinalCtaBlock({ ctx, ...props }) {
  const { headline, subheadline, ctaLabel, background = "navy" } = props;
  const { product, totalPrice, handleCheckout, defaultCtaLabel } = ctx;

  const theme = BACKGROUNDS[background] || BACKGROUNDS.navy;

  return (
    <section className={`px-4 py-14 text-center ${theme.section}`}>
      <h2 className={`font-display text-2xl sm:text-3xl ${theme.heading}`}>
        {headline || product.name}
      </h2>

      {subheadline ? (
        <p className={`mx-auto mt-3 max-w-md ${theme.body}`}>{subheadline}</p>
      ) : null}

      <CtaButton
        label={ctaLabel || defaultCtaLabel}
        price={totalPrice}
        onClick={handleCheckout}
        variant={background === "navy" ? "onDark" : "primary"}
        className="mx-auto mt-6 max-w-sm"
      />
    </section>
  );
}

export default FinalCtaBlock;
