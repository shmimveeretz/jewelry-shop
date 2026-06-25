import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../styles/pages/Shop.css";
import ProductModal from "../components/ProductModal";
import { useProducts } from "../hooks/useProducts";
import { useLanguage } from "../contexts/LanguageContext";

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
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState("הכל");
  const [apiCategories, setApiCategories] = useState([]);

  // Handle category filter from URL query params or navigation state
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get("category");
    if (categoryParam) {
      setSelectedCollection(categoryParam);
    } else if (location.state?.zodiacFilter) {
      setSelectedCollection("תליוני מזלות");
    }
  }, [location.search, location.state]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/categories`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setApiCategories(data.data || []);
      })
      .catch(() => {});
  }, []);

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

  // Debug: Log products when they load
  useEffect(() => {
    if (products.length > 0) {
      console.log("📦 Products loaded from API:", products);
      console.log("🖼️ First product structure:", {
        name: products[0]?.name,
        images: products[0]?.images,
        firstImage: Array.isArray(products[0]?.images)
          ? products[0]?.images[0]
          : "No images",
      });
    }
  }, [products]);

  const filteredProducts = [...products].sort((a, b) => {
    if (a.id === "letter-chain") return -1;
    if (b.id === "letter-chain") return 1;
    return 0;
  });

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
                    onClick={() => setSelectedCollection(collection.id)}
                  >
                    <span>{collection.name}</span>
                  </button>
                ))}
              </div>
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
