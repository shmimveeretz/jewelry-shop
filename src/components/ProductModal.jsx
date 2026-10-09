import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaLock,
  FaShippingFast,
  FaShieldAlt,
  FaShareAlt,
  FaExclamationCircle,
  FaTimes,
} from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../contexts/LanguageContext";
import {
  MEASUREMENTS_IMAGE_URL,
  isBraceletJewelryType,
  isNecklaceJewelryType,
  getLengthOptions,
  getLengthAddition,
  isLetterChainProduct,
  isHebrewLetterProduct,
  allowsExtraLetters,
} from "../data/productSizes";
import {
  getExtraLetterPerBraceletCost,
  isValidSingleHebrewLetter,
  MAX_EXTRA_LETTERS,
} from "../utils/extraHebrewLetters";
import {
  buildCartItem as buildProductCartItem,
  calculateProductPrice,
  getOptionKeys,
} from "../utils/productPricing";
import { formatPrice, productName, handleImageError, sizedImage } from "../utils/format";
import { useDialog } from "../hooks/useDialog";
import { useDragToDismiss } from "../hooks/useDragToDismiss";
import { trackEvent, productEventPayload } from "../utils/tracking";
import "../styles/components/ProductModal.css";

function ProductModal({ product, onClose }) {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { addToCart, openCartDrawer } = useCart();
  const { showCartToast, showSuccess } = useToast();
  // Play the exit animation, then let the parent unmount us
  const [closing, setClosing] = useState(false);
  const closeAnimated = () => {
    if (closing) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      onClose();
      return;
    }
    setClosing(true);
    window.setTimeout(onClose, 200);
  };
  const dialogRef = useDialog(true, closeAnimated);
  const overlayRef = useRef(null);
  // On phones the modal is a bottom sheet: pull it down to dismiss
  const [isSheet] = useState(
    () => window.matchMedia?.("(max-width: 768px)").matches ?? false,
  );
  useDragToDismiss({
    sheetRef: dialogRef,
    scrimRef: overlayRef,
    axis: "y",
    direction: 1,
    scrollSelector: ".modal-scroll-area",
    enabled: isSheet,
    onDismiss: onClose,
  });

  // Funnel: a product was viewed (once per opening)
  useEffect(() => {
    trackEvent("ViewContent", productEventPayload(product));
  }, [product]);
  const titleId = `product-modal-title-${product.id}`;

  // Every product has a shareable URL: /shop?product=<id> opens this modal.
  const handleShare = async () => {
    const url = `${window.location.origin}/shop?product=${encodeURIComponent(product.id)}`;
    const title = productName(product, language);
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      showSuccess(language === "he" ? "הקישור הועתק" : "Link copied");
    } catch {
      // Share sheet dismissed by the user — nothing to do
    }
  };

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
  const optionKeys = getOptionKeys(priceAdditions);

  const isHebrewLetters = isHebrewLetterProduct(product);
  const isLetterChain = isLetterChainProduct(product);
  const isSingleLetter = isHebrewLetters && !isLetterChain;

  const [selectedOptions, setSelectedOptions] = useState(
    Object.fromEntries(optionKeys.map((key) => [key, ""])),
  );

  // Extra letters — chip builder (one Hebrew letter at a time)
  const [extraLetters, setExtraLetters] = useState([]);
  const [extraLettersInput, setExtraLettersInput] = useState("");
  const [extraLettersError, setExtraLettersError] = useState("");

  const [showWarning, setShowWarning] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Support both single image and images array
  const productImages = product.images || [product.image];
  const currentImage = productImages[currentImageIndex];

  const showNextImage = () =>
    setCurrentImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  const showPrevImage = () =>
    setCurrentImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));

  // Swipe between photos on touch screens. In Hebrew the gallery reads right
  // to left, so swiping right moves forward.
  const touchStartX = useRef(null);
  const handleGalleryTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleGalleryTouchEnd = (e) => {
    if (touchStartX.current === null || productImages.length < 2) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 40) return;
    const forward = language === "he" ? delta > 0 : delta < 0;
    if (forward) showNextImage();
    else showPrevImage();
  };

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

  const calculateTotalPrice = () =>
    calculateProductPrice(product, selectedOptions, extraLetters);

  const handleOptionChange = (optionName, value) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
      // Reset length when jewelry type changes — each type has different sizes
      ...(optionName === "jewelryType" ? { length: "" } : {}),
    }));
    if (optionName === "jewelryType" && !allowsExtraLetters(product, value)) {
      setExtraLetters([]);
      setExtraLettersInput("");
      setExtraLettersError("");
    }
    setShowWarning(false);
  };

  const tryAddExtraLetter = (rawChar) => {
    if (extraLetters.length >= MAX_EXTRA_LETTERS) {
      setExtraLettersError(
        language === "he"
          ? `ניתן להוסיף עד ${MAX_EXTRA_LETTERS} אותיות`
          : `You can add up to ${MAX_EXTRA_LETTERS} letters`,
      );
      return;
    }
    const char = (rawChar || "").trim();
    if (!char) return;
    if (!isValidSingleHebrewLetter(char)) {
      setExtraLettersError(
        language === "he"
          ? "ניתן להזין אותיות בעברית בלבד (א-ת)"
          : "Hebrew letters only (א–ת)",
      );
      return;
    }
    setExtraLetters((prev) => [...prev, char]);
    setExtraLettersInput("");
    setExtraLettersError("");
  };

  const handleExtraLettersChange = (e) => {
    const raw = e.target.value.slice(-1);
    setExtraLettersError("");
    if (!raw) {
      setExtraLettersInput("");
      return;
    }
    if (!isValidSingleHebrewLetter(raw)) {
      setExtraLettersInput("");
      setExtraLettersError(
        language === "he"
          ? "ניתן להזין אותיות בעברית בלבד (א-ת)"
          : "Hebrew letters only (א–ת)",
      );
      return;
    }
    setExtraLettersInput(raw);
  };

  const handleExtraLettersKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      tryAddExtraLetter(extraLettersInput);
    }
  };

  const removeExtraLetter = (index) => {
    setExtraLetters((prev) => prev.filter((_, i) => i !== index));
    setExtraLettersError("");
  };

  // Build the cart item: full product data for display + selections for the backend
  const buildCartItem = () =>
    buildProductCartItem(product, selectedOptions, extraLetters);

  const handleAddToCart = () => {
    // Require all option selectors to be filled
    if (isAddToCartDisabled()) {
      setShowWarning(true);
      revealMissingOption();
      return;
    }

    const productWithOptions = buildCartItem();

    addToCart(productWithOptions, 1);
    // A single light tick on phones that support it, on the same frame as the toast
    navigator.vibrate?.(10);
    trackEvent("AddToCart", productEventPayload(product, productWithOptions.price));
    const displayName =
      language === "en" && product.nameEn ? product.nameEn : product.name;
    showCartToast(
      language === "en"
        ? `${displayName} added to cart!`
        : `${displayName} נוסף לעגלה!`,
      productImages[0],
    );
    onClose();
    openCartDrawer?.();
  };

  // Frictionless checkout: skip the cart and go straight to the checkout page
  const handleBuyNow = () => {
    if (isAddToCartDisabled()) {
      setShowWarning(true);
      revealMissingOption();
      return;
    }

    const productWithOptions = buildCartItem();
    onClose();
    navigate("/checkout", {
      state: {
        cartItems: [{ ...productWithOptions, quantity: 1 }],
        total: productWithOptions.price,
      },
    });
  };

  /**
   * Scroll the first option still without a choice into view and pulse it,
   * so the customer sees what's missing instead of hunting for it.
   */
  const revealMissingOption = () => {
    const root = dialogRef.current;
    if (!root) return;
    const groups = [...root.querySelectorAll(".product-options .product-option")];
    const missing = groups.find((group) => {
      const select = group.querySelector("select");
      if (select) return !select.value;
      const radios = group.querySelectorAll('input[type="radio"]');
      return radios.length > 0 && !group.querySelector('input[type="radio"]:checked');
    });
    if (!missing) return;
    const smooth = !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    missing.scrollIntoView({ block: "center", behavior: smooth ? "smooth" : "auto" });
    missing.classList.remove("product-option--missing");
    // Restart the pulse even if it ran on a previous tap
    void missing.offsetWidth;
    missing.classList.add("product-option--missing");
    missing.querySelector("select, input")?.focus({ preventScroll: true });
  };

  const isAddToCartDisabled = () => {
    if (isLetterChain) {
      if (!selectedOptions.jewelryType) return true;
      if (
        priceAdditions?.metalType &&
        Object.keys(priceAdditions.metalType).length > 0 &&
        !selectedOptions.metalType
      )
        return true;
      if (showLengthOptions && !selectedOptions.length) return true;
      return false;
    }
    if (isSingleLetter) {
      if (
        priceAdditions?.metalType &&
        Object.keys(priceAdditions.metalType).length > 0 &&
        !selectedOptions.metalType
      )
        return true;
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
    product.id,
  );

  const showLengthOptions = isSingleLetter
    ? metalReady && Object.keys(priceAdditions?.length || {}).length > 0
    : isLetterChain
      ? Boolean(
          selectedOptions.jewelryType &&
            (isNecklaceJewelryType(selectedOptions.jewelryType) ||
              isBraceletJewelryType(selectedOptions.jewelryType)),
        )
      : isHebrewLetters
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

  const atLetterCap = extraLetters.length >= MAX_EXTRA_LETTERS;

  // Shared "add extra letters" section — chip builder for every letter product
  const extraLettersSection = allowsExtraLetters(
    product,
    selectedOptions.jewelryType,
  ) && (
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
      <div className="extra-letters-row">
        <input
          type="text"
          className="extra-letters-input"
          maxLength={1}
          inputMode="text"
          autoComplete="off"
          disabled={atLetterCap}
          placeholder={language === "he" ? "הזינו אות אחת" : "Enter one letter"}
          value={extraLettersInput}
          onChange={handleExtraLettersChange}
          onKeyDown={handleExtraLettersKeyDown}
          aria-invalid={Boolean(extraLettersError)}
          aria-describedby={
            extraLettersError ? "extra-letters-error" : undefined
          }
        />
        <button
          type="button"
          className="extra-letter-add-btn"
          disabled={atLetterCap || !extraLettersInput}
          onClick={() => tryAddExtraLetter(extraLettersInput)}
          aria-label={language === "he" ? "הוסף אות" : "Add letter"}
        >
          +
        </button>
      </div>
      <p className="option-hint">
        {language === "he"
          ? `הזינו אות אחת ולחצו Enter או + (עד ${MAX_EXTRA_LETTERS} אותיות)`
          : `Type one letter and press Enter or + (up to ${MAX_EXTRA_LETTERS})`}
      </p>
      {extraLettersError && (
        <p id="extra-letters-error" className="extra-letters-error" role="alert">
          {extraLettersError}
        </p>
      )}
      {extraLetters.length > 0 && (
        <div className="extra-letters-preview">
          {extraLetters.map((letter, i) => (
            <span key={`${letter}-${i}`} className="letter-chip">
              {letter}
              <button
                type="button"
                className="letter-chip-remove"
                onClick={() => removeExtraLetter(i)}
                aria-label={
                  language === "he" ? `הסר אות ${letter}` : `Remove ${letter}`
                }
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
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
    <div
      className={`modal-overlay${closing ? " modal-overlay--closing" : ""}`}
      ref={overlayRef}
      onClick={closeAnimated}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className="modal-drag-handle">
          <div className="modal-drag-handle-pill"></div>
        </div>
        <button
          type="button"
          className="modal-close"
          onClick={closeAnimated}
          aria-label={language === "he" ? "סגירה" : "Close"}
        >
          <FaTimes aria-hidden="true" />
        </button>
        <button
          type="button"
          className="modal-share"
          onClick={handleShare}
          aria-label={language === "he" ? "שיתוף המוצר" : "Share this product"}
          title={language === "he" ? "שיתוף" : "Share"}
        >
          <FaShareAlt />
        </button>

        <div className="modal-scroll-area">
          <div className="product-modal-grid">
            <div className="product-image-gallery">
              <div
                className="main-image-container"
                onTouchStart={handleGalleryTouchStart}
                onTouchEnd={handleGalleryTouchEnd}
              >
                <img
                  key={currentImage}
                  src={sizedImage(currentImage, 600)}
                  alt={productName(product, language)}
                  className="product-modal-image"
                  onError={handleImageError}
                />
                {productImages.length > 1 && (
                  <>
                    {/* "Previous" sits on the reading-start side: right in Hebrew */}
                    <button
                      type="button"
                      className="gallery-nav prev"
                      onClick={showPrevImage}
                      aria-label={language === "en" ? "Previous image" : "תמונה קודמת"}
                    >
                      {language === "he" ? "›" : "‹"}
                    </button>
                    <button
                      type="button"
                      className="gallery-nav next"
                      onClick={showNextImage}
                      aria-label={language === "en" ? "Next image" : "תמונה הבאה"}
                    >
                      {language === "he" ? "‹" : "›"}
                    </button>
                    <div className="gallery-dots" aria-hidden="true">
                      {productImages.map((img, index) => (
                        <span
                          key={img + index}
                          className={`gallery-dot${index === currentImageIndex ? " active" : ""}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              {productImages.length > 1 && (
                <div className="thumbnail-container">
                  {productImages.map((img, index) => (
                    <img
                      key={index}
                      src={sizedImage(img, 90)}
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
                {typeof product.rating === "number" && product.rating > 0 && (
                  <div
                    className="product-modal-rating"
                    aria-label={
                      language === "he"
                        ? `דירוג ${product.rating} מתוך 5`
                        : `Rated ${product.rating} out of 5`
                    }
                  >
                    <span aria-hidden="true">
                      {"★".repeat(Math.round(Math.min(5, product.rating)))}
                      {"☆".repeat(5 - Math.round(Math.min(5, product.rating)))}
                    </span>
                    <span className="product-modal-rating-value">
                      {product.rating.toFixed(1)}
                      {typeof product.reviews === "number" &&
                        product.reviews > 0 &&
                        ` (${product.reviews})`}
                    </span>
                  </div>
                )}
                <h2 id={titleId}>{productName(product, language)}</h2>
                <div className="product-modal-price" aria-live="polite">
                  {formatPrice(calculateTotalPrice(), language)}
                </div>
              </div>

              <div className="product-modal-selections">
                <div className="product-options">
                  {isLetterChain ? (
                    <>
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

                      {extraLettersSection}
                    </>
                  ) : isSingleLetter ? (
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
                        </div>
                      )}

                      {extraLettersSection}
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
                    {allowsExtraLetters(
                      product,
                      selectedOptions.jewelryType,
                    ) &&
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
          {/* Lives in the footer, next to the button that was tapped: inside
              the scroll area it sat above the options, off screen on phones */}
          {showWarning && (
            <div className="selection-warning" role="alert">
              <FaExclamationCircle aria-hidden="true" />{" "}
              {language === "he"
                ? "נשאר לבחור את המאפיינים המסומנים למעלה"
                : "Please choose the highlighted options above"}
            </div>
          )}
          <div className="modal-cta-row">
            <button className="btn buy-now-btn" onClick={handleBuyNow}>
              {language === "he"
                ? `לרכישה מיידית — ${formatPrice(calculateTotalPrice(), language)}`
                : `Buy Now — ${formatPrice(calculateTotalPrice(), language)}`}
            </button>
            <button className="btn add-to-cart-btn" onClick={handleAddToCart}>
              {language === "he" ? "הוסף לעגלה" : "Add to Cart"}
            </button>
          </div>
          <p className="modal-ready-ship">
            {language === "he"
              ? "עבודת יד בהזמנה אישית — נשלח תוך עד 14 ימי עסקים"
              : "Custom handmade — ready to ship within 14 business days"}
          </p>
          <div className="modal-trust-signals">
            <span className="trust-signal">
              <FaLock />
              {language === "he" ? "תשלום מאובטח" : "Secure checkout"}
            </span>
            <span className="trust-signal">
              <FaShippingFast />
              {language === "he" ? "משלוח חינם מעל ₪300" : "Free shipping over ₪300"}
            </span>
            <span className="trust-signal">
              <FaShieldAlt />
              {language === "he" ? "אחריות 12 חודשים" : "12-month warranty"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductModal;
