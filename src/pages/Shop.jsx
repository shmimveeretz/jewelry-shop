import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/pages/Shop.css";
import ProductModal from "../components/ProductModal";
import { useProducts } from "../hooks/useProducts";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../contexts/LanguageContext";
import { productMatchesZodiac } from "../utils/zodiacFilter";

// Calculate the min and max possible price for a product given its priceAdditions
function getProductPriceRange(product) {
  const base = product.price || 0;
  const additions = product.priceAdditions;
  if (!additions) return { min: base, max: base };

  let maxAddition = 0;
  for (const category of Object.values(additions)) {
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

function isLowStock(product) {
  return (
    typeof product.stock === "number" &&
    product.stock > 0 &&
    product.stock <= 3
  );
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ALL_COLLECTION = {
  id: "הכל",
  nameHe: "הכל",
  nameEn: "All",
  image:
    "https://res.cloudinary.com/dhayarvh3/image/upload/v1771152721/AboutBG.jpg",
  descriptionHe: "מסע מבראשית דרך שמים וארץ ומה שביניהם",
  descriptionEn:
    "A journey from Genesis through Heaven and Earth and what lies between",
};

function Shop() {
  const { t, language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart, openCartDrawer } = useCart();
  const { showCartToast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState("הכל");
  const [zodiacFilter, setZodiacFilter] = useState(null);
  const [apiCategories, setApiCategories] = useState([]);

  // Handle category / zodiac filters from URL or navigation state
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get("category");
    const zodiacParam = params.get("zodiac");

    if (zodiacParam) {
      setZodiacFilter(zodiacParam);
      setSelectedCollection("הכל");
      return;
    }

    if (location.state?.zodiacFilter) {
      const sign = location.state.zodiacFilter;
      setZodiacFilter(sign);
      setSelectedCollection("הכל");
      navigate(`/shop?zodiac=${encodeURIComponent(sign)}`, {
        replace: true,
        state: null,
      });
      return;
    }

    setZodiacFilter(null);
    if (categoryParam === "שילת") {
      navigate(`/shop?category=${encodeURIComponent("סמלי בני ישראל")}`, {
        replace: true,
      });
      return;
    }
    if (categoryParam) {
      setSelectedCollection(categoryParam);
    }
  }, [location.search, location.state, navigate]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/categories`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setApiCategories(data.data || []);
      })
      .catch(() => {});
  }, []);

  // Auto-open a product modal when navigated with an openProductId
  // (e.g. from the cart-drawer cross-sell for products that need options)
  const openProductId = location.state?.openProductId;

  const collections = [
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
  ];

  // Preload main collection image
  useEffect(() => {
    const img = new Image();
    const currentCollection = collections.find(
      (col) => col.id === selectedCollection,
    );
    if (currentCollection?.image) {
      img.src = currentCollection.image;
    }
  }, [selectedCollection, collections]);

  // Use the custom hook to fetch products from Firebase
  const apiFilters = {
    category: selectedCollection !== "הכל" ? selectedCollection : undefined,
  };

  const { products, loading, error } = useProducts(apiFilters);

  useEffect(() => {
    if (!openProductId || products.length === 0) return;
    const productToOpen = products.find((p) => p.id === openProductId);
    if (productToOpen) {
      setSelectedProduct(productToOpen);
      navigate(location.pathname + location.search, {
        replace: true,
        state: null,
      });
    }
  }, [openProductId, products, navigate, location.pathname, location.search]);

  const STAR_DISPLAY_ORDER = [
    "maadim",
    "venus",
    "kochav-chama",
    "yareach",
    "shemesh",
    "tzedek",
    "saturn",
  ];

  const filteredProducts = [...products]
    .filter((product) => productMatchesZodiac(product, zodiacFilter))
    .sort((a, b) => {
      if (a.id === "letter-chain") return -1;
      if (b.id === "letter-chain") return 1;

      if (selectedCollection === "אותיות עבריות") {
        if (a.letter && b.letter) {
          return a.letter.localeCompare(b.letter, "he");
        }
        return (a.gematria ?? 9999) - (b.gematria ?? 9999);
      }

      if (selectedCollection === "כוכבים") {
        const ai = STAR_DISPLAY_ORDER.indexOf(a.id);
        const bi = STAR_DISPLAY_ORDER.indexOf(b.id);
        const aOrder = ai === -1 ? (a.sortOrder ?? 999) : ai;
        const bOrder = bi === -1 ? (b.sortOrder ?? 999) : bi;
        return aOrder - bOrder;
      }

      return 0;
    });

  const clearZodiacFilter = () => {
    setZodiacFilter(null);
    navigate("/shop", { replace: true });
  };

  // Quick Add: option-free products go straight to the cart; products that
  // need a metal/length/type choice open the options modal instead.
  const handleQuickAdd = (e, product) => {
    e.stopPropagation();

    if (productRequiresOptions(product)) {
      setSelectedProduct(product);
      return;
    }

    // Mirror the cart-item shape built by ProductModal so dedupe keys match
    const cartItem = {
      ...product,
      basePrice: product.price,
      selectedOptions: {},
      selections: {},
      cartItemId: `${product.id}__${JSON.stringify({})}`,
    };
    addToCart(cartItem, 1);

    const displayName =
      language === "en" && product.nameEn ? product.nameEn : product.name;
    showCartToast(
      language === "en"
        ? `${displayName} added to cart!`
        : `${displayName} נוסף לעגלה!`,
      Array.isArray(product.images) ? product.images[0] : product.image,
    );
    openCartDrawer?.();
  };

  const handleCollectionChange = (collectionId) => {
    setSelectedCollection(collectionId);
    if (zodiacFilter) {
      setZodiacFilter(null);
      if (collectionId === "הכל") {
        navigate("/shop", { replace: true });
      } else {
        navigate(`/shop?category=${encodeURIComponent(collectionId)}`, {
          replace: true,
        });
      }
    }
  };

  // Get current collection data
  const currentCollection = collections.find(
    (col) => col.id === selectedCollection,
  );

  return (
    <div className="shop">
      <div className="container">
        {/* Category Hero Section */}
        {currentCollection && (
          <div className="category-hero">
            <div className="category-hero-image">
              <img
                src={currentCollection.image}
                alt={currentCollection.name}
                loading="lazy"
                onError={(e) => {
                  e.target.src =
                    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&h=400&fit=crop";
                }}
              />
              <div className="category-hero-overlay"></div>
            </div>
            <div className="category-hero-content">
              <h2>{currentCollection.name}</h2>
              {currentCollection.description && (
                <p className="hero-quote">
                  <em>"{currentCollection.description}"</em>
                  {currentCollection.source && (
                    <span className="hero-quote-source">
                      {" "}
                      — {currentCollection.source}
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="shop-content">
          {/* Products Grid */}
          <section className="products-section">
            {/* Collection Menu */}
            <div className="products-header">
              {/* Collection Filter Menu */}
              <div className="collection-filter">
                {collections.map((collection) => (
                  <button
                    key={collection.id}
                    className={`collection-btn ${
                      selectedCollection === collection.id ? "active" : ""
                    }`}
                    onClick={() => handleCollectionChange(collection.id)}
                  >
                    <span>{collection.name}</span>
                  </button>
                ))}
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

            {loading ? (
              <div className="loading-state">
                <p>{t("loading")}</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <p>{error}</p>
                <button
                  className="btn"
                  onClick={() => window.location.reload()}
                >
                  {language === "he" ? "נסה שוב" : "Try Again"}
                </button>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="products-grid">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="product-card"
                    onClick={() => setSelectedProduct(product)}
                    style={{ cursor: "pointer" }}
                  >
                    {product.featured && (
                      <div className="best-seller-badge">
                        {language === "he" ? "נמכר ביותר" : "BEST SELLER"}
                      </div>
                    )}
                    {isLowStock(product) && (
                      <div className="low-stock-badge">
                        {language === "he"
                          ? product.stock === 1
                            ? "נותר אחרון במלאי"
                            : `נותרו רק ${product.stock} במלאי`
                          : product.stock === 1
                            ? "LAST ONE LEFT"
                            : `ONLY ${product.stock} LEFT`}
                      </div>
                    )}
                    <img
                      src={
                        Array.isArray(product.images) &&
                        product.images.length > 0
                          ? product.images[0]
                          : "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&h=300&fit=crop"
                      }
                      alt={product.name}
                      className="product-image"
                      loading="lazy"
                      onError={(e) => {
                        console.warn(
                          `⚠️ Image failed to load for ${product.name}:`,
                          product.images?.[0],
                        );
                        e.target.src =
                          "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&h=300&fit=crop";
                      }}
                      onLoad={() => {
                        console.log(
                          `✅ Image loaded for ${product.name}:`,
                          product.images?.[0],
                        );
                      }}
                    />
                    <div className="product-info">
                      <h3>
                        {language === "en" && product.nameEn
                          ? product.nameEn
                          : product.name}
                      </h3>
                      {(product.category === "סמלי בני ישראל" ||
                        selectedCollection === "סמלי בני ישראל") &&
                        (language === "he"
                          ? product.quoteHe
                          : product.quoteEn || product.quoteHe) && (
                          <p className="product-card-quote">
                            <em>
                              "
                              {language === "he"
                                ? product.quoteHe
                                : product.quoteEn || product.quoteHe}
                              "
                            </em>
                            {(language === "he"
                              ? product.sourceHe
                              : product.sourceEn || product.sourceHe) && (
                              <span className="product-card-quote-source">
                                {" "}
                                —{" "}
                                {language === "he"
                                  ? product.sourceHe
                                  : product.sourceEn || product.sourceHe}
                              </span>
                            )}
                          </p>
                        )}
                      <div className="product-price">
                        {(() => {
                          const { min, max } = getProductPriceRange(product);
                          if (max > min) {
                            return (
                              <>
                                <span className="price-from">
                                  {language === "he" ? "החל מ-" : "From "}
                                </span>
                                {min.toLocaleString()} ₪
                              </>
                            );
                          }
                          return <>{min.toLocaleString()} ₪</>;
                        })()}
                      </div>
                      <button
                        type="button"
                        className="quick-add-btn"
                        onClick={(e) => handleQuickAdd(e, product)}
                        aria-label={
                          language === "he"
                            ? `הוסף ${product.name} לעגלה`
                            : `Add ${product.nameEn || product.name} to cart`
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
                ))}
              </div>
            ) : (
              <div className="no-products">
                <p>{t("noProducts")}</p>
              </div>
            )}
          </section>
        </div>
      </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}

export default Shop;
