import { Link, useNavigate } from "react-router-dom";
import { useCart, MAX_QUANTITY_PER_ITEM } from "../context/CartContext";
import { useLanguage } from "../contexts/LanguageContext";
import {
  FaTrash,
  FaPlus,
  FaMinus,
  FaPalette,
  FaGem,
  FaLink,
  FaInfoCircle,
  FaRuler,
  FaStar,
} from "react-icons/fa";
import {
  formatPrice,
  productName,
  productImage,
  handleImageError,
  sizedImage,
} from "../utils/format";
import FreeShippingProgress from "../components/FreeShippingProgress";
import { quoteShipping } from "../utils/shipping";
import "../styles/pages/Cart.css";

function Cart() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();

  const he = language === "he";
  const total = getCartTotal();
  // Destination is chosen at checkout; the cart shows the Israeli rate
  const shipping = quoteShipping("IL", total);

  const handleCheckout = () => navigate("/checkout");
  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <div className="empty-cart">
            <div className="empty-cart-icon">
              <span
                aria-hidden="true"
                className="material-symbols-outlined"
                style={{
                  fontSize: "3rem",
                  color: "var(--color-secondary)",
                  fontVariationSettings: "'FILL' 0, 'wght' 200",
                }}
              >
                shopping_bag
              </span>
            </div>
            <h2>{t("emptyCart")}</h2>
            <p>{t("startShopping")}</p>
            <Link to="/shop" className="btn">
              {t("shopNow")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <h1>{t("shoppingCart")}</h1>
        </div>

        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.cartItemId || item.id} className="cart-item">
                <img
                  src={sizedImage(productImage(item), 100)}
                  alt=""
                  className="cart-item-image"
                  onError={handleImageError}
                />

                <div className="cart-item-details">
                  <h3>{productName(item, language)}</h3>
                  <p className="cart-item-description">
                    {language === "en" && item.descriptionEn
                      ? item.descriptionEn
                      : item.description}
                  </p>

                  {/* Display selected options */}
                  {item.selectedOptions && (
                    <div className="selected-options">
                      {item.selectedOptions.length && (
                        <span className="option-tag">
                          <FaRuler aria-hidden="true" /> {he ? "אורך" : "Length"}:{" "}
                          {item.selectedOptions.length} {he ? "ס״מ" : "cm"}
                        </span>
                      )}
                      {item.selectedOptions.metalType && (
                        <span className="option-tag">
                          <FaGem /> {item.selectedOptions.metalType}
                        </span>
                      )}
                      {item.selectedOptions.jewelryType && (
                        <span className="option-tag">
                          <FaStar /> {item.selectedOptions.jewelryType}
                        </span>
                      )}
                      {item.selectedOptions.chainType && (
                        <span className="option-tag">
                          <FaLink /> {item.selectedOptions.chainType}
                        </span>
                      )}
                      {item.selectedOptions.waxColor && (
                        <span className="option-tag">
                          <FaPalette /> {item.selectedOptions.waxColor}
                        </span>
                      )}
                      {item.selections?.extraLetters?.length > 0 && (
                        <span className="option-tag">
                          {he ? "אותיות: " : "Letters: "}
                          {item.selections.extraLetters.join(", ")}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="cart-item-meta">
                    <span className="cart-item-category">
                      {language === "en" && item.categoryEn
                        ? item.categoryEn
                        : item.category}
                    </span>
                    <span className="cart-item-price-single">
                      {formatPrice(item.price, language)} {he ? "ליחידה" : "each"}
                    </span>
                  </div>
                </div>

                <div className="cart-item-actions">
                  <div className="quantity-controls">
                    <button
                      className="quantity-btn"
                      onClick={() =>
                        updateQuantity(
                          item.cartItemId || item.id,
                          item.quantity - 1,
                        )
                      }
                      disabled={item.quantity <= 1}
                      aria-label={he ? "הפחתת כמות" : "Decrease quantity"}
                    >
                      <FaMinus />
                    </button>
                    <span className="quantity-display" aria-live="polite">
                      {item.quantity}
                    </span>
                    <button
                      className="quantity-btn"
                      aria-label={he ? "הוספת כמות" : "Increase quantity"}
                      disabled={item.quantity >= MAX_QUANTITY_PER_ITEM}
                      onClick={() =>
                        updateQuantity(
                          item.cartItemId || item.id,
                          item.quantity + 1,
                        )
                      }
                    >
                      <FaPlus />
                    </button>
                  </div>
                  <div className="cart-item-price">
                    {formatPrice(item.price * item.quantity, language)}
                  </div>
                  <button
                    className="remove-item"
                    onClick={() => removeFromCart(item.cartItemId || item.id)}
                    title={he ? "הסר מהעגלה" : "Remove from cart"}
                    aria-label={he ? "הסר מהעגלה" : "Remove from cart"}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>{t("orderSummary")}</h2>

            <FreeShippingProgress total={total} />

            <div className="summary-row">
              <span>{t("subtotal")}:</span>
              <span>{formatPrice(total, language)}</span>
            </div>

            <div className="summary-row">
              <span>{he ? "משלוח בישראל" : "Shipping (Israel)"}:</span>
              {shipping.price === 0 ? (
                <span style={{ color: "#2f6b3a", fontWeight: 700 }}>
                  {he ? "חינם" : "Free"}
                </span>
              ) : (
                <span>{formatPrice(shipping.price, language)}</span>
              )}
            </div>

            <div className="summary-row total">
              <span>{t("total")}:</span>
              <span>{formatPrice(total + shipping.price, language)}</span>
            </div>

            <button className="btn checkout-btn" onClick={handleCheckout}>
              {t("proceedToCheckout")}
            </button>

            {!localStorage.getItem("token") && (
              <p className="guest-checkout-info">
                <FaInfoCircle />{" "}
                {language === "he"
                  ? "אין צורך בהרשמה - ניתן להזמין כאורח"
                  : "No registration required - order as guest"}
              </p>
            )}

            <Link
              to="/shop"
              className="btn btn-secondary"
              style={{
                marginTop: "1rem",
                display: "block",
                textAlign: "center",
              }}
            >
              {t("shopNow")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
