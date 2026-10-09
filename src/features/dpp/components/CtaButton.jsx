import { forwardRef } from "react";
import { Lock } from "lucide-react";
import { formatPrice } from "../format";

/**
 * The single element every DPP is built around. Kept in one place so a label
 * or size change applies to the hero, the final section and the sticky bar at
 * once — three CTAs that disagree read as three different offers.
 */
const CtaButton = forwardRef(function CtaButton(
  {
    label,
    price,
    onClick,
    variant = "primary",
    showPrice = true,
    className = "",
    ...rest
  },
  ref,
) {
  const variants = {
    primary:
      "bg-gold text-navy shadow-lg shadow-gold/30 hover:bg-gold-dark",
    onDark: "bg-gold text-navy shadow-lg hover:bg-white",
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className={`flex min-h-14 w-full items-center justify-center gap-2 rounded-xl px-6 text-lg font-bold transition ${variants[variant]} ${className}`}
      {...rest}
    >
      <Lock className="h-5 w-5" strokeWidth={2} />
      {showPrice ? `${label} — ${formatPrice(price)}` : label}
    </button>
  );
});

export default CtaButton;
