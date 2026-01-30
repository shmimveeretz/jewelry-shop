import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../contexts/LanguageContext";
import "../styles/components/ProductModal.css";

function ProductModal({ product, onClose }) {
  const { t, language } = useLanguage();
  const { addToCart } = useCart();
  const { showCartToast } = useToast();
  const [selectedOptions, setSelectedOptions] = useState({
    length: "",
    metalType: "כסף 925",
    chainType: "",
    waxColor: "",
  });

  const [showWarning, setShowWarning] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Support both single image and images array
  const productImages = product.images || [product.image];
  const currentImage = productImages[currentImageIndex];

  // const waxColors = [
  //   { name: "שחור", hex: "#000000" },
  //   { name: "חום", hex: "#8B4513" },
  //   { name: "אדום", hex: "#DC143C" },
  //   { name: "כחול", hex: "#1E90FF" },
  //   { name: "ירוק", hex: "#228B22" },
  //   { name: "סגול", hex: "#9370DB" },
  //   { name: "כתום", hex: "#FF8C00" },
  //   { name: "ורוד", hex: "#FF69B4" },
  // ];

  // Price additions for different options
  // Can be overridden by product-specific priceAdditions
  const defaultPriceAdditions = {
    metalType: {
      "זהב 14 קראט": 3800,
      "כסף 925": 0,
      "ציפוי זהב": 50,
    },
    length: {
      40: 0,
      42: 0,
      45: 0,
      50: 0,
    },
  };

  // Use product-specific price additions if available, otherwise use defaults
  const priceAdditions = product.priceAdditions || defaultPriceAdditions;

  // Calculate total price based on selections
  const calculateTotalPrice = () => {
    let totalPrice = product.price;

    if (selectedOptions.chainType) {
      totalPrice += priceAdditions.chainType[selectedOptions.chainType] || 0;
    }

    if (selectedOptions.metalType) {
      totalPrice += priceAdditions.metalType[selectedOptions.metalType] || 0;
    }

    if (selectedOptions.length) {
      totalPrice += priceAdditions.length[selectedOptions.length] || 0;
    }

    return totalPrice;
  };

  useEffect(() => {
    // Reset wax color when chain type changes
    if (selectedOptions.chainType !== "חוט שעווה") {
      setSelectedOptions((prev) => ({ ...prev, waxColor: "" }));
    }
  }, [selectedOptions.chainType]);

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
      selectedOptions: {
        length: selectedOptions.length,
        metalType: selectedOptions.metalType,
        chainType: selectedOptions.chainType,
        waxColor: selectedOptions.waxColor || null,
      },
    };

    addToCart(productWithOptions, 1);
    showCartToast(`${product.name} נוסף לעגלה!`, productImages[0]);
    onClose();
  };

  const isAddToCartDisabled = () => {
    const { length, metalType } = selectedOptions;

    if (!length || !metalType) {
      return true;
    }

    return false;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

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
                        prev === 0 ? productImages.length - 1 : prev - 1
                      )
                    }
                    aria-label="תמונה קודמת"
                  >
                    ‹
                  </button>
                  <button
                    className="gallery-nav next"
                    onClick={() =>
                      setCurrentImageIndex((prev) =>
                        prev === productImages.length - 1 ? 0 : prev + 1
                      )
                    }
                    aria-label="תמונה הבאה"
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
            <div className="product-modal-category">
              {language === "en" && product.categoryEn
                ? product.categoryEn
                : product.category}
            </div>
            <h2>
              {language === "en" && product.nameEn
                ? product.nameEn
                : product.name}
            </h2>
            <p className="product-modal-description">
              {language === "en" && product.descriptionEn
                ? product.descriptionEn
                : product.description}
            </p>

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
                    <strong>{language === "he" ? "יסוד:" : "Element:"}</strong>{" "}
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

            <div className="product-modal-price">{calculateTotalPrice()} ₪</div>

            {/* Price breakdown if there are additions */}
            {calculateTotalPrice() > product.price && (
              <div className="price-breakdown">
                <div className="price-item">
                  <span>מחיר בסיס:</span>
                  <span>{product.price} ₪</span>
                </div>
                {selectedOptions.metalType &&
                  priceAdditions.metalType[selectedOptions.metalType] > 0 && (
                    <div className="price-item addition">
                      <span>תוספת {selectedOptions.metalType}:</span>
                      <span>
                        +{priceAdditions.metalType[selectedOptions.metalType]} ₪
                      </span>
                    </div>
                  )}
                {selectedOptions.chainType &&
                  priceAdditions.chainType[selectedOptions.chainType] > 0 && (
                    <div className="price-item addition">
                      <span>תוספת {selectedOptions.chainType}:</span>
                      <span>
                        +{priceAdditions.chainType[selectedOptions.chainType]} ₪
                      </span>
                    </div>
                  )}
                {selectedOptions.length &&
                  priceAdditions.length[selectedOptions.length] > 0 && (
                    <div className="price-item addition">
                      <span>תוספת אורך {selectedOptions.length} מ״מ:</span>
                      <span>
                        +{priceAdditions.length[selectedOptions.length]} ₪
                      </span>
                    </div>
                  )}
                <div className="price-item total">
                  <span>סה״כ:</span>
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
              {/* Length Selection */}
              <div className="product-option">
                <label>
                  <span className="required">*</span>
                  {language === "he"
                    ? "אורך השרשרת (ס״מ)"
                    : "Chain Length (cm)"}
                </label>
                <select
                  value={selectedOptions.length}
                  onChange={(e) => handleOptionChange("length", e.target.value)}
                >
                  <option value="">
                    {language === "he" ? "בחר אורך" : "Select Length"}
                  </option>
                  <option value="40">40 ס״מ</option>
                  <option value="42">42 ס״מ</option>
                  <option value="45">45 ס״מ</option>
                  <option value="50">50 ס״מ</option>
                </select>
              </div>

              {/* Metal Type Selection */}
              <div className="product-option">
                <label>
                  <span className="required">*</span>
                  {language === "he" ? "סוג מתכת" : "Metal Type"}
                </label>
                <select
                  value={selectedOptions.metalType}
                  onChange={(e) =>
                    handleOptionChange("metalType", e.target.value)
                  }
                >
                  <option value="">
                    {language === "he" ? "בחר סוג מתכת" : "Select Metal Type"}
                  </option>
                  <option value="זהב 14 קראט">
                    {language === "he" ? "זהב 14 קראט" : "Gold 14K"}
                  </option>
                  <option value="כסף 925">
                    {language === "he" ? "כסף 925" : "Silver 925"}
                  </option>
                  <option value="ציפוי זהב">
                    {language === "he" ? "ציפוי זהב" : "Gold Plated"}
                  </option>
                </select>
              </div>

              {/* Chain Type Selection - Commented out for now */}
              {/* 
              <div className="product-option">
                <label>
                  <span className="required">*</span>
                  {language === "he" ? "סוג שרשרת" : "Chain Type"}
                </label>
                <select
                  value={selectedOptions.chainType}
                  onChange={(e) =>
                    handleOptionChange("chainType", e.target.value)
                  }
                >
                  <option value="">
                    {language === "he" ? "בחר סוג שרשרת" : "Select Chain Type"}
                  </option>
                  <option value="חוט שעווה">
                    {language === "he" ? "חוט שעווה" : "Wax Thread"}
                  </option>
                  <option value="שרשרת זהב">
                    {language === "he" ? "שרשרת זהב" : "Gold Chain"}
                  </option>
                  <option value="שרשרת כסף">
                    {language === "he" ? "שרשרת כסף" : "Silver Chain"}
                  </option>
                </select>
              </div>
              */}

              {/* Wax Color Selection - Only shown when wax thread is selected */}
              {/* 
              {selectedOptions.chainType === "חוט שעווה" && (
                <div className="product-option">
                  <label>
                    <span className="required">*</span>
                    {language === "he"
                      ? "בחר צבע חוט שעווה"
                      : "Select Wax Thread Color"}
                  </label>
                  <div className="color-options">
                    {waxColors.map((color) => (
                      <button
                        key={color.name}
                        className={`color-option ${
                          selectedOptions.waxColor === color.name
                            ? "selected"
                            : ""
                        }`}
                        style={{ backgroundColor: color.hex }}
                        onClick={() =>
                          handleOptionChange("waxColor", color.name)
                        }
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              )}
              */}
            </div>

            <div className="add-to-cart-section">
              <button className="btn add-to-cart-btn" onClick={handleAddToCart}>
                {language === "he"
                  ? `הוסף לעגלה - ${calculateTotalPrice()} ₪`
                  : `Add to Cart - ₪${calculateTotalPrice()}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductModal;
