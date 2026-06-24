import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../contexts/LanguageContext";
import {
  MEASUREMENTS_IMAGE_URL,
  isBraceletJewelryType,
  isNecklaceJewelryType,
  getLengthOptions,
  getLengthAddition,
} from "../data/productSizes";
import { parseExtraHebrewLetters, getExtraLetterPerBraceletCost } from "../utils/extraHebrewLetters";
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

  // Only initialise selectedOptions for keys whose value is an object (i.e. option groups).
  // Numeric keys like extraLetterForBracelet are not selectors.
  const optionKeys = Object.keys(priceAdditions).filter(
    (key) =>
      typeof priceAdditions[key] === "object" && priceAdditions[key] !== null,
  );

  const isHebrewLetters = product.category === "אותיות עבריות";

  const [selectedOptions, setSelectedOptions] = useState(
    Object.fromEntries(optionKeys.map((key) => [key, ""])),
  );

  // Extra letters for bracelet (array of individual letter strings)
  const [extraLetters, setExtraLetters] = useState([]);
  const [extraLettersInput, setExtraLettersInput] = useState("");

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

  const calculateTotalPrice = () => {
    let totalPrice = product.price;
    for (const key of optionKeys) {
      if (key === "length" || key === "jewelryType") continue;
      const selected = selectedOptions[key];
      if (selected && priceAdditions[key]) {
        totalPrice += priceAdditions[key][selected] || 0;
      }
    }
    if (selectedOptions.jewelryType && priceAdditions.jewelryType) {
      totalPrice +=
        priceAdditions.jewelryType[selectedOptions.jewelryType] || 0;
    }
    totalPrice += getLengthAddition(
      priceAdditions,
      selectedOptions.jewelryType,
      selectedOptions.length,
      isHebrewLetters,
    );
    if (
      isBraceletJewelryType(selectedOptions.jewelryType) &&
      extraLetters.length > 0
    ) {
      const perLetterCost = getExtraLetterPerBraceletCost(
        priceAdditions,
        selectedOptions.metalType,
      );
      if (perLetterCost > 0) {
        totalPrice += extraLetters.length * perLetterCost;
      }
    }
    return totalPrice;
  };

  const handleOptionChange = (optionName, value) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
      // Reset length when jewelry type changes — each type has different sizes
      ...(optionName === "jewelryType" ? { length: "" } : {}),
    }));
    // Clear extra letters when switching away from bracelet
    if (optionName === "jewelryType" && !isBraceletJewelryType(value)) {
      setExtraLetters([]);
      setExtraLettersInput("");
    }
    setShowWarning(false);
  };

  const handleExtraLettersChange = (e) => {
    const raw = e.target.value;
    setExtraLettersInput(raw);
    setExtraLetters(parseExtraHebrewLetters(raw));
  };

  const handleAddToCart = () => {
    // Require all option selectors to be filled
    if (isAddToCartDisabled()) {
      setShowWarning(true);
      return;
    }

    const finalPrice = calculateTotalPrice();

    // Build the API-contract selections object.
    // jewelryType and extraLetters are only relevant for Hebrew Letters.
    const selections = {};
    if (selectedOptions.metalType)
      selections.metalType = selectedOptions.metalType;
    if (selectedOptions.length) selections.length = selectedOptions.length;
    if (isHebrewLetters) {
      if (selectedOptions.jewelryType)
        selections.jewelryType = selectedOptions.jewelryType;
      selections.extraLetters =
        isBraceletJewelryType(selectedOptions.jewelryType)
          ? extraLetters
          : [];
    }

    // Cart item: full product data for display + selections for the backend
    const cartItemId = `${product.id}__${JSON.stringify(selections)}`;
    const productWithOptions = {
      ...product,
      price: finalPrice,
      basePrice: product.price,
      selectedOptions: { ...selectedOptions },
      selections,
      cartItemId,
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
    if (isHebrewLetters) {
      // Step 1: jewelry type is mandatory
      if (!selectedOptions.jewelryType) return true;
      // Metal type mandatory if present
      if (
        priceAdditions?.metalType &&
        Object.keys(priceAdditions.metalType).length > 0 &&
        !selectedOptions.metalType
      )
        return true;
      // Length mandatory when length selector is shown
      if (showLengthOptions && !selectedOptions.length) return true;
      return false;
    }
    // Standard check for all other categories (excludes jewelryType key)
    return optionKeys
      .filter((key) => key !== "jewelryType")
      .some(
        (key) =>
          Object.keys(priceAdditions[key]).length > 0 && !selectedOptions[key],
      );
  };

  const hasMetalOptions =
    priceAdditions?.metalType &&
    Object.keys(priceAdditions.metalType).length > 0;
  const metalReady = !hasMetalOptions || Boolean(selectedOptions.metalType);

  const lengthOptions = getLengthOptions(
    priceAdditions,
    selectedOptions.jewelryType,
    isHebrewLetters,
  );

  const showLengthOptions = isHebrewLetters
    ? Boolean(
        selectedOptions.jewelryType &&
          selectedOptions.jewelryType !== "טבעת" &&
          (isNecklaceJewelryType(selectedOptions.jewelryType) ||
            isBraceletJewelryType(selectedOptions.jewelryType)),
      )
    : Boolean(
        priceAdditions?.length &&
          Object.keys(priceAdditions.length).length > 0 &&
          metalReady,
      );

  const extraLetterPerBraceletCost = getExtraLetterPerBraceletCost(
    priceAdditions,
    selectedOptions.metalType,
  );

  const measurementsGuide = showLengthOptions ? (
    <>
      <p className="measurements-guide__title">
        {language === "he"
          ? "מדריך מידות — גברים ונשים"
          : "Size guide — men & women"}
      </p>
      <img
        src={MEASUREMENTS_IMAGE_URL}
        alt={
          language === "he"
            ? "מדריך אורכי שרשרת לגברים ונשים"
            : "Necklace length guide for men and women"
        }
        className="measurements-guide__img"
        loading="lazy"
      />
    </>
  ) : null;

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
              <div className="product-modal-header">
                <div className="product-modal-category">{displayCategory}</div>
                <h2>
                  {language === "en" && product.nameEn
                    ? product.nameEn
                    : product.name}
                </h2>
                <div className="product-modal-price">
                  {calculateTotalPrice()} ₪
                </div>
              </div>

              <div className="product-modal-selections">
                {showWarning && (
                  <div className="selection-warning">
                    ⚠️{" "}
                    {language === "he"
                      ? "יש לבחור את כל המאפיינים הנדרשים לפני הוספה לעגלה"
                      : "Please select all required options before adding to cart"}
                  </div>
                )}

                <div className="product-options">
                  {isHebrewLetters ? (
                    /* ── Hebrew Letters: enforced step-by-step flow ── */
                    <>
                      {/* Step 1: Jewelry Type — mandatory, shown as radio buttons */}
                      {priceAdditions?.jewelryType &&
                        Object.keys(priceAdditions.jewelryType).length > 0 && (
                          <div className="product-option">
                            <label>
                              <span className="required">*</span>
                              {language === "he" ? "סוג תכשיט" : "Jewelry Type"}
                            </label>
                            <div className="jewelry-type-radio-group">
                              {Object.entries(priceAdditions.jewelryType).map(
                                ([key, value]) => (
                                  <label
                                    key={key}
                                    className={`jewelry-type-radio${
                                      selectedOptions.jewelryType === key
                                        ? " selected"
                                        : ""
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      name="jewelryType"
                                      value={key}
                                      checked={
                                        selectedOptions.jewelryType === key
                                      }
                                      onChange={() =>
                                        handleOptionChange("jewelryType", key)
                                      }
                                    />
                                    <span>
                                      {key}
                                      {value > 0 ? ` (+${value} ₪)` : ""}
                                    </span>
                                  </label>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                      {/* Step 2: Metal Type — after jewelry type */}
                      {selectedOptions.jewelryType &&
                        priceAdditions?.metalType &&
                        Object.keys(priceAdditions.metalType).length > 0 && (
                          <div className="product-option">
                            <label>
                              <span className="required">*</span>
                              {language === "he" ? "סוג מתכת" : "Metal Type"}
                            </label>
                            <select
                              value={selectedOptions["metalType"] ?? ""}
                              onChange={(e) =>
                                handleOptionChange("metalType", e.target.value)
                              }
                            >
                              <option value="">
                                {language === "he"
                                  ? "בחר סוג מתכת"
                                  : "Select Metal Type"}
                              </option>
                              {Object.entries(priceAdditions.metalType).map(
                                ([key, value]) => (
                                  <option key={key} value={key}>
                                    {key}
                                    {value > 0 ? ` (+${value} ₪)` : ""}
                                  </option>
                                ),
                              )}
                            </select>
                          </div>
                        )}

                      {/* Step 3: Length — after jewelry type + metal */}
                      {showLengthOptions && (
                        <div className="product-option">
                          <label>
                            <span className="required">*</span>
                            {isBraceletJewelryType(selectedOptions.jewelryType)
                              ? language === "he"
                                ? "אורך צמיד (ס״מ)"
                                : "Bracelet length (cm)"
                              : language === "he"
                                ? "אורך שרשרת (ס״מ)"
                                : "Necklace length (cm)"}
                          </label>
                          <select
                            value={selectedOptions["length"] ?? ""}
                            onChange={(e) =>
                              handleOptionChange("length", e.target.value)
                            }
                          >
                            <option value="">
                              {language === "he" ? "בחר אורך" : "Select Length"}
                            </option>
                            {lengthOptions.map(({ size, price }) => (
                              <option key={size} value={size}>
                                {language === "en"
                                  ? `${size} cm`
                                  : `${size} ס״מ`}
                                {price > 0 ? ` (+${price} ₪)` : ""}
                              </option>
                            ))}
                          </select>
                          {isBraceletJewelryType(selectedOptions.jewelryType) && (
                            <p className="option-hint">
                              {language === "he"
                                ? "* הצמיד מגיע בשני סיבובים"
                                : "* The bracelet comes in two wraps"}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Extra Letters — only for Bracelet */}
                      {isBraceletJewelryType(selectedOptions.jewelryType) && (
                        <div className="product-option">
                          <label>
                            {language === "he"
                              ? `הוספת אותיות${
                                  extraLetterPerBraceletCost > 0
                                    ? ` (+${extraLetterPerBraceletCost} ₪ לאות)`
                                    : ""
                                }`
                              : `Add Extra Letters${
                                  extraLetterPerBraceletCost > 0
                                    ? ` (+${extraLetterPerBraceletCost} ₪ each)`
                                    : ""
                                }`}
                          </label>
                          <input
                            type="text"
                            className="extra-letters-input"
                            placeholder={
                              language === "he"
                                ? "לדוגמה: בגד או ב, ג, ד"
                                : "e.g. בגד or ב, ג, ד"
                            }
                            value={extraLettersInput}
                            onChange={handleExtraLettersChange}
                          />
                          <p className="option-hint">
                            {language === "he"
                              ? "כל אות נספרת בנפרד — רצף כמו «בג» ייחשב כשתי אותיות"
                              : "Each letter is counted separately — e.g. «בג» counts as two letters"}
                          </p>
                          {extraLetters.length > 0 && (
                            <div className="extra-letters-preview">
                              {extraLetters.map((letter, i) => (
                                <span key={i} className="letter-chip">
                                  {letter}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    /* ── Standard flow: metal → length ── */
                    <>
                      {priceAdditions?.metalType &&
                        Object.keys(priceAdditions.metalType).length > 0 && (
                          <div className="product-option">
                            <label>
                              <span className="required">*</span>
                              {language === "he" ? "סוג מתכת" : "Metal Type"}
                            </label>
                            <select
                              value={selectedOptions["metalType"] ?? ""}
                              onChange={(e) =>
                                handleOptionChange("metalType", e.target.value)
                              }
                            >
                              <option value="">
                                {language === "he"
                                  ? "בחר סוג מתכת"
                                  : "Select Metal Type"}
                              </option>
                              {Object.entries(priceAdditions.metalType).map(
                                ([key, value]) => (
                                  <option key={key} value={key}>
                                    {key}
                                    {value > 0 ? ` (+${value} ₪)` : ""}
                                  </option>
                                ),
                              )}
                            </select>
                          </div>
                        )}

                      {showLengthOptions && (
                        <div className="product-option">
                          <label>
                            <span className="required">*</span>
                            {language === "he"
                              ? "אורך שרשרת (ס״מ)"
                              : "Necklace Length (cm)"}
                          </label>
                          <select
                            value={selectedOptions["length"] ?? ""}
                            onChange={(e) =>
                              handleOptionChange("length", e.target.value)
                            }
                          >
                            <option value="">
                              {language === "he" ? "בחר אורך" : "Select Length"}
                            </option>
                            {lengthOptions.map(({ size, price }) => (
                              <option key={size} value={size}>
                                {language === "en"
                                  ? `${size} cm`
                                  : `${size} ס״מ`}
                                {price > 0 ? ` (+${price} ₪)` : ""}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {priceAdditions?.chain &&
                        Object.keys(priceAdditions.chain).length > 0 && (
                          <div className="product-option">
                            <label>
                              <span className="required">*</span>
                              {language === "he" ? "סוג שרשרת" : "Chain Type"}
                            </label>
                            <select
                              value={selectedOptions["chain"] ?? ""}
                              onChange={(e) =>
                                handleOptionChange("chain", e.target.value)
                              }
                            >
                              {Object.entries(priceAdditions.chain).map(
                                ([key, value]) => (
                                  <option key={key} value={key}>
                                    {key}
                                    {value > 0 ? ` (+${value} ₪)` : ""}
                                  </option>
                                ),
                              )}
                            </select>
                          </div>
                        )}
                    </>
                  )}
                </div>

                {measurementsGuide && (
                  <div className="measurements-guide measurements-guide--inline">
                    {measurementsGuide}
                  </div>
                )}

                {calculateTotalPrice() > product.price && (
                  <div className="price-breakdown">
                    <div className="price-item">
                      <span>
                        {language === "en" ? "Base price:" : "מחיר בסיס:"}
                      </span>
                      <span>{product.price} ₪</span>
                    </div>
                    {selectedOptions.jewelryType &&
                      priceAdditions.jewelryType?.[
                        selectedOptions.jewelryType
                      ] > 0 && (
                        <div className="price-item addition">
                          <span>
                            {language === "he" ? "סוג תכשיט:" : "Jewelry type:"}
                          </span>
                          <span>
                            +
                            {
                              priceAdditions.jewelryType[
                                selectedOptions.jewelryType
                              ]
                            }{" "}
                            ₪
                          </span>
                        </div>
                      )}
                    {selectedOptions.metalType &&
                      priceAdditions.metalType?.[selectedOptions.metalType] >
                        0 && (
                        <div className="price-item addition">
                          <span>{language === "he" ? "מתכת:" : "Metal:"}</span>
                          <span>
                            +
                            {
                              priceAdditions.metalType[
                                selectedOptions.metalType
                              ]
                            }{" "}
                            ₪
                          </span>
                        </div>
                      )}
                    {selectedOptions.length &&
                      getLengthAddition(
                        priceAdditions,
                        selectedOptions.jewelryType,
                        selectedOptions.length,
                        isHebrewLetters,
                      ) > 0 && (
                        <div className="price-item addition">
                          <span>{language === "he" ? "אורך:" : "Length:"}</span>
                          <span>
                            +
                            {getLengthAddition(
                              priceAdditions,
                              selectedOptions.jewelryType,
                              selectedOptions.length,
                              isHebrewLetters,
                            )}{" "}
                            ₪
                          </span>
                        </div>
                      )}
                    {isBraceletJewelryType(selectedOptions.jewelryType) &&
                      extraLetters.length > 0 &&
                      extraLetterPerBraceletCost > 0 && (
                        <div className="price-item addition">
                          <span>
                            {language === "en"
                              ? `Extra letters (×${extraLetters.length}):`
                              : `אותיות נוספות (×${extraLetters.length}):`}
                          </span>
                          <span>
                            +
                            {extraLetters.length * extraLetterPerBraceletCost}{" "}
                            ₪
                          </span>
                        </div>
                      )}
                    <div className="price-item total">
                      <span>{language === "en" ? "Total:" : "סה״כ:"}</span>
                      <span>{calculateTotalPrice()} ₪</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="product-modal-info">
                <p className="product-modal-description">
                  {displayDescription}
                </p>

                {product.category === "תליוני מזלות" && (
                  <div className="zodiac-info">
                    {product.zodiacSign && (
                      <p>
                        <strong>
                          {language === "he" ? "מזל:" : "Zodiac:"}
                        </strong>{" "}
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
                        <strong>
                          {language === "he" ? "כוכב:" : "Planet:"}
                        </strong>{" "}
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

                {product.category === "שלישיות מיוחדות" && (
                  <div className="zodiac-info">
                    {product.zodiacSign && (
                      <p>
                        <strong>
                          {language === "he" ? "מזל:" : "Zodiac:"}
                        </strong>{" "}
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
                        <strong>
                          {language === "he" ? "כוכב:" : "Planet:"}
                        </strong>{" "}
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

                <div className="shipping-note">
                  {language === "he"
                    ? "זמן אספקה: עד 14 ימי עסקים"
                    : "Delivery time: up to 14 business days"}
                </div>
              </div>
            </div>

            {measurementsGuide && (
              <div className="measurements-guide measurements-guide--wide">
                {measurementsGuide}
              </div>
            )}
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
