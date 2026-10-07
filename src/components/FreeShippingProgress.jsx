import { useLanguage } from "../contexts/LanguageContext";
import { formatPrice } from "../utils/format";
import { quoteShipping, FREE_SHIPPING_THRESHOLD } from "../utils/shipping";

/**
 * "₪70 more for free shipping" with a slim progress bar. Shown in the cart
 * (destination is unknown there, so it uses the Israeli rule; international
 * rates appear at checkout once a country is chosen).
 */
function FreeShippingProgress({ total }) {
  const { language } = useLanguage();
  const he = language === "he";
  const { free, remainingForFree } = quoteShipping("IL", total);
  const progress = Math.min(total / FREE_SHIPPING_THRESHOLD, 1);

  return (
    <div className={`free-shipping${free ? " free-shipping--done" : ""}`}>
      <p className="free-shipping__text" aria-live="polite">
        {free
          ? he
            ? "מגיע לך משלוח חינם!"
            : "You've unlocked free shipping!"
          : he
            ? `עוד ${formatPrice(remainingForFree, language)} ומשלוח חינם`
            : `${formatPrice(remainingForFree, language)} more for free shipping`}
      </p>
      <div
        className="free-shipping__track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={FREE_SHIPPING_THRESHOLD}
        aria-valuenow={Math.min(total, FREE_SHIPPING_THRESHOLD)}
        aria-label={he ? "התקדמות למשלוח חינם" : "Progress to free shipping"}
      >
        <span className="free-shipping__bar" style={{ transform: `scaleX(${progress})` }} />
      </div>
    </div>
  );
}

export default FreeShippingProgress;
