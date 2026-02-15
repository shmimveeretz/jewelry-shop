import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../styles/pages/Shop.css";
import ProductModal from "../components/ProductModal";
import { useProducts } from "../hooks/useProducts";
import { useLanguage } from "../contexts/LanguageContext";

function Shop() {
  const { t, language } = useLanguage();
  const location = useLocation();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState("הכל");
  const [filters, setFilters] = useState({
    categories: [],
    metals: [],
    priceRange: "all",
  });

  // Handle zodiac filter from navigation
  useEffect(() => {
    if (location.state?.zodiacFilter) {
      setSelectedCollection("תליוני מזלות");
    }
  }, [location.state]);

  // Preload main collection image
  useEffect(() => {
    const img = new Image();
    const currentCollection = collections.find(
      (col) => col.id === selectedCollection,
    );
    if (currentCollection?.image) {
      img.src = currentCollection.image;
    }
  }, [selectedCollection]);

  // Use the custom hook to fetch products from Firebase
  const apiFilters = {
    category: selectedCollection !== "הכל" ? selectedCollection : undefined,
    minPrice:
      filters.priceRange === "medium"
        ? 500
        : filters.priceRange === "high"
          ? 1000
          : undefined,
    maxPrice:
      filters.priceRange === "low"
        ? 500
        : filters.priceRange === "medium"
          ? 1000
          : undefined,
  };

  const { products, loading, error } = useProducts(apiFilters);

  // Debug: Log products when they load
  useEffect(() => {
    if (products.length > 0) {
      console.log("📦 Products loaded from API:", products);
      console.log("🖼️ First product structure:", {
        name: products[0]?.name,
        images: products[0]?.images,
        firstImage: Array.isArray(products[0]?.images) ? products[0]?.images[0] : "No images",
      });
    }
  }, [products]);

  const collections = [
    {
      id: "הכל",
      name: language === "he" ? "הכל" : "All",
      image:
        "https://res.cloudinary.com/dhayarvh3/image/upload/v1771152040/EverythingBG.jpg",
      description:
        language === "he"
          ? "מסע קסום אל עולם הרוחניות היהודית - תכשיטים ייחודיים המשלבים קדושה עתיקה עם עיצוב עכשווי. כל תכשיט נושא בחובו משמעות עמוקה וכוח אנרגטי מיוחד"
          : "A magical journey into the world of Jewish spirituality - Unique jewelry combining ancient holiness with contemporary design. Each piece carries deep meaning and special energetic power",
    },
    {
      id: "אותיות עבריות",
      name: language === "he" ? "כתב עברי קדום" : "Ancient Hebrew Script",
      image:
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=400&fit=crop",
      description:
        language === "he"
          ? "בכתב העברי הקדום זורם אורו של הבורא בימי ממלכת ישראל המאוחדת"
          : "In the ancient Hebrew script flows the light of the Creator in the days of the united Kingdom of Israel",
    },
    {
      id: "אבני חושן",
      name: language === "he" ? "אבני חושן" : "Hoshen Stones",
      image:
        "https://images.unsplash.com/photo-1611652022419-a9419f74343a?w=800&h=400&fit=crop",
      description:
        language === "he"
          ? "וְהָאֲבָנִים תִּהְיֶינָה עַל שְׁמוֹת בְּנֵי יִשְׂרָאֵל, שְׁתֵּים־עֶשְׂרֵה עַל שְׁמוֹתָם, פִּתּוּחֵי חֹתָם, אִישׁ עַל שְׁמוֹ, לִשְׁנֵי עָשָׂר שָׁבֶט"
          : "And the stones shall be upon the names of the sons of Israel, twelve according to their names, engraved like signets, each one with his name, for the twelve tribes",
    },
    {
      id: "תליוני מזלות",
      name: language === "he" ? "תליוני מזלות" : "Zodiac Pendants",
      image:
        "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=800&h=600&fit=crop",
      description:
        language === "he"
          ? "בִּדְבַ֣ר יְ֭הֹוָה שָׁמַ֣יִם נַעֲשׂ֑וּ וּבְר֥וּחַ פִּ֝֗יו כׇּל־צְבָאָֽם"
          : "By the word of the LORD the heavens were made, and by the breath of His mouth all their host",
    },
    {
      id: "כוכבים",
      name: language === "he" ? "כוכבים" : "Stars",
      image:
        "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&h=400&fit=crop",
      description:
        language === "he"
          ? "וַיַּעַשׂ אֱלֹהִים אֶת שְׁנֵי הַמְּאֹרֹת הַגְּדֹלִים— אֶת הַמָּאוֹר הַגָּדֹל לְמֶמְשֶׁלֶת הַיּוֹם, וְאֶת הַמָּאוֹר הַקָּטֹן לְמֶמְשֶׁלֶת הַלַּיְלָה, וְאֵת הַכּוֹכָבִים"
          : "And God made the two great lights—the greater light to govern the day and the lesser light to govern the night—and the stars",
    },
  ];

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => {
      if (filterType === "priceRange") {
        return { ...prev, priceRange: value };
      }

      const currentFilters = prev[filterType];
      const newFilters = currentFilters.includes(value)
        ? currentFilters.filter((item) => item !== value)
        : [...currentFilters, value];

      return { ...prev, [filterType]: newFilters };
    });
  };

  const filteredProducts = products.filter((product) => {
    // Filter by collection first
    if (
      selectedCollection !== "הכל" &&
      product.category !== selectedCollection
    ) {
      return false;
    }

    if (
      filters.categories.length > 0 &&
      !filters.categories.includes(product.category)
    ) {
      return false;
    }

    if (
      filters.metals.length > 0 &&
      !filters.metals.some((metal) => product.metals.includes(metal))
    ) {
      return false;
    }

    if (filters.priceRange !== "all") {
      if (filters.priceRange === "low" && product.price > 500) return false;
      if (
        filters.priceRange === "medium" &&
        (product.price < 500 || product.price > 1000)
      )
        return false;
      if (filters.priceRange === "high" && product.price < 1000) return false;
    }

    return true;
  });

  // Get current collection data
  const currentCollection = collections.find(
    (col) => col.id === selectedCollection,
  );

  return (
    <div className="shop">
      <div className="container">
        <div className="shop-header">
          <h1>{language === "he" ? "החנות שלנו" : "Our Shop"}</h1>
          <p>
            {language === "he"
              ? "גלה את מגוון התכשיטים היהודיים המיוחדים שלנו - קולקציית שמיים וארץ"
              : "Discover our special collection of Jewish jewelry - Heaven and Earth Collection"}
          </p>
        </div>

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
              <p>{currentCollection.description}</p>
            </div>
          </div>
        )}

        <div className="shop-content">
          {/* Filters Sidebar */}
          <aside className="shop-filters">
            <h3>{t("filters")}</h3>

            <div className="filter-group">
              <h4>{t("category")}</h4>
              <label>
                <input
                  type="checkbox"
                  checked={filters.categories.includes("אותיות עבריות")}
                  onChange={() =>
                    handleFilterChange("categories", "אותיות עבריות")
                  }
                />
                {language === "he" ? "כתב עברי קדום" : "Ancient Hebrew Script"}
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={filters.categories.includes("אבני חושן")}
                  onChange={() => handleFilterChange("categories", "אבני חושן")}
                />
                {language === "he" ? "אבני חושן" : "Hoshen Stones"}
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={filters.categories.includes("תליוני מזלות")}
                  onChange={() =>
                    handleFilterChange("categories", "תליוני מזלות")
                  }
                />
                {language === "he" ? "תליוני מזלות" : "Zodiac Pendants"}
              </label>
            </div>

            <div className="filter-group">
              <h4>{t("metalType")}</h4>
              <label>
                <input
                  type="checkbox"
                  checked={filters.metals.includes("זהב")}
                  onChange={() => handleFilterChange("metals", "זהב")}
                />
                {language === "he" ? "זהב" : "Gold"}
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={filters.metals.includes("כסף")}
                  onChange={() => handleFilterChange("metals", "כסף")}
                />
                {language === "he" ? "כסף" : "Silver"}
              </label>
            </div>

            <div className="filter-group">
              <h4>{t("priceRange")}</h4>
              <label>
                <input
                  type="radio"
                  name="priceRange"
                  checked={filters.priceRange === "all"}
                  onChange={() => handleFilterChange("priceRange", "all")}
                />
                {t("all")}
              </label>
              <label>
                <input
                  type="radio"
                  name="priceRange"
                  checked={filters.priceRange === "low"}
                  onChange={() => handleFilterChange("priceRange", "low")}
                />
                {t("lowPrice")}
              </label>
              <label>
                <input
                  type="radio"
                  name="priceRange"
                  checked={filters.priceRange === "medium"}
                  onChange={() => handleFilterChange("priceRange", "medium")}
                />
                {t("mediumPrice")}
              </label>
              <label>
                <input
                  type="radio"
                  name="priceRange"
                  checked={filters.priceRange === "high"}
                  onChange={() => handleFilterChange("priceRange", "high")}
                />
                {t("highPrice")}
              </label>
            </div>
          </aside>

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
                        Array.isArray(product.images)
                          ? product.images[0]
                          : product.image || "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&h=300&fit=crop"
                      }
                      alt={product.name}
                      className="product-image"
                      loading="lazy"
                      onError={(e) => {
                        console.warn(`⚠️ Image failed to load for ${product.name}:`, 
                          Array.isArray(product.images) ? product.images[0] : product.image);
                        e.target.src = "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&h=300&fit=crop";
                      }}
                      onLoad={() => {
                        console.log(`✅ Image loaded for ${product.name}:`, 
                          Array.isArray(product.images) ? product.images[0] : product.image);
                      }}
                    />
                    <div className="product-info">
                      <h3>
                        {language === "en" && product.nameEn
                          ? product.nameEn
                          : product.name}
                      </h3>
                      <div className="product-price">{product.price} ₪</div>
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
