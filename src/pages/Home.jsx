import { Link } from "react-router-dom";
import { useState } from "react";
import {
  FaGem,
  FaPalette,
  FaStar as FaStarSolid,
  FaShippingFast,
} from "react-icons/fa";
import { useLanguage } from "../contexts/LanguageContext";
import { useProducts } from "../hooks/useProducts";
import ProductModal from "../components/ProductModal";
import "../styles/pages/Home.css";

function Home() {
  const { t, language } = useLanguage();
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Fetch top 4 best-selling products
  const { products, loading } = useProducts();
  const topProducts = products.slice(0, 4);

  // Get Trinity Pendants
  const trinityProducts = products
    .filter(
      (product) =>
        product.category === "מזל, אבן חושן וכוכב" ||
        product.category === "Trinity Pendants",
    )
    .slice(0, 4);

  const features = [
    {
      icon: <FaGem />,
      title: language === "he" ? "איכות פרימיום" : "Premium Quality",
      description:
        language === "he"
          ? "כל התכשיטים שלנו עשויים מחומרים איכותיים ביותר"
          : "All our jewelry is made from the highest quality materials",
    },
    {
      icon: <FaPalette />,
      title: language === "he" ? "עיצוב ייחודי" : "Unique Design",
      description:
        language === "he"
          ? "עיצובים מקוריים שמשלבים מסורת ומודרניות"
          : "Original designs that combine tradition and modernity",
    },
    {
      icon: <FaStarSolid />,
      title: language === "he" ? "מסורת יהודית" : "Jewish Tradition",
      description:
        language === "he"
          ? "תכשיטים עם משמעות רוחנית ותרבותית עמוקה"
          : "Jewelry with deep spiritual and cultural meaning",
    },
    {
      icon: <FaShippingFast />,
      title: language === "he" ? "משלוח מהיר" : "Fast Shipping",
      description:
        language === "he"
          ? "משלוח מהיר ומאובטח לכל רחבי הארץ"
          : "Fast and secure shipping throughout the country",
    },
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-overlay" />

        <div className="hero-content">
          <h1>
            {language === "he"
              ? '"בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ"'
              : '"In the beginning God created the heavens and the earth"'}
          </h1>
          <p className="hero-source">
            {language === "he" ? "בראשית א', א'" : "Genesis 1:1"}
          </p>
          <div className="hero-cta-row">
            <Link to="/shop" className="hero-btn-primary">
              {language === "he" ? "לרכישה" : "Shop Now"}
            </Link>
            <Link to="/about" className="hero-btn-ghost">
              {language === "he" ? "הסיפור שלנו" : "Our Story"}
            </Link>
          </div>
        </div>

        <div className="hero-scroll-indicator">
          <span className="hero-scroll-text">
            {language === "he" ? "גלו עוד" : "Discover"}
          </span>
          <span className="material-symbols-outlined">
            keyboard_double_arrow_down
          </span>
        </div>

        <div className="hero-mizrach">
          <div className="mizrach-line" />
          <span className="mizrach-label">
            {language === "he" ? "מזרח" : "EAST"}
          </span>
          <div className="mizrach-line" />
        </div>
      </section>

      {/* Featured Collections - Top 4 Best Sellers */}
      <section className="featured-collections">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              {language === "he"
                ? "המוצרים הנמכרים ביותר"
                : "Best Selling Products"}
            </h2>
            <p className="section-subtitle">
              {language === "he"
                ? "חיבור נצחי בין רוח לחומר, מעוצב בזהב"
                : "An eternal connection between spirit and matter, crafted in gold"}
            </p>
          </div>

          {loading ? (
            <div className="collections-grid">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-img shimmer" />
                  <div className="skeleton-body">
                    <div className="skeleton-line shimmer" />
                    <div className="skeleton-line short shimmer" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="collections-grid">
              {topProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="collection-card"
                  onClick={() => setSelectedProduct(product)}
                  style={{ cursor: "pointer" }}
                >
                  {index === 0 && (
                    <div className="best-seller-badge">
                      {language === "he" ? "נמכר ביותר" : "BEST SELLER"}
                    </div>
                  )}
                  <div className="collection-image-wrap">
                    <img
                      src={
                        Array.isArray(product.images)
                          ? product.images[0]
                          : product.image ||
                            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&h=300&fit=crop"
                      }
                      alt={product.name}
                      className="collection-image"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&h=300&fit=crop";
                      }}
                    />
                    <div className="card-hover-overlay">
                      <span className="card-overlay-btn">
                        {language === "he" ? "צפה בפרטים" : "View Details"}
                      </span>
                    </div>
                  </div>
                  <div className="collection-info">
                    <h3>
                      {language === "en" && product.nameEn
                        ? product.nameEn
                        : product.name}
                    </h3>
                    <div className="price">{product.price} ₪</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="section-action">
            <Link to="/shop" className="btn">
              {language === "he" ? "לכל המוצרים בחנות" : "View All Products"}
            </Link>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* Trinity Pendants Section */}
      {trinityProducts.length > 0 && (
        <section className="featured-collections trinity-section">
          <div className="container">
            <div className="section-header centered">
              <h2 className="section-title">
                {language === "he"
                  ? "תכשיטי השלישיות - מזל, אבן חושן וכוכב"
                  : "Trinity Pendants - Zodiac, Hoshen & Star"}
              </h2>
              <p className="section-subtitle">
                {language === "he"
                  ? "מזלות, חושן ומגן דוד - הסמלים המלווים את העם היהודי לדורותיו"
                  : "Zodiac, Hoshen & Star — symbols guiding the Jewish people through the generations"}
              </p>
            </div>

            <div className="collections-grid">
              {trinityProducts.map((product) => (
                <div
                  key={product.id}
                  className="collection-card"
                  onClick={() => setSelectedProduct(product)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="collection-image-wrap">
                    <img
                      src={
                        Array.isArray(product.images)
                          ? product.images[0]
                          : product.image ||
                            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&h=300&fit=crop"
                      }
                      alt={product.name}
                      className="collection-image"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&h=300&fit=crop";
                      }}
                    />
                    <div className="card-hover-overlay">
                      <span className="card-overlay-btn">
                        {language === "he" ? "צפה בפרטים" : "View Details"}
                      </span>
                    </div>
                  </div>
                  <div className="collection-info">
                    <h3>
                      {language === "en" && product.nameEn
                        ? product.nameEn
                        : product.name}
                    </h3>
                    <div className="price">{product.price} ₪</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="section-action">
              <Link to="/shop" className="btn">
                {language === "he" ? "לכל המוצרים בחנות" : "View All Products"}
              </Link>
            </div>
          </div>
        </section>
      )}

      <div className="section-divider" />

      {/* Why Choose Us */}
      <section className="why-choose-us">
        <div className="container">
          <h2 className="section-title">{t("whyChooseUs")}</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div
                key={index}
                className="feature-card"
                style={{ "--stagger": `${index * 0.15}s` }}
              >
                <div className="feature-icon-wrap">
                  <div className="feature-icon">{feature.icon}</div>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-inner">
            <div className="cta-accent-border" />
            <div className="cta-content">
              <h2>{t("zodiacTitle")}</h2>
              <p>{t("zodiacSubtitle")}</p>
              <Link to="/zodiac" className="cta-btn">
                {t("findYourSign")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}

export default Home;
