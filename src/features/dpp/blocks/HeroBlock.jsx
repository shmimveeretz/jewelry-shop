import { BadgeCheck, ShieldCheck } from "lucide-react";
import Gallery from "../components/Gallery";
import StarRating from "../components/StarRating";
import OptionGroups from "../components/OptionGroups";
import CtaButton from "../components/CtaButton";
import { formatPrice } from "../format";

/**
 * Above the fold: image, price, options and CTA with nothing else competing.
 *
 * The option picker lives inside this panel rather than in its own section —
 * keeping the choice adjacent to the button is most of what makes the fold
 * convert. The standalone optionSelector block exists for a second picker
 * further down a long page.
 */
function HeroBlock({ ctx, ...props }) {
  const {
    eyebrow,
    headline,
    subheadline,
    benefits,
    showGallery = true,
    showRating = true,
    showPrice = true,
    showOptions = true,
    showStock = true,
    priceNote = 'כולל מע"מ',
    ctaLabel,
    reassuranceText = "תשלום מאובטח, ללא התחייבות, 14 יום להחזרה",
    footnote,
    lowStockThreshold = 5,
  } = props;

  const { product, totalPrice, heroCtaRef, handleCheckout, defaultCtaLabel } = ctx;

  const images = (product.images || []).filter(Boolean);
  const hasRating = Number(product.rating?.count) > 0;
  const isLowStock =
    product.stock > 0 && product.stock <= lowStockThreshold;

  // Left unset by the admin, the benefits are derived from the product, so a
  // page nobody has customized still reads correctly.
  const benefitLines =
    benefits?.length > 0
      ? benefits.map((benefit) => benefit.text).filter(Boolean)
      : [
          "עבודת יד בהזמנה אישית, לא ייצור המוני",
          product.meaningHe
            ? "מגיע עם כרטיס המשמעות של הסמל"
            : "אריזת מתנה מוכנה למסירה",
          "משלוח חינם מעל ₪300, 14 יום להחזרה",
        ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 lg:py-10">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {showGallery ? (
          <div className="animate-dpp-rise lg:sticky lg:top-6 lg:self-start">
            <Gallery images={images} name={product.name} />
          </div>
        ) : null}

        <div className="animate-dpp-rise">
          {eyebrow || product.category ? (
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-gold-dark">
              {eyebrow || product.category}
            </p>
          ) : null}

          <h1 className="font-display text-3xl leading-tight text-navy sm:text-4xl">
            {headline || product.name}
          </h1>

          {subheadline ? (
            <p className="mt-3 leading-relaxed text-gray-600">{subheadline}</p>
          ) : null}

          {showRating && hasRating ? (
            <div className="mt-3">
              <StarRating
                average={product.rating.average}
                count={product.rating.count}
              />
            </div>
          ) : null}

          {/* No struck-through "was" price: the storefront does not use
              product.discountPrice, so any anchor shown here would not be a
              price this shop actually charged. */}
          {showPrice ? (
            <div className="mt-4 flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-bold text-navy">
                {formatPrice(totalPrice)}
              </span>
              {priceNote ? (
                <span className="text-sm text-gray-500">{priceNote}</span>
              ) : null}
            </div>
          ) : null}

          {benefitLines.length > 0 ? (
            <ul className="mt-5 space-y-2">
              {benefitLines.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2 text-gray-700">
                  <BadgeCheck
                    className="mt-0.5 h-5 w-5 shrink-0 text-gold"
                    strokeWidth={1.75}
                  />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {showOptions ? (
            <div className="mt-7">
              <OptionGroups ctx={ctx} labels={props} attachRef />
            </div>
          ) : null}

          {/* Marked so popup triggers can find the primary CTA: "scrollToCta"
              scrolls here, and "onCtaAbandon" fires when it scrolls out of
              view unclicked. */}
          <CtaButton
            ref={heroCtaRef}
            data-dpp-cta=""
            label={ctaLabel || defaultCtaLabel}
            price={totalPrice}
            onClick={handleCheckout}
            className="mt-6"
          />

          {reassuranceText ? (
            <p className="mt-3 flex items-center justify-center gap-1.5 text-sm text-gray-600">
              <ShieldCheck className="h-4 w-4 text-navy" strokeWidth={1.75} />
              {reassuranceText}
            </p>
          ) : null}

          {showStock && isLowStock ? (
            <p className="mt-3 text-center text-sm font-medium text-gold-dark">
              נותרו {product.stock} יחידות במלאי הנוכחי
            </p>
          ) : null}

          {footnote ? (
            <p className="mt-4 text-center text-sm text-gray-500">{footnote}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default HeroBlock;
