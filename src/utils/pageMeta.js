import { useEffect } from "react";

/**
 * Document <head> management for the SPA: title, description, canonical URL,
 * Open Graph / Twitter tags (link previews on WhatsApp, Facebook, etc.),
 * robots and JSON-LD structured data.
 */

export const SITE_NAME = { he: "שמים וארץ", en: "Shamaim VeEretz" };
export const SITE_URL = "https://shamaimveeretz.com";
export const DEFAULT_IMAGE =
  "https://res.cloudinary.com/dhayarvh3/image/upload/v1771151995/HomepageBG.jpg";

function upsertMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!content) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Apply page metadata. `path` is the canonical path (no host).
 * Returns nothing; call again to overwrite.
 */
export function applyPageMeta({
  title,
  description,
  path = "/",
  image = DEFAULT_IMAGE,
  type = "website",
  noindex = false,
  language = "he",
}) {
  const siteName = SITE_NAME[language] || SITE_NAME.he;
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const url = `${SITE_URL}${path}`;

  document.title = fullTitle;
  upsertMeta("name", "description", description);
  upsertMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");
  upsertLink("canonical", url);

  upsertMeta("property", "og:site_name", siteName);
  upsertMeta("property", "og:title", fullTitle);
  upsertMeta("property", "og:description", description);
  upsertMeta("property", "og:url", url);
  upsertMeta("property", "og:type", type);
  upsertMeta("property", "og:image", image);
  upsertMeta("property", "og:locale", language === "he" ? "he_IL" : "en_US");
  upsertMeta("name", "twitter:card", "summary_large_image");
  upsertMeta("name", "twitter:title", fullTitle);
  upsertMeta("name", "twitter:description", description);
  upsertMeta("name", "twitter:image", image);
}

/** Inject (or replace) one JSON-LD block, identified by `id`. */
export function setJsonLd(id, data) {
  const selector = `script[type="application/ld+json"][data-id="${id}"]`;
  let el = document.head.querySelector(selector);
  if (!data) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("script");
    el.type = "application/ld+json";
    el.dataset.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

/** Page-level override of the route defaults (e.g. an open product). */
export function usePageMeta(meta) {
  const key = meta ? JSON.stringify(meta) : null;
  useEffect(() => {
    if (!key) return;
    applyPageMeta(JSON.parse(key));
  }, [key]);
}

/** schema.org Product markup for rich results (price, availability). */
export function productJsonLd(product, { url, language = "he" } = {}) {
  if (!product) return null;
  const images = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: language === "en" && product.nameEn ? product.nameEn : product.name,
    description:
      (language === "en" && product.descriptionEn) || product.description || undefined,
    image: images.length ? images : undefined,
    sku: product.id,
    category: product.category,
    brand: { "@type": "Brand", name: SITE_NAME.he },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "ILS",
      price: Number(product.price) || 0,
      // Pieces are made to order and stock is not tracked (it defaults to 0),
      // so every listed product is orderable.
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: SITE_NAME.he },
    },
  };
}
