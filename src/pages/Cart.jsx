import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../contexts/LanguageContext";
import {
  FaTrash,
  FaPlus,
  FaMinus,
  FaPalette,
  FaGem,
  FaLink,
  FaInfoCircle,
} from "react-icons/fa";
import "../styles/pages/Cart.css";

function Cart() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();

  const calculateShipping = () => {
    return cartItems.length > 0 ? 30 : 0;
  };

  const calculateTotal = () => {
    return getCartTotal() + calculateShipping();
  };

  const handleCheckout = () => {
    const total = calculateTotal();

    // Navigate to checkout page with cart data
    navigate("/checkout", {
      state: {
        cartItems,
        total,
      },
    });
  };
  if (cartItems.length === 0) {
    return (
      <div classname="cart-page">
        <div classname="cart-container">
          <div classname="empty-cart">
            <div classname="empty-cart-icon">🛒</div>
            <h2>{t("emptyCart")}</h2>
            <p>{t("startShopping")}</p>
            <Link to="/shop" classname="btn">
              {t("shopNow")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div classname="cart-page">
      <div classname="cart-container">
        <div classname="cart-header">
          <h1>{t("shoppingCart")}</h1>
        </div>

        <div classname="cart-content">
          <div classname="cart-items">
            {cartItems.map((item) => (
              <div key={item.id} classname="cart-item">
                <img
                  src={
                    Array.isArray(item.images)
                      ? item.images[0]
                      : item.image ||
                        "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=100&h=100&fit=crop"
                  }
                  alt={item."name"}
                  classname="cart-item-image"
                  onError={(e) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=100&h=100&fit=crop";
                  }}
                />

                <div classname="cart-item-details">
                  <h3>{item."name"}</h3>
                  <p classname="cart-item-description">{item.description}</p>

                  {/* Display selected options */}
                  {item.selectedOptions && (
                    <div classname="selected-options">
                      {item.selectedOptions.length && (
                        <span classname="option-tag">
                          <FaRuler /> אורך: {item.selectedOptions.length} מ״מ
                        </span>
                      )}
                      {item.selectedOptions.metalType && (
                        <span classname="option-tag">
                          <FaGem /> {item.selectedOptions.metalType}
                        </span>
                      )}
                      {item.selectedOptions.chainType && (
                        <span classname="option-tag">
                          <FaLink /> {item.selectedOptions.chainType}
                        </span>
                      )}
                      {item.selectedOptions.waxColor && (
                        <span classname="option-tag">
                          <FaPalette /> {item.selectedOptions.waxColor}
                        </span>
                      )}
                    </div>
                  )}

                  <div classname="cart-item-meta">
                    <span classname="cart-item-category">{item.category}</span>
                    <span classname="cart-item-price-single">
                      {item.price} ₪ ליחידה
                    </span>
                  </div>
                </div>

                <div classname="cart-item-actions">
                  <div classname="quantity-controls">
                    <button
                      classname="quantity-btn"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <FaMinus />
                    </button>
                    <span classname="quantity-display">{item.quantity}</span>
                    <button
                      classname="quantity-btn"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <FaPlus />
                    </button>
                  </div>
                  <div classname="cart-item-price">
                    {item.price * item.quantity} ₪
                  </div>
                  <button
                    classname="remove-item"
                    onClick={() => removeFromCart(item.id)}
                    title="הסר מהעגלה"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div classname="cart-summary">
            <h2>{t("orderSummary")}</h2>

            <div classname="summary-row">
              <span>{t("subtotal")}:</span>
              <span>{getCartTotal()} ₪</span>
            </div>

            <div classname="summary-row">
              <span>{t("shipping")}:</span>
              <span>{calculateShipping()} ₪</span>
            </div>

            <div classname="summary-row total">
              <span>{t("total")}:</span>
              <span>{calculateTotal()} ₪</span>
            </div>

            <button classname="btn checkout-btn" onClick={handleCheckout}>
              {t("proceedToCheckout")}
            </button>

            {!localStorage.getItem("token") && (
              <p classname="guest-checkout-info">
                <FaInfoCircle />{" "}
                {language === "he"
                  ? "אין צורך בהרשמה - ניתן להזמין כאורח"
                  : "No registration required - order as guest"}
              </p>
            )}

            <Link
              to="/shop"
              classname="btn btn-secondary"
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
