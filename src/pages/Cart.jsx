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
      <div class"name"="cart-page">
        <div class"name"="cart-container">
          <div class"name"="empty-cart">
            <div class"name"="empty-cart-icon">🛒</div>
            <h2>{t("emptyCart")}</h2>
            <p>{t("startShopping")}</p>
            <Link to="/shop" class"name"="btn">
              {t("shopNow")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div class"name"="cart-page">
      <div class"name"="cart-container">
        <div class"name"="cart-header">
          <h1>{t("shoppingCart")}</h1>
        </div>

        <div class"name"="cart-content">
          <div class"name"="cart-items">
            {cartItems.map((item) => (
              <div key={item.id} class"name"="cart-item">
                <img
                  src={
                    Array.isArray(item.images)
                      ? item.images[0]
                      : item.image ||
                        "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=100&h=100&fit=crop"
                  }
                  alt={item."name"}
                  class"name"="cart-item-image"
                  onError={(e) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=100&h=100&fit=crop";
                  }}
                />

                <div class"name"="cart-item-details">
                  <h3>{item."name"}</h3>
                  <p class"name"="cart-item-description">{item.description}</p>

                  {/* Display selected options */}
                  {item.selectedOptions && (
                    <div class"name"="selected-options">
                      {item.selectedOptions.length && (
                        <span class"name"="option-tag">
                          <FaRuler /> אורך: {item.selectedOptions.length} מ״מ
                        </span>
                      )}
                      {item.selectedOptions.metalType && (
                        <span class"name"="option-tag">
                          <FaGem /> {item.selectedOptions.metalType}
                        </span>
                      )}
                      {item.selectedOptions.chainType && (
                        <span class"name"="option-tag">
                          <FaLink /> {item.selectedOptions.chainType}
                        </span>
                      )}
                      {item.selectedOptions.waxColor && (
                        <span class"name"="option-tag">
                          <FaPalette /> {item.selectedOptions.waxColor}
                        </span>
                      )}
                    </div>
                  )}

                  <div class"name"="cart-item-meta">
                    <span class"name"="cart-item-category">{item.category}</span>
                    <span class"name"="cart-item-price-single">
                      {item.price} ₪ ליחידה
                    </span>
                  </div>
                </div>

                <div class"name"="cart-item-actions">
                  <div class"name"="quantity-controls">
                    <button
                      class"name"="quantity-btn"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <FaMinus />
                    </button>
                    <span class"name"="quantity-display">{item.quantity}</span>
                    <button
                      class"name"="quantity-btn"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <FaPlus />
                    </button>
                  </div>
                  <div class"name"="cart-item-price">
                    {item.price * item.quantity} ₪
                  </div>
                  <button
                    class"name"="remove-item"
                    onClick={() => removeFromCart(item.id)}
                    title="הסר מהעגלה"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div class"name"="cart-summary">
            <h2>{t("orderSummary")}</h2>

            <div class"name"="summary-row">
              <span>{t("subtotal")}:</span>
              <span>{getCartTotal()} ₪</span>
            </div>

            <div class"name"="summary-row">
              <span>{t("shipping")}:</span>
              <span>{calculateShipping()} ₪</span>
            </div>

            <div class"name"="summary-row total">
              <span>{t("total")}:</span>
              <span>{calculateTotal()} ₪</span>
            </div>

            <button class"name"="btn checkout-btn" onClick={handleCheckout}>
              {t("proceedToCheckout")}
            </button>

            {!localStorage.getItem("token") && (
              <p class"name"="guest-checkout-info">
                <FaInfoCircle />{" "}
                {language === "he"
                  ? "אין צורך בהרשמה - ניתן להזמין כאורח"
                  : "No registration required - order as guest"}
              </p>
            )}

            <Link
              to="/shop"
              class"name"="btn btn-secondary"
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
