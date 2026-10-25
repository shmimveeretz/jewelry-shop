import { Link } from "react-router-dom";
import { useState } from "react";
import {
  FaHandSparkles,
  FaShieldAlt,
  FaShippingFast,
  FaScroll,
  FaGift,
} from "react-icons/fa";
import { useLanguage } from "../contexts/LanguageContext";
import { useProducts } from "../hooks/useProducts";
import ProductModal from "../components/ProductModal";
import { formatPrice, productName, productImage, handleImageError, sizedImage } from "../utils/format";
import { clickableProps } from "../utils/a11y";
import "../styles/pages/Home.css";

function lowStockLabel(stock, language) {
  if (!(typeof stock === "number" && stock > 0 && stock <= 3)) return null;
  if (language === "he") {
    return stock === 1 ? "נותר אחרון במלאי" : `נותרו רק ${stock} במלאי`;
  }
  return stock === 1 ? "LAST ONE LEFT" : `ONLY ${stock} LEFT`;
}

function HomeProductCard({ product, language, badge, onOpen }) {
  const name = productName(product, language);
  const lowStock = lowStockLabel(product.stock, language);
  return (
    <div
      className="collection-card"
      {...clickableProps(
        () => onOpen(product),
        language === "he" ? `צפייה בפרטי ${name}` : `View ${name}`,
      )}
    >
      {badge && <div className="best-seller-badge">{badge}</div>}
      {lowStock && <div className="low-stock-badge">{lowStock}</div>}
      <div className="collection-image-wrap">
        <img
          src={sizedImage(productImage(product), 400)}
          alt={name}
          className="collection-image"
          loading="lazy"
          decoding="async"
          onError={handleImageError}
        />
        <div className="card-hover-overlay" aria-hidden="true">
          <span className="card-overlay-btn">
            {language === "he" ? "צפה בפרטים" : "View Details"}
          </span>
        </div>
      </div>
      <div className="collection-info">
        <h3>{name}</h3>
        <div className="price">{formatPrice(product.price, language)}</div>
      </div>
    </div>
  );
}

function Home() {
  const { language } = useLanguage();
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Fetch admin-selected best sellers for the home page
  const { products: featuredProducts, loading } = useProducts({
    featured: true,
    limit: 4,
  });
  const { products: allProducts } = useProducts();
  const topProducts = featuredProducts.slice(0, 4);

  // Get Trinity Pendants (filter by product category slug)
  const trinityProducts = allProducts
    .filter((product) => product.category === "שלישיות מיוחדות")
    .slice(0, 4);

  // "Choose by meaning": four doors into the collection, each pictured with a
  // real piece from it (an admin-featured one when there is one)
  const pathImage = (category) =>
    (allProducts.find((p) => p.category === category && p.featured) ||
      allProducts.find((p) => p.category === category)) ?? null;

  const paths = [
    {
      key: "letters",
      category: "אותיות עבריות",
      to: `/shop?category=${encodeURIComponent("אותיות עבריות")}`,
      title: language === "he" ? "אות עברית" : "A Hebrew letter",
      text:
        language === "he"
          ? "אות מהאלף־בית, לבד או בשרשרת אותיות אישית"
          : "A single letter, or your own chain of letters",
    },
    {
      key: "zodiac",
      category: "תליוני מזלות",
      to: "/zodiac",
      title: language === "he" ? "המזל שלכם" : "Your sign",
      text:
        language === "he"
          ? "לפי המזל או החודש העברי, בגלגל המזלות"
          : "By zodiac sign or Hebrew month, on the zodiac wheel",
    },
    {
      key: "stones",
      category: "אבני חושן",
      to: `/shop?category=${encodeURIComponent("אבני חושן")}`,
      title: language === "he" ? "אבן חושן" : "A Hoshen stone",
      text:
        language === "he"
          ? "שתים־עשרה אבני החושן, אבן לכל שבט"
          : "The twelve stones of the breastplate, one for each tribe",
    },
    {
      key: "symbols",
      category: "סמלי בני ישראל",
      to: `/shop?category=${encodeURIComponent("סמלי בני ישראל")}`,
      title: language === "he" ? "סמל" : "A symbol",
      text:
        language === "he"
          ? "חי, מגן דוד, נבל ועוד סמלים שליוו את עם ישראל"
          : "Chai, Star of David, harp and more symbols of Israel",
    },
  ];

  // Three concrete commitments, each one true of every order today
  const promises = [
    {
      icon: <FaHandSparkles />,
      title: language === "he" ? "נוצר בהזמנה אישית" : "Made to order",
      description:
        language === "he"
          ? "כל תכשיט מוכן במיוחד בשבילכם ונשלח תוך עד 14 ימי עסקים."
          : "Each piece is made for you and ships within 14 business days.",
    },
    {
      icon: <FaScroll />,
      title: language === "he" ? "סמל עם מקור" : "A symbol with a source",
      description:
        language === "he"
          ? "כל קולקציה מתחילה ממקור: אות, פסוק או מסורת, ולכל תכשיט מוסבר מה הוא מסמל."
          : "Every collection starts from a source: a letter, a verse or a tradition, and each piece explains what it stands for.",
    },
    {
      icon: <FaGift />,
      title: language === "he" ? "ליווי עד הבית" : "With you to the door",
      description:
        language === "he"
          ? "משלוח עם מספר מעקב, אריזת מתנה לבחירה, אחריות 12 חודשים ומענה אישי בוואטסאפ."
          : "Tracked delivery, optional gift wrapping, a 12-month warranty and personal WhatsApp support.",
    },
  ];

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-overlay" />

        <div className="hero-content">
          {/* The verse is the brand's signature, kept small above the promise */}
          <p className="hero-verse">
            {language === "he"
              ? "״בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ״"
              : "“In the beginning God created the heavens and the earth”"}
            <span className="hero-verse-source">
              {language === "he" ? "בראשית א׳, א׳" : "Genesis 1:1"}
            </span>
          </p>
          <h1>
            {language === "he"
              ? "תכשיטים שנושאים סיפור עברי קרוב ללב"
              : "Jewelry that carries a Hebrew story close to the heart"}
          </h1>
          <p className="hero-value-prop">
            {language === "he"
              ? "אותיות, מזלות וסמלים עתיקים, בעבודת יד, כתכשיט אישי לחיים של היום."
              : "Letters, zodiac signs and ancient symbols, handmade as personal jewelry for today."}
          </p>
          <div className="hero-cta-row">
            <Link to="/shop" className="hero-btn-primary">
              {language === "he" ? "לגלות את הקולקציה" : "Discover the collection"}
            </Link>
            <Link to="/zodiac" className="hero-btn-ghost">
              {language === "he" ? "למצוא את הסמל שלי" : "Find my symbol"}
            </Link>
          </div>
          <div className="hero-trust-strip">
            <span>
              <FaHandSparkles />
              {language === "he" ? "בעבודת יד, בהזמנה אישית" : "Handmade to order"}
            </span>
            <span>
              <FaShippingFast />
              {language === "he" ? "משלוח חינם מעל ₪300" : "Free shipping over ₪300"}
            </span>
            <span>
              <FaShieldAlt />
              {language === "he" ? "אחריות 12 חודשים" : "12-month warranty"}
            </span>
          </div>
        </div>

        <div className="hero-scroll-indicator">
          <span className="hero-scroll-text">
            {language === "he" ? "גלו עוד" : "Discover"}
          </span>
          <span className="material-symbols-outlined" aria-hidden="true">
            keyboard_double_arrow_down
          </span>
        </div>

        <div className="hero-mizrach" aria-hidden="true">
          <div className="mizrach-line" />
          <span className="mizrach-label">
            {language === "he" ? "מזרח" : "EAST"}
          </span>
          <div className="mizrach-line" />
        </div>
      </section>

      {/* Choose by meaning */}
      <section className="paths-section">
        <div className="container">
          <div className="section-header centered">
            <h2 className="section-title">
              {language === "he" ? "בחרו לפי משמעות" : "Choose by meaning"}
            </h2>
            <p className="section-subtitle">
              {language === "he"
                ? "ארבע דרכים להגיע לתכשיט שמתאים לכם"
                : "Four ways to the piece that's yours"}
            </p>
          </div>
          <div className="paths-grid">
            {paths.map((path) => {
              const product = pathImage(path.category);
              return (
                <Link key={path.key} to={path.to} className="path-card">
                  <div className="path-image">
                    {product && (
                      <img
                        src={sizedImage(productImage(product), 360)}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        onError={handleImageError}
                      />
                    )}
                  </div>
                  <div className="path-body">
                    <h3>{path.title}</h3>
                    <p>{path.text}</p>
                  </div>
                </Link>
              );
            })}
          </div>
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
                ? "התכשיטים שהכי הרבה לקוחות בחרו לאחרונה"
                : "The pieces our customers choose most"}
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
                <HomeProductCard
                  key={product.id}
                  product={product}
                  language={language}
                  onOpen={setSelectedProduct}
                  badge={
                    index === 0
                      ? language === "he"
                        ? "נמכר ביותר"
                        : "BEST SELLER"
                      : null
                  }
                />
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
                  ? "כוכב, מזל ואבן חושן"
                  : "Star, Zodiac & Hoshen Stone"}
              </h2>
              <p className="section-subtitle">
                {language === "he"
                  ? "מזלות, חושן וכוכב — הסמלים המלווים את העם היהודי לדורותיו"
                  : "Zodiac, Hoshen & Star — symbols guiding the Jewish people through the generations"}
              </p>
            </div>

            <div className="collections-grid">
              {trinityProducts.map((product) => (
                <HomeProductCard
                  key={product.id}
                  product={product}
                  language={language}
                  onOpen={setSelectedProduct}
                />
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

      {/* Proof and service */}
      <section className="why-choose-us">
        <div className="container">
          <h2 className="section-title">
            {language === "he" ? "מה מקבלים איתנו" : "What comes with every piece"}
          </h2>
          <div className="features-grid features-grid--three">
            {promises.map((promise, index) => (
              <div
                key={promise.title}
                className="feature-card"
                style={{ "--stagger": `${index * 0.12}s` }}
              >
                <div className="feature-icon-wrap">
                  <div className="feature-icon">{promise.icon}</div>
                </div>
                <h3>{promise.title}</h3>
                <p>{promise.description}</p>
              </div>
            ))}
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
