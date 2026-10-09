import { useState } from "react";
import { handleImageError, productImage, sizedImage } from "../utils/format";

const CARD_IMAGE_WIDTH = 400;

const canHover = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(hover: hover) and (pointer: fine)").matches;

/**
 * Product photo for a shop card.
 * - fades in once decoded, over a warm placeholder, instead of popping in
 * - on desktop hover, cross-fades to the product's second photo; that photo
 *   is only requested the first time the pointer arrives, so visitors who
 *   never hover never download it
 */
function ProductCardMedia({ product, alt }) {
  const [loaded, setLoaded] = useState(false);
  const [wantAlt, setWantAlt] = useState(false);
  const [altLoaded, setAltLoaded] = useState(false);

  const second = Array.isArray(product.images) ? product.images[1] : null;

  return (
    <div
      className="product-media"
      onPointerEnter={(event) => {
        if (second && event.pointerType === "mouse" && canHover()) setWantAlt(true);
      }}
    >
      <img
        src={sizedImage(productImage(product), CARD_IMAGE_WIDTH)}
        alt={alt}
        className="product-image"
        data-loaded={loaded || undefined}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={(event) => {
          handleImageError(event);
          setLoaded(true);
        }}
      />
      {wantAlt && (
        <img
          src={sizedImage(second, CARD_IMAGE_WIDTH)}
          alt=""
          aria-hidden="true"
          className="product-image product-image--alt"
          data-loaded={altLoaded || undefined}
          decoding="async"
          onLoad={() => setAltLoaded(true)}
          onError={() => setWantAlt(false)}
        />
      )}
    </div>
  );
}

export default ProductCardMedia;
