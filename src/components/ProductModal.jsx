import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../contexts/LanguageContext";
import "../styles/components/ProductModal.css";

function ProductModal({ product, onClose }) {
  const { t, language } = useLanguage();
  const { addToCart } = useCart();
  const { showCartToast } = useToast();

  const displayCategory =
    language === "en"
      ? product.categoryEn || product.category
      : product.category;

  const displayDescription =
    language === "en"
      ? product.descriptionEn || product.description
      : product.description;

  // Use product-specific price additions from DB
  const priceAdditions = product.priceAdditions || {};

  const [selectedOptions, setSelectedOptions] = useState(
    Object.fromEntries(Object.keys(priceAdditions).map((key) => [key, ""])),
  );

  const [showWarning, setShowWarning] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Support both single image and images array
  const productImages = product.images || [product.image];
  const currentImage = productImages[currentImageIndex];

  // const waxColors = [
  //   { "name": "שחור", hex: "#000000" },
  //   { "name": "חום", hex: "#8B4513" },
  //   { "name": "אדום", hex: "#DC143C" },
  //   { "name": "כחול", hex: "#1E90FF" },
  //   { "name": "ירוק", hex: "#228B22" },
  //   { "name": "סגול", hex: "#9370DB" },
  //   { "name": "כתום", hex: "#FF8C00" },
  //   { "name": "ורוד", hex: "#FF69B4" },
  // ];

  // Calculate total price based on selections
  const calculateTotalPrice = () => {
    let totalPrice = product.price;
    for (const key of Object.keys(selectedOptions)) {
      const selected = selectedOptions[key];
      if (selected && priceAdditions[key]) {
        totalPrice += priceAdditions[key][selected] || 0;
      }
    }
    return totalPrice;
  };

  const handleOptionChange = (optionName, value) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }));
    setShowWarning(false);
  };

  const handleAddToCart = () => {
    // Calculate final price with additions
    const finalPrice = calculateTotalPrice();

    // Create product with selected options and final price
    const productWithOptions = {
      ...product,
      price: finalPrice,
      basePrice: product.price,
      selectedOptions: { ...selectedOptions },
    };

    addToCart(productWithOptions, 1);
    const displayName =
      language === "en" && product.nameEn ? product.nameEn : product.name;
    showCartToast(
      language === "en"
        ? `${displayName} added to cart!`
        : `${displayName} נוסף לעגלה!`,
      productImages[0],
    );
    onClose();
  };

  const isAddToCartDisabled = () => {
    return Object.entries(priceAdditions).some(
      ([key, options]) =>
        Object.keys(options).length > 0 && !selectedOptions[key],
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-drag-handle">
          <div className="modal-drag-handle-pill"></div>
        </div>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="modal-scroll-area">
          <div className="product-modal-grid">
            <div className="product-image-gallery">
              <div className="main-image-container">
                <img
                  src={currentImage}
                  alt={product.name}
                  className="product-modal-image"
                />
                {productImages.length > 1 && (
                  <>
                    <button
                      className="gallery-nav prev"
                      onClick={() =>
                        setCurrentImageIndex((prev) =>
                          prev === 0 ? productImages.length - 1 : prev - 1,
                        )
                      }
                      aria-label={
                        language === "en" ? "Previous image" : "תמונה קודמת"
                      }
                    >
                      ‹
                    </button>
                    <button
                      className="gallery-nav next"
                      onClick={() =>
                        setCurrentImageIndex((prev) =>
                          prev === productImages.length - 1 ? 0 : prev + 1,
                        )
                      }
                      aria-label={
                        language === "en" ? "Next image" : "תמונה הבאה"
                      }
                    >
                      ›
                    </button>
                  </>
                )}
              </div>
              {productImages.length > 1 && (
                <div className="thumbnail-container">
                  {productImages.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      className={`thumbnail ${
                        index === currentImageIndex ? "active" : ""
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="product-modal-details">
              <div className="product-modal-category">{displayCategory}</div>
              <h2>
                {language === "en" && product.nameEn
                  ? product.nameEn
                  : product.name}
              </h2>
              <p className="product-modal-description">{displayDescription}</p>

              {/* Special info for zodiac pendants */}
              {product.category === "תליוני מזלות" && (
                <div className="zodiac-info">
                  {product.zodiacSign && (
                    <p>
                      <strong>{language === "he" ? "מזל:" : "Zodiac:"}</strong>{" "}
                      {language === "en" && product.zodiacSignEn
                        ? product.zodiacSignEn
                        : product.zodiacSign}{" "}
                      {product.symbol}
                    </p>
                  )}
                  {product.tribe && (
                    <p>
                      <strong>{language === "he" ? "שבט:" : "Tribe:"}</strong>{" "}
                      {language === "en" && product.tribeEn
                        ? product.tribeEn
                        : product.tribe}
                    </p>
                  )}
                  {product.stone && (
                    <p>
                      <strong>
                        {language === "he" ? "אבן חושן:" : "Hoshen Stone:"}
                      </strong>{" "}
                      {language === "en" && product.stoneEn
                        ? product.stoneEn
                        : product.stone}
                    </p>
                  )}
                  {product.element && (
                    <p>
                      <strong>
                        {language === "he" ? "יסוד:" : "Element:"}
                      </strong>{" "}
                      {language === "en" && product.elementEn
                        ? product.elementEn
                        : product.element}
                    </p>
                  )}
                  {product.planet && (
                    <p>
                      <strong>{language === "he" ? "כוכב:" : "Planet:"}</strong>{" "}
                      {language === "en" && product.planetEn
                        ? product.planetEn
                        : product.planet}
                    </p>
                  )}
                  {product.meaningHe && (
                    <p>
                      <strong>
                        {language === "he" ? "משמעות:" : "Meaning:"}
                      </strong>{" "}
                      {language === "en" && product.meaningEn
                        ? product.meaningEn
                        : product.meaningHe}
                    </p>
                  )}
                </div>
              )}

              {/* Special info for Hebrew letters */}
              {product.category === "אותיות עבריות" && product.letter && (
                <div className="letter-info">
                  <p>
                    <strong>{language === "he" ? "האות:" : "Letter:"}</strong>{" "}
                    {product.letter}
                  </p>
                  {product.gematria && (
                    <p>
                      <strong>
                        {language === "he" ? "גימטריה:" : "Gematria:"}
                      </strong>{" "}
                      {product.gematria}
                    </p>
                  )}
                  {product.meaningHe && (
                    <p>
                      <strong>
                        {language === "he" ? "משמעות:" : "Meaning:"}
                      </strong>{" "}
                      {language === "en" && product.meaningEn
                        ? product.meaningEn
                        : product.meaningHe}
                    </p>
                  )}
                </div>
              )}

              {/* Special info for Trinity Pendants */}
              {product.category === "שלישיות מיוחדות" && (
                <div className="zodiac-info">
                  {product.zodiacSign && (
                    <p>
                      <strong>{language === "he" ? "מזל:" : "Zodiac:"}</strong>{" "}
                      {language === "en" && product.zodiacSignEn
                        ? product.zodiacSignEn
                        : product.zodiacSign}
                    </p>
                  )}
                  {product.stone && (
                    <p>
                      <strong>
                        {language === "he" ? "אבן חושן:" : "Hoshen Stone:"}
                      </strong>{" "}
                      {language === "en" && product.stoneEn
                        ? product.stoneEn
                        : product.stone}
                    </p>
                  )}
                  {product.tribe && (
                    <p>
                      <strong>{language === "he" ? "שבט:" : "Tribe:"}</strong>{" "}
                      {language === "en" && product.tribeEn
                        ? product.tribeEn
                        : product.tribe}
                    </p>
                  )}
                  {product.planet && (
                    <p>
                      <strong>{language === "he" ? "כוכב:" : "Planet:"}</strong>{" "}
                      {language === "en" && product.planetEn
                        ? product.planetEn
                        : product.planet}
                    </p>
                  )}
                  {product.element && (
                    <p>
                      <strong>
                        {language === "he" ? "יסוד:" : "Element:"}
                      </strong>{" "}
                      {language === "en" && product.elementEn
                        ? product.elementEn
                        : product.element}
                    </p>
                  )}
                  {product.meaningHe && (
                    <p>
                      <strong>
                        {language === "he" ? "משמעות:" : "Meaning:"}
                      </strong>{" "}
                      {language === "en" && product.meaningEn
                        ? product.meaningEn
                        : product.meaningHe}
                    </p>
                  )}
                </div>
              )}

              {/* Special info for Hoshen stones */}
              {product.category === "אבני חושן" && (
                <div className="hoshen-info">
                  {product.tribe && (
                    <p>
                      <strong>{language === "he" ? "שבט:" : "Tribe:"}</strong>{" "}
                      {language === "en" && product.tribeEn
                        ? product.tribeEn
                        : product.tribe}
                    </p>
                  )}
                  {product.stoneName && (
                    <p>
                      <strong>{language === "he" ? "אבן:" : "Stone:"}</strong>{" "}
                      {language === "en" && product.stoneNameEn
                        ? product.stoneNameEn
                        : product.stoneName}
                    </p>
                  )}
                  {product.meaningHe && (
                    <p>
                      <strong>
                        {language === "he" ? "משמעות:" : "Meaning:"}
                      </strong>{" "}
                      {language === "en" && product.meaningEn
                        ? product.meaningEn
                        : product.meaningHe}
                    </p>
                  )}
                </div>
              )}

              <div className="product-modal-price">
                {calculateTotalPrice()} ₪
              </div>

              {/* Price breakdown if there are additions */}
              {calculateTotalPrice() > product.price && (
                <div className="price-breakdown">
                  <div className="price-item">
                    <span>
                      {language === "en" ? "Base price:" : "מחיר בסיס:"}
                    </span>
                    <span>{product.price} ₪</span>
                  </div>
                  {Object.entries(priceAdditions).map(([key, options]) => {
                    const selected = selectedOptions[key];
                    const addition = selected ? options[selected] : null;
                    if (!addition || addition <= 0) return null;
                    return (
                      <div key={key} className="price-item addition">
                        <span>
                          {language === "en"
                            ? `${key} addition:`
                            : `תוספת ${key}:`}
                        </span>
                        <span>+{addition} ₪</span>
                      </div>
                    );
                  })}
                  <div className="price-item total">
                    <span>{language === "en" ? "Total:" : "סה״כ:"}</span>
                    <span>{calculateTotalPrice()} ₪</span>
                  </div>
                </div>
              )}

              {showWarning && (
                <div className="selection-warning">
                  ⚠️{" "}
                  {language === "he"
                    ? "יש לבחור את כל המאפיינים הנדרשים לפני הוספה לעגלה"
                    : "Please select all required options before adding to cart"}
                </div>
              )}

              <div className="product-options">
                {Object.entries(priceAdditions).map(([key, options]) =>
                  Object.keys(options).length === 0 ? null : (
                    <div key={key} className="product-option">
                      <label>
                        <span className="required">*</span>
                        {key}
                      </label>
                      <select
                        value={selectedOptions[key] ?? ""}
                        onChange={(e) =>
                          handleOptionChange(key, e.target.value)
                        }
                      >
                        <option value="">
                          {language === "he" ? `בחר ${key}` : `Select ${key}`}
                        </option>
                        {Object.entries(options).map(([optKey, optValue]) => (
                          <option key={optKey} value={optKey}>
                            {optKey}
                            {optValue > 0 ? ` (+${optValue} ₪)` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  ),
                )}
              </div>

              <div className="shipping-note">
                {language === "he"
                  ? "זמן אספקה: עד 14 ימי עסקים"
                  : "Delivery time: up to 14 business days"}
              </div>
            </div>
          </div>
        </div>
        <div className="modal-sticky-footer">
          <button className="btn add-to-cart-btn" onClick={handleAddToCart}>
            {language === "he"
              ? `הוסף לעגלה — ${calculateTotalPrice()} ₪`
              : `Add to Cart — ₪${calculateTotalPrice()}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductModal;
