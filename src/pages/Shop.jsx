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

  const collections = [
    {
      id: "הכל",
      name: language === "he" ? "הכל" : "All",
      image:
        "https://res.cloudinary.com/dhayarvh3/image/upload/v1771152721/AboutBG.jpg",
      description:
        language === "he"
          ? "מסע מבראשית דרך שמים וארץ ומה שביניהם"
          : "A journey from Genesis through Heaven and Earth and what lies between",
    },
    {
      id: "אותיות עבריות",
      name: language === "he" ? "כתב עברי קדום" : "Ancient Hebrew Script",
      image:
        "https://res.cloudinary.com/dhayarvh3/image/upload/v1771407399/Ancient_Hebrew.jpg",
      description:
        language === "he"
          ? "בכתב העברי הקדום זורם אורו של הבורא בימי ממלכת ישראל המאוחדת"
          : "In the ancient Hebrew script flows the light of the Creator in the days of the united Kingdom of Israel",
    },
    {
      id: "אבני חושן",
      name: language === "he" ? "אבני חושן" : "Hoshen Stones",
      image:
        "https://res.cloudinary.com/dhayarvh3/image/upload/v1771410296/Hoshen_Stones.jpg",
      description:
        language === "he"
          ? "וְהָאֲבָנִים תִּהְיֶינָה עַל שְׁמוֹת בְּנֵי יִשְׂרָאֵל, שְׁתֵּים־עֶשְׂרֵה עַל שְׁמוֹתָם, פִּתּוּחֵי חֹתָם, אִישׁ עַל שְׁמוֹ, לִשְׁנֵי עָשָׂר שָׁבֶט"
          : "And the stones shall be upon the names of the sons of Israel, twelve according to their names, engraved like signets, each one with his name, for the twelve tribes",
    },
    {
      id: "תליוני מזלות",
      name: language === "he" ? "תליוני מזלות" : "Zodiac Pendants",
      image:
        "https://res.cloudinary.com/dhayarvh3/image/upload/v1771410086/Zodiac_Pendants.jpg",
      description:
        language === "he"
          ? "בִּדְבַ֣ר יְ֭הֹוָה שָׁמַ֣יִם נַעֲשׂ֑וּ וּבְר֥וּחַ פִּ֝֗יו כׇּל־צְבָאָֽם"
          : "By the word of the LORD the heavens were made, and by the breath of His mouth all their host",
    },
    {
      id: "כוכבים",
      name: language === "he" ? "כוכבים" : "Planets",
      image:
        "https://res.cloudinary.com/dhayarvh3/image/upload/v1771410177/Planets.jpg",
      description:
        language === "he"
          ? "וַיַּעַשׂ אֱלֹהִים אֶת שְׁנֵי הַמְּאֹרֹת הַגְּדֹלִים— אֶת הַמָּאוֹר הַגָּדֹל לְמֶמְשֶׁלֶת הַיּוֹם, וְאֶת הַמָּאוֹר הַקָּטֹן לְמֶמְשֶׁלֶת הַלַּיְלָה, וְאֵת הַכּוֹכָבִים"
          : "And God made the two great lights—the greater light to govern the day and the lesser light to govern the night—and the stars",
    },
    {
      id: "מזל, אבן חושן וכוכב",
      name: language === "he" ? "מזל, אבן חושן וכוכב" : "Trinity Pendants",
      image:
        "https://res.cloudinary.com/dhayarvh3/image/upload/v1771406947/Trinity.jpg",
      description:
        language === "he"
          ? "וַיַּעַשׂ אֱלֹהִים אֶת שְׁנֵי הַמְּאֹרֹת הַגְּדֹלִים— אֶת הַמָּאוֹר הַגָּדֹל לְמֶמְשֶׁלֶת הַיּוֹם, וְאֶת הַמָּאוֹר הַקָּטֹן לְמֶמְשֶׁלֶת הַלַּיְלָה, וְאֵת הַכּוֹכָבִים"
          : "And God made the two great lights—the greater light to govern the day and the lesser light to govern the night—and the stars",
    },
  ];

  const handleFilterChange = (filterType, value) => {
    setSelectedCollection(value);
  };

  const filteredProducts = products;

  // Get current collection data
  const currentCollection = collections.find(
    (col) => col.id === selectedCollection,
  );

  return (
    <div className="shop">
      <div className="container">
        <div className="shop-header">
          <h1>{language === "he" ? "החנות שלנו" : "Our Shop"}</h1>
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
