import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { FaSearch, FaTimes } from "react-icons/fa";
import "../styles/pages/Shop.css";
import ProductModal from "../components/ProductModal";
import { useProducts } from "../hooks/useProducts";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../contexts/LanguageContext";
import { productMatchesZodiac } from "../utils/zodiacFilter";
import { API_BASE_URL } from "../constants/api";
import {
  formatPrice,
  productName,
  productImage,
  handleImageError,
} from "../utils/format";
import { clickableProps } from "../utils/a11y";
import { trackEvent, productEventPayload } from "../utils/tracking";
import { applyPageMeta, setJsonLd, productJsonLd, SITE_URL } from "../utils/pageMeta";
import { applyRouteMeta } from "../components/RouteMeta";

// Calculate the min and max possible price for a product given its priceAdditions
function getProductPriceRange(product) {
  const base = product.price || 0;
  const additions = product.priceAdditions;
  if (!additions) return { min: base, max: base };

  let maxAddition = 0;
  for (const category of Object.values(additions)) {
    if (!category || typeof category !== "object") continue;
    const nums = Object.values(category).filter((v) => typeof v === "number");
    if (nums.length > 0) maxAddition += Math.max(...nums);
  }
  return { min: base, max: base + maxAddition };
}

// A product needs the options modal when any priceAdditions group has choices
// (metal, length, jewelry type, chain...). Only option-free products can be
// added to the cart directly from the grid.
function productRequiresOptions(product) {
  const additions = product.priceAdditions || {};
  return Object.keys(additions).some(
    (key) =>
      typeof additions[key] === "object" &&
      additions[key] !== null &&
      Object.keys(additions[key]).length > 0,
  );
}

function lowStockLabel(product, language) {
  const { stock } = product;
  if (!(typeof stock === "number" && stock > 0 && stock <= 3)) return null;
  if (language === "he") {
    return stock === 1 ? "נותר אחרון במלאי" : `נותרו רק ${stock} במלאי`;
  }
  return stock === 1 ? "LAST ONE LEFT" : `ONLY ${stock} LEFT`;
}

const ALL = "הכל";

const ALL_COLLECTION = {
  id: ALL,
  nameHe: "הכל",
  nameEn: "All",
  image:
    "https://res.cloudinary.com/dhayarvh3/image/upload/v1771152721/AboutBG.jpg",
  descriptionHe: "מסע מבראשית דרך שמים וארץ ומה שביניהם",
  descriptionEn:
    "A journey from Genesis through Heaven and Earth and what lies between",
};

const STAR_DISPLAY_ORDER = [
  "maadim",
  "venus",
  "kochav-chama",
  "yareach",
  "shemesh",
  "tzedek",
  "saturn",
];

const SORT_OPTIONS = [
  { value: "recommended", he: "מומלץ", en: "Recommended" },
  { value: "price-asc", he: "מחיר: מהנמוך לגבוה", en: "Price: low to high" },
  { value: "price-desc", he: "מחיר: מהגבוה לנמוך", en: "Price: high to low" },
  { value: "name", he: "שם (א-ת)", en: "Name (A–Z)" },
];

/** The collection's own curated order (letters by alphabet, stars by planet…). */
function recommendedOrder(collection) {
  return (a, b) => {
    if (a.id === "letter-chain") return -1;
    if (b.id === "letter-chain") return 1;

    if (collection === "אותיות עבריות") {
      if (a.letter && b.letter) return a.letter.localeCompare(b.letter, "he");
      return (a.gematria ?? 9999) - (b.gematria ?? 9999);
    }

    if (collection === "כוכבים") {
      const ai = STAR_DISPLAY_ORDER.indexOf(a.id);
      const bi = STAR_DISPLAY_ORDER.indexOf(b.id);
      const aOrder = ai === -1 ? (a.sortOrder ?? 999) : ai;
      const bOrder = bi === -1 ? (b.sortOrder ?? 999) : bi;
      return aOrder - bOrder;
    }

    return 0;
  };
}

function ProductSkeletonGrid() {
  return (
    <div className="products-grid" aria-hidden="true">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="product-card product-card--skeleton">
          <div className="skeleton-block skeleton-block--image" />
          <div className="product-info">
            <div className="skeleton-block skeleton-block--line" />
            <div className="skeleton-block skeleton-block--line short" />
          </div>
        </div>
      ))}
    </div>
  );
}

function Shop() {
  const { t, language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart, openCartDrawer } = useCart();
  const { showCartToast } = useToast();
  const [apiCategories, setApiCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recommended");

  // The URL is the source of truth for the category, zodiac filter and the
  // open product, so every view can be shared, bookmarked and reached with
  // the back button.
  const categoryParam = searchParams.get("category");
  const zodiacFilter = searchParams.get("zodiac");
  const productParam = searchParams.get("product");
  const selectedCollection = zodiacFilter ? ALL : categoryParam || ALL;

  const updateParams = useCallback(
    (changes, { replace = false } = {}) => {
      const next = new URLSearchParams(searchParams);
      for (const [key, value] of Object.entries(changes)) {
        if (value === null || value === undefined || value === "") next.delete(key);
        else next.set(key, value);
      }
      setSearchParams(next, { replace });
    },
    [searchParams, setSearchParams],
  );

  // Legacy entry points: navigation state from the zodiac page / cart drawer,
  // and an old category name.
  useEffect(() => {
    if (location.state?.zodiacFilter) {
      navigate(`/shop?zodiac=${encodeURIComponent(location.state.zodiacFilter)}`, {
        replace: true,
        state: null,
      });
    } else if (location.state?.openProductId) {
      navigate(`/shop?product=${encodeURIComponent(location.state.openProductId)}`, {
        replace: true,
        state: null,
      });
    } else if (categoryParam === "שילת") {
      navigate(`/shop?category=${encodeURIComponent("סמלי בני ישראל")}`, {
        replace: true,
      });
    }
  }, [location.state, categoryParam, navigate]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE_URL}/api/categories`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setApiCategories(data.data || []);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const collections = useMemo(
    () => [
      {
        ...ALL_COLLECTION,
        name: language === "he" ? ALL_COLLECTION.nameHe : ALL_COLLECTION.nameEn,
        description:
          language === "he"
            ? ALL_COLLECTION.descriptionHe
            : ALL_COLLECTION.descriptionEn,
      },
      ...apiCategories.map((cat) => ({
        id: cat.slug,
        name: language === "he" ? cat.nameHe : cat.nameEn || cat.nameHe,
        image: cat.image,
        description:
          language === "he" ? cat.descriptionHe : cat.descriptionEn || cat.descriptionHe,
        source: language === "he" ? cat.sourceHe : cat.sourceEn,
      })),
    ],
    [language, apiCategories],
  );

  // The whole catalog is cached once; the category is filtered in memory.
  const { products: catalog, loading, error, refetch } = useProducts();

  const selectedProduct = useMemo(
    () => (productParam ? catalog.find((p) => p.id === productParam) || null : null),
    [productParam, catalog],
  );

  const openProduct = (product) => updateParams({ product: product.id });
  const closeProduct = () => updateParams({ product: null }, { replace: true });

  const visibleProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let list = catalog.filter(
      (product) =>
        (selectedCollection === ALL || product.category === selectedCollection) &&
        productMatchesZodiac(product, zodiacFilter),
    );

    if (term) {
      list = list.filter((product) =>
        [product.name, product.nameEn, product.description, product.category, product.letter]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(term)),
      );
    }

    const sorted = [...list];
    if (sortBy === "price-asc") sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (sortBy === "price-desc") sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
    else if (sortBy === "name")
      sorted.sort((a, b) =>
        productName(a, language).localeCompare(productName(b, language), language),
      );
    else sorted.sort(recommendedOrder(selectedCollection));
    return sorted;
  }, [catalog, selectedCollection, zodiacFilter, searchTerm, sortBy, language]);

  const handleCollectionChange = (collectionId) => {
    updateParams({
      category: collectionId === ALL ? null : collectionId,
      zodiac: null,
      product: null,
    });
  };

  const clearZodiacFilter = () => updateParams({ zodiac: null });

  // Quick Add: option-free products go straight to the cart; products that
  // need a metal/length/type choice open the options modal instead.
  const handleQuickAdd = (e, product) => {
    e.stopPropagation();

    if (productRequiresOptions(product)) {
      openProduct(product);
      return;
    }

    // Mirror the cart-item shape built by ProductModal so dedupe keys match
    addToCart(
      {
        ...product,
        basePrice: product.price,
        selectedOptions: {},
        selections: {},
        cartItemId: `${product.id}__${JSON.stringify({})}`,
      },
      1,
    );

    trackEvent("AddToCart", productEventPayload(product));

    const displayName = productName(product, language);
    showCartToast(
      language === "en" ? `${displayName} added to cart!` : `${displayName} נוסף לעגלה!`,
      productImage(product),
    );
    openCartDrawer?.();
  };

  const currentCollection =
    collections.find((col) => col.id === selectedCollection) || collections[0];

  // An open product or a chosen collection gets its own title, description,
  // preview image and (for products) schema.org Product data, so shared links
  // and search results show the actual piece.
  useEffect(() => {
    if (selectedProduct) {
      const path = `/shop?product=${encodeURIComponent(selectedProduct.id)}`;
      const description =
        (language === "en" && selectedProduct.descriptionEn) ||
        selectedProduct.description ||
        "";
      applyPageMeta({
        title: productName(selectedProduct, language),
        description: description.slice(0, 160),
        path,
        image: productImage(selectedProduct),
        type: "product",
        language,
      });
      setJsonLd("product", productJsonLd(selectedProduct, { url: `${SITE_URL}${path}`, language }));
      return () => setJsonLd("product", null);
    }

    if (currentCollection && selectedCollection !== ALL) {
      applyPageMeta({
        title: currentCollection.name,
        description: currentCollection.description || "",
        path: `/shop?category=${encodeURIComponent(selectedCollection)}`,
        image: currentCollection.image,
        language,
      });
    } else {
      applyRouteMeta("/shop", language);
    }
    return undefined;
  }, [selectedProduct, currentCollection, selectedCollection, language]);

  const renderPrice = (product) => {
    const { min, max } = getProductPriceRange(product);
    if (max > min) {
      return (
        <>
          <span className="price-from">{language === "he" ? "החל מ-" : "From "}</span>
          {formatPrice(min, language)}
        </>
      );
    }
    return formatPrice(min, language);
  };

  const renderQuote = (product) => {
    if (product.category !== "סמלי בני ישראל" && selectedCollection !== "סמלי בני ישראל") {
      return null;
    }
    const quote = language === "he" ? product.quoteHe : product.quoteEn || product.quoteHe;
    if (!quote) return null;
    const source = language === "he" ? product.sourceHe : product.sourceEn || product.sourceHe;
    return (
      <p className="product-card-quote">
        <em>&ldquo;{quote}&rdquo;</em>
        {source && <span className="product-card-quote-source"> — {source}</span>}
      </p>
    );
  };

  return (
    <div className="shop">
      <div className="container">
        {currentCollection && (
          <div className="category-hero">
            <div className="category-hero-image">
              <img
                src={currentCollection.image}
                alt=""
                fetchpriority="high"
                onError={handleImageError}
              />
              <div className="category-hero-overlay"></div>
            </div>
            <div className="category-hero-content">
              <h1>{currentCollection.name}</h1>
              {currentCollection.description && (
                <p className="hero-quote">
                  <em>&ldquo;{currentCollection.description}&rdquo;</em>
                  {currentCollection.source && (
                    <span className="hero-quote-source"> — {currentCollection.source}</span>
                  )}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="shop-content">
          <section className="products-section" aria-labelledby="shop-results-heading">
            <div className="products-header">
              <nav
                className="collection-filter"
                aria-label={language === "he" ? "קולקציות" : "Collections"}
              >
                {collections.map((collection) => (
                  <button
                    key={collection.id}
                    type="button"
                    className={`collection-btn ${
                      selectedCollection === collection.id ? "active" : ""
                    }`}
                    aria-pressed={selectedCollection === collection.id}
                    onClick={() => handleCollectionChange(collection.id)}
                  >
                    <span>{collection.name}</span>
                  </button>
                ))}
              </nav>

              <div className="shop-toolbar">
                <div className="shop-search">
                  <FaSearch className="shop-search-icon" aria-hidden="true" />
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={language === "he" ? "חיפוש תכשיט…" : "Search jewelry…"}
                    aria-label={language === "he" ? "חיפוש מוצרים" : "Search products"}
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      className="shop-search-clear"
                      onClick={() => setSearchTerm("")}
                      aria-label={language === "he" ? "ניקוי חיפוש" : "Clear search"}
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>

                <label className="shop-sort">
                  <span>{language === "he" ? "מיון:" : "Sort:"}</span>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option[language] || option.he}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {zodiacFilter && (
                <div className="shop-zodiac-filter">
                  <span>
                    {language === "he"
                      ? `מציג תכשיטים למזל ${zodiacFilter}`
                      : `Showing jewelry for ${zodiacFilter}`}
                  </span>
                  <button
                    type="button"
                    className="shop-zodiac-filter-clear"
                    onClick={clearZodiacFilter}
                  >
                    {language === "he" ? "הסר סינון" : "Clear filter"}
                  </button>
                </div>
              )}
            </div>

            <h2 id="shop-results-heading" className="visually-hidden">
              {language === "he" ? "מוצרים" : "Products"}
            </h2>
            {!loading && !error && (
              <p className="shop-results-count" aria-live="polite">
                {language === "he"
                  ? visibleProducts.length === 1
                    ? "מוצר אחד"
                    : `${visibleProducts.length} מוצרים`
                  : `${visibleProducts.length} product${visibleProducts.length === 1 ? "" : "s"}`}
              </p>
            )}

            {loading ? (
              <ProductSkeletonGrid />
            ) : error ? (
              <div className="error-state" role="alert">
                <p>
                  {language === "he"
                    ? "לא הצלחנו לטעון את המוצרים כרגע."
                    : "We couldn't load the products right now."}
                </p>
                <button type="button" className="btn" onClick={refetch}>
                  {language === "he" ? "נסה שוב" : "Try Again"}
                </button>
              </div>
            ) : visibleProducts.length > 0 ? (
              <div className="products-grid">
                {visibleProducts.map((product) => {
                  const name = productName(product, language);
                  const lowStock = lowStockLabel(product, language);
                  return (
                    <div
                      key={product.id}
                      className="product-card"
                      {...clickableProps(
                        () => openProduct(product),
                        language === "he" ? `צפייה בפרטי ${name}` : `View ${name}`,
                      )}
                    >
                      {product.featured && (
                        <div className="best-seller-badge">
                          {language === "he" ? "נמכר ביותר" : "BEST SELLER"}
                        </div>
                      )}
                      {lowStock && <div className="low-stock-badge">{lowStock}</div>}
                      <img
                        src={productImage(product)}
                        alt={name}
                        className="product-image"
                        loading="lazy"
                        decoding="async"
                        onError={handleImageError}
                      />
                      <div className="product-info">
                        <h3>{name}</h3>
                        {renderQuote(product)}
                        <div className="product-price">{renderPrice(product)}</div>
                        <button
                          type="button"
                          className="quick-add-btn"
                          onClick={(e) => handleQuickAdd(e, product)}
                          aria-label={
                            productRequiresOptions(product)
                              ? language === "he"
                                ? `בחירת אפשרויות עבור ${name}`
                                : `Choose options for ${name}`
                              : language === "he"
                                ? `הוסף ${name} לעגלה`
                                : `Add ${name} to cart`
                          }
                        >
                          {productRequiresOptions(product)
                            ? language === "he"
                              ? "בחירה והוספה לעגלה"
                              : "Choose Options"
                            : language === "he"
                              ? "הוספה מהירה לעגלה"
                              : "Quick Add to Cart"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-products">
                <p>
                  {searchTerm
                    ? language === "he"
                      ? `לא נמצאו מוצרים עבור "${searchTerm}"`
                      : `No products match "${searchTerm}"`
                    : t("noProducts")}
                </p>
                {(searchTerm || selectedCollection !== ALL || zodiacFilter) && (
                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      setSearchTerm("");
                      updateParams({ category: null, zodiac: null });
                    }}
                  >
                    {language === "he" ? "הצגת כל המוצרים" : "Show all products"}
                  </button>
                )}
              </div>
            )}
          </section>
        </div>
      </div>

      {selectedProduct && (
        <ProductModal
          key={selectedProduct.id}
          product={selectedProduct}
          onClose={closeProduct}
        />
      )}
    </div>
  );
}

export default Shop;
