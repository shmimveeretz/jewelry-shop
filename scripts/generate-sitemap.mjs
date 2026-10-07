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
}

main().catch((error) => {
  // Never fail the build over the sitemap
  console.warn("sitemap: skipped —", error.message);
});
