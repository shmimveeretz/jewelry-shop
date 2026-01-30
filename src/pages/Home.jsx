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
        <div className="hero-content">
          <h1>
            {language === "he"
              ? '"בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ"'
              : '"In the beginning God created the heavens and the earth"'}
          </h1>
          <p>{language === "he" ? "בראשית א', א'" : "Genesis 1:1"}</p>
        </div>
      </section>

      {/* Featured Collections - Top 4 Best Sellers */}
      <section className="featured-collections">
        <div className="container">
          <h2 className="section-title">
            {language === "he"
              ? "המוצרים הנמכרים ביותר"
              : "Best Selling Products"}
          </h2>

          {loading ? (
            <div className="loading-state">
              <p>
                {language === "he" ? "טוען מוצרים..." : "Loading products..."}
              </p>
            </div>
          ) : (
            <div className="collections-grid">
              {topProducts.map((product) => (
                <div
                  key={product.id}
                  className="collection-card"
                  onClick={() => setSelectedProduct(product)}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={product.images ? product.images[0] : product.image}
                    alt={product.name}
                    className="collection-image"
                  />
                  <div className="collection-info">
                    <h3>
                      {language === "en" && product.nameEn
                        ? product.nameEn
                        : product.name}
                    </h3>
                    <div className="price">{product.price} ₪</div>
                    <span className="btn btn-secondary">
                      {language === "he" ? "צפה בפרטים" : "View Details"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <Link to="/shop" className="btn">
              {language === "he" ? "לכל המוצרים בחנות" : "View All Products"}
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-choose-us">
        <div className="container">
          <h2 className="section-title">{t("whyChooseUs")}</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>{t("zodiacTitle")}</h2>
          <p>{t("zodiacSubtitle")}</p>
          <Link to="/zodiac" className="btn">
            {t("findYourSign")}
          </Link>
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
