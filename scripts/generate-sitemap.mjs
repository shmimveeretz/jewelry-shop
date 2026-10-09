/**
 * Writes public/sitemap.xml before each build (npm "prebuild").
 *
 * Static pages and collections are always listed; products come from the
 * live API so every piece gets its own indexable URL (/shop?product=<id>).
 * If the API cannot be reached the existing sitemap is kept, so a flaky
 * network never breaks a deploy or ships an empty sitemap.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SITE = "https://shamaimveeretz.com";
const API =
  (process.env.VITE_API_URL || "https://jewelry-shop-udr7.onrender.com").replace(/\/+$/, "");
const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../public/sitemap.xml");
const LLMS_OUT = path.resolve(path.dirname(OUT), "llms.txt");

const STATIC_PAGES = [
  ["/", "1.0", "weekly"],
  ["/shop", "0.9", "weekly"],
  ["/zodiac", "0.8", "monthly"],
  ["/about", "0.6", "yearly"],
  ["/contact", "0.5", "yearly"],
  ["/track-order", "0.3", "yearly"],
  ["/shipping-policy", "0.3", "yearly"],
  ["/return-policy", "0.3", "yearly"],
  ["/terms-of-service", "0.2", "yearly"],
  ["/privacy-policy", "0.2", "yearly"],
  ["/accessibility", "0.2", "yearly"],
];

const COLLECTIONS = [
  "אותיות עבריות",
  "תליוני מזלות",
  "שלישיות מיוחדות",
  "אבני חושן",
  "כוכבים",
  "סמלי בני ישראל",
];

const xmlEscape = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const entry = (loc, priority, changefreq, lastmod) =>
  `  <url>\n    <loc>${xmlEscape(loc)}</loc>\n` +
  (lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : "") +
  `    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;

async function loadProducts() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`${API}/api/products?limit=200`, { signal: controller.signal });
    const data = await response.json();
    if (!data.success || !Array.isArray(data.data)) throw new Error("bad response");
    return data.data;
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  let products;
  try {
    products = await loadProducts();
  } catch (error) {
    if (fs.existsSync(OUT)) {
      console.warn(`sitemap: API unavailable (${error.message}); keeping existing sitemap.xml`);
      return;
    }
    console.warn(`sitemap: API unavailable (${error.message}); writing pages only`);
    products = [];
  }

  const urls = [
    ...STATIC_PAGES.map(([p, priority, freq]) => entry(`${SITE}${p}`, priority, freq)),
    ...COLLECTIONS.map((c) =>
      entry(`${SITE}/shop?category=${encodeURIComponent(c)}`, "0.8", "weekly"),
    ),
    ...products.map((p) =>
      entry(
        `${SITE}/shop?product=${encodeURIComponent(p.id)}`,
        "0.7",
        "monthly",
        p.updatedAt ? new Date(p.updatedAt).toISOString().slice(0, 10) : undefined,
      ),
    ),
  ];

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, xml);
  console.log(`sitemap: wrote ${urls.length} URLs (${products.length} products)`);

  if (products.length > 0) {
    fs.writeFileSync(LLMS_OUT, buildLlmsTxt(products));
    console.log(`llms.txt: wrote ${products.length} products`);
  }
}

/**
 * /llms.txt (llmstxt.org): the store in plain text for AI assistants. The
 * site is a JavaScript app, and AI crawlers don't run JavaScript, so without
 * this they see an empty page. Every fact here mirrors the site's own policy
 * pages; products and prices come from the live catalogue at build time.
 */
function buildLlmsTxt(products) {
  const byCategory = new Map();
  for (const p of products) {
    const key = p.category || "אחר";
    if (!byCategory.has(key)) byCategory.set(key, { en: p.categoryEn, items: [] });
    byCategory.get(key).items.push(p);
  }

  const productLines = [...byCategory.entries()]
    .map(([category, { en, items }]) => {
      const lines = items
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map((p) => {
          const name = p.nameEn ? `${p.name} (${p.nameEn})` : p.name;
          return `- [${name}](${SITE}/shop?product=${encodeURIComponent(p.id)}): from ₪${p.price}`;
        });
      return `### ${category}${en ? ` (${en})` : ""}\n\n${lines.join("\n")}`;
    })
    .join("\n\n");

  return `# שמים וארץ (Shamaim VeEretz)

> Handmade Jewish jewelry from Israel, inspired by the sources: Hebrew letters, zodiac signs and Hebrew months, the stones of the High Priest's breastplate (Hoshen), the planets and the symbols of the tribes of Israel. Sterling silver 925, gold plating and 14K gold. Every piece is made to order.

- Website: ${SITE} (Hebrew, with an English version)
- Prices: Israeli shekels (ILS), VAT included
- Made to order, delivered in Israel within up to 14 business days of the order
- Shipping in Israel: ₪30, free on orders of ₪300 or more
- International shipping: Europe ₪150, USA and Canada ₪180, rest of the world ₪200
- Returns: within 14 days of delivery for unused items; personalized pieces (custom letters, engravings, special sizes) can't be returned unless defective
- Warranty: 12 months against manufacturing defects
- Contact: shmimveeretz@gmail.com, WhatsApp +972-52-595-5389

## Key pages

- [Shop](${SITE}/shop): the full collection
- [Zodiac wheel](${SITE}/zodiac): find the piece for a zodiac sign or Hebrew month
- [About](${SITE}/about)
- [Shipping policy](${SITE}/shipping-policy)
- [Return policy](${SITE}/return-policy)
- [Contact](${SITE}/contact)

## Products

${productLines}
`;
}

main().catch((error) => {
  // Never fail the build over the sitemap
  console.warn("sitemap: skipped —", error.message);
});
