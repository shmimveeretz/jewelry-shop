import OptionGroups from "../components/OptionGroups";
import CtaButton from "../components/CtaButton";

/**
 * A standalone picker for long pages: by the time a visitor has read the story
 * and the FAQ, scrolling back to the fold to choose a metal is friction.
 * Shares ctx with the hero picker, so selecting here updates both.
 */
function OptionSelectorBlock({ ctx, ...props }) {
  const { title = "בחרו את התכשיט שלכם", ctaLabel, showCta = true } = props;
  const { optionModel, totalPrice, handleCheckout, defaultCtaLabel } = ctx;

  if (!optionModel?.hasAnyOptions) return null;

  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      {title ? (
        <h2 className="mb-6 text-center font-display text-2xl text-navy">
          {title}
        </h2>
      ) : null}

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <OptionGroups ctx={ctx} labels={props} />

        {showCta ? (
          <CtaButton
            label={ctaLabel || defaultCtaLabel}
            price={totalPrice}
            onClick={handleCheckout}
            className="mt-6"
          />
        ) : null}
      </div>
    </section>
  );
}

export default OptionSelectorBlock;
