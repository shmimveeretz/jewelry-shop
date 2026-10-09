/* global Netlify -- provided by the Netlify Edge runtime */
/**
 * Injects a Dedicated Product Page's data into the static Vite index.html at
 * the CDN edge, before the browser gets the document.
 *
 * Two jobs:
 * 1. Speed. Without this, an ad click costs three sequential round trips
 *    before anything renders: HTML, then the JS bundle, then the API call.
 *    With it, React finds the payload already on `window`.
 * 2. Link previews and crawlers. WhatsApp, Facebook and most bots never run
 *    JavaScript, so they only see the static <head>. Here the generic store
 *    title, description, image and canonical are swapped for the product's.
 *
 * Every failure path falls through to `context.next()` — the unmodified HTML,
 * which the SPA still renders by fetching the same endpoint itself. A broken
 * edge function must never take the campaign down.
 */

/** Budget for the API hop. Past this the HTML ships without injected state. */
const API_TIMEOUT_MS = 700;
const SITE_NAME = "שמים וארץ";

// The API's public address. netlify.toml's [build] environment only exists
// during the build, so at runtime the edge only sees variables set in the
// Netlify UI; without this fallback the function silently did nothing.
const DEFAULT_API_BASE = "https://jewelry-shop-udr7.onrender.com";

const resolveApiBase = () =>
  Netlify.env.get("DPP_API_URL") ||
  Netlify.env.get("VITE_API_URL") ||
  DEFAULT_API_BASE;

/**
 * JSON.stringify alone is NOT safe to drop inside a <script> tag: a string
 * containing "</script>" closes it and everything after becomes markup. The
 * line/paragraph separators are valid JSON but invalid JavaScript string
 * literals, so they get escaped too.
 */
const toScriptSafeJson = (value) =>
  JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");

const escapeAttribute = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

/**
 * Same Cloudinary sizing as sizedImage() in src/utils/format.js (keep the two
 * in step): the preload must request the exact URL the gallery renders, or
 * the hero photo downloads twice.
 */
const HERO_IMAGE_WIDTH = 600;
const sizedImage = (url, width) => {
  if (typeof url !== "string" || !width) return url;
  const marker = "/image/upload/";
  const at = url.indexOf(marker);
  if (at === -1 || !url.includes("res.cloudinary.com")) return url;
  const head = url.slice(0, at + marker.length);
  const rest = url.slice(at + marker.length);
  const size = `w_${Math.round(width * 2)},c_limit`;
  const [first, ...others] = rest.split("/");
  const isTransform = others.length > 0 && /^[a-z]{1,3}_[^/]*$/.test(first) && !/^v\d+$/.test(first);
  if (isTransform) {
    const kept = first.split(",").filter((part) => !/^(w|c)_/.test(part));
    return `${head}${[...kept, size].join(",")}/${others.join("/")}`;
  }
  return `${head}f_auto,q_auto,${size}/${rest}`;
};

/** Shorten to ~160 characters on a word boundary, for search snippets */
const snippet = (text, max = 160) => {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")) || cut}…`;
};

/** Same title/description/image choices as DppPage.jsx makes client-side */
const pageMeta = (slug, payload, origin) => {
  const { page = {}, product = {} } = payload || {};
  const seo = page.seo || {};
  const title = seo.title || product.name;
  return {
    title: title ? `${title} | ${SITE_NAME}` : SITE_NAME,
    description: snippet(seo.description || product.description),
    // 1200px wide: what link previews display, without the 3000px original
    image: seo.ogImage || sizedImage(product.images?.[0], HERO_IMAGE_WIDTH) || "",
    url: `${origin}/lp/${encodeURIComponent(slug)}`,
    noindex: seo.noindex !== false,
  };
};

/**
 * Replace a tag already in index.html, or append one if it's missing, so the
 * document never carries two conflicting canonicals or titles.
 */
const setTag = (html, pattern, tag) =>
  // Function replacements: product text is data, and a "$'" or "$`" in it
  // would otherwise be read as a replacement pattern and splice the page.
  pattern.test(html)
    ? html.replace(pattern, () => tag)
    : html.replace("</head>", () => `${tag}</head>`);

const metaPattern = (attr, name) =>
  new RegExp(`<meta\\s+${attr}="${name}"[\\s\\S]*?>`, "i");

const rewriteHead = (html, slug, payload, origin) => {
  const meta = pageMeta(slug, payload, origin);
  let out = html;

  out = setTag(out, /<title>[\s\S]*?<\/title>/i, `<title>${escapeAttribute(meta.title)}</title>`);
  out = setTag(out, /<link\s+rel="canonical"[\s\S]*?>/i, `<link rel="canonical" href="${escapeAttribute(meta.url)}" />`);
  out = setTag(out, metaPattern("property", "og:title"), `<meta property="og:title" content="${escapeAttribute(meta.title)}" />`);
  out = setTag(out, metaPattern("property", "og:url"), `<meta property="og:url" content="${escapeAttribute(meta.url)}" />`);
  out = setTag(out, metaPattern("property", "og:type"), `<meta property="og:type" content="product" />`);
  if (meta.description) {
    out = setTag(out, metaPattern("name", "description"), `<meta name="description" content="${escapeAttribute(meta.description)}" />`);
    out = setTag(out, metaPattern("property", "og:description"), `<meta property="og:description" content="${escapeAttribute(meta.description)}" />`);
  }
  if (meta.image) {
    out = setTag(out, metaPattern("property", "og:image"), `<meta property="og:image" content="${escapeAttribute(meta.image)}" />`);
  }

  const extra = [
    `<script>window.__DPP_INITIAL_STATE__=${toScriptSafeJson({ slug, data: payload })};</script>`,
  ];
  // The hero image is the LCP element on every DPP. Preloading it here starts
  // the download during HTML parse, well before React decides to render it.
  const heroImage = sizedImage(payload?.product?.images?.[0], HERO_IMAGE_WIDTH);
  if (heroImage) {
    extra.push(
      `<link rel="preload" as="image" fetchpriority="high" href="${escapeAttribute(heroImage)}">`,
    );
  }
  // Campaign pages stay out of search results unless the admin opts in
  if (meta.noindex) extra.push('<meta name="robots" content="noindex,nofollow">');

  return out.replace("</head>", () => `${extra.join("")}</head>`);
};

export default async (request, context) => {
  const url = new URL(request.url);

  // Only rewrite the document request itself.
  if (request.method !== "GET") return context.next();

  const slug = url.pathname.split("/").filter(Boolean).pop();
  if (!slug) return context.next();

  // The admin preview iframe must always read the draft client-side.
  if (url.searchParams.has("previewToken")) return context.next();

  const apiBase = resolveApiBase();
  if (!apiBase) return context.next();

  // Never rejects: a failed hop resolves to null so the caller below can fall
  // back without a second context.next(), which would be an error.
  const dataPromise = fetch(`${apiBase}/api/dpp/${encodeURIComponent(slug)}`, {
    signal: AbortSignal.timeout(API_TIMEOUT_MS),
    headers: { accept: "application/json" },
  })
    .then((response) => (response.ok ? response.json() : null))
    .catch((error) => {
      console.warn(`DPP injection skipped for "${slug}": ${error.message}`);
      return null;
    });

  // Started in parallel with the fetch above, so the API hop is not added to
  // the time it takes to retrieve the static shell.
  const pageResponse = await context.next();

  try {
    const body = await dataPromise;
    if (!body?.success || !body?.data) return pageResponse;

    // Read from a clone so `pageResponse` still has an intact body to return
    // if anything below throws.
    const html = await pageResponse.clone().text();
    // Netlify's URL is the site's primary domain; fall back to the request's
    const origin = (Netlify.env.get("URL") || url.origin).replace(/\/$/, "");
    const injected = rewriteHead(html, slug, body.data, origin);

    const headers = new Headers(pageResponse.headers);
    headers.set("content-type", "text/html; charset=utf-8");
    // The document is now visitor-independent but slug-specific. Short shared
    // cache, revalidating in the background, matches the API's own policy.
    headers.set("cache-control", "public, max-age=0, must-revalidate");
    headers.set(
      "netlify-cdn-cache-control",
      "public, s-maxage=60, stale-while-revalidate=300",
    );
    headers.delete("content-length");

    return new Response(injected, { status: pageResponse.status, headers });
  } catch (error) {
    // Malformed JSON or an unreadable body. The SPA fetches for itself and
    // shows its skeleton — slower, but never broken.
    console.warn(`DPP injection failed for "${slug}": ${error.message}`);
    return pageResponse;
  }
};

export const config = { path: "/lp/*" };
