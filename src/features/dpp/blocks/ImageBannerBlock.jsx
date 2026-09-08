function ImageBannerBlock({
  ctx,
  imageUrl,
  alt = "",
  href,
  fullWidth = false,
}) {
  // With no URL of its own the banner shows the product's main image, so a
  // freshly added block is already on-brand instead of rendering nothing.
  const product = ctx?.product;
  const src = imageUrl || (product?.images || []).filter(Boolean)[0];
  if (!src) return null;

  const image = (
    <img
      src={src}
      alt={alt || product?.name || ""}
      loading="lazy"
      decoding="async"
      className="w-full object-cover"
    />
  );

  return (
    <section className={fullWidth ? "" : "mx-auto max-w-5xl px-4 py-8"}>
      <div className={fullWidth ? "" : "overflow-hidden rounded-2xl"}>
        {href ? (
          // Campaign pages open outbound links in a new tab so the session is
          // never navigated away from.
          <a href={href} target="_blank" rel="noopener noreferrer">
            {image}
          </a>
        ) : (
          image
        )}
      </div>
    </section>
  );
}

export default ImageBannerBlock;
