import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../contexts/LanguageContext";
import { FaTrash, FaPlus, FaMinus } from "react-icons/fa";
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
      <div className="cart-page">
        <div className="cart-container">
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
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
              <div key={item.id} className="cart-item">
                <img
                  src={
                    Array.isArray(item.images)
                      ? item.images[0]
                      : item.image ||
                        "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=100&h=100&fit=crop"
                  }
                  alt={item.name}
                  className="cart-item-image"
                  onError={(e) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=100&h=100&fit=crop";
                  }}
                />

                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <p className="cart-item-description">{item.description}</p>

                  {/* Display selected options */}
                  {item.selectedOptions && (
                    <div className="selected-options">
                      {item.selectedOptions.length && (
                        <span className="option-tag">
                          📏 אורך: {item.selectedOptions.length} מ״מ
                        </span>
                      )}
                      {item.selectedOptions.metalType && (
                        <span className="option-tag">
                          ✨ {item.selectedOptions.metalType}
                        </span>
                      )}
                      {item.selectedOptions.chainType && (
                        <span className="option-tag">
                          🔗 {item.selectedOptions.chainType}
                        </span>
                      )}
                      {item.selectedOptions.waxColor && (
                        <span className="option-tag">
                          🎨 {item.selectedOptions.waxColor}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="cart-item-meta">
                    <span className="cart-item-category">{item.category}</span>
                    <span className="cart-item-price-single">
                      {item.price} ₪ ליחידה
                    </span>
                  </div>
                </div>

                <div className="cart-item-actions">
                  <div className="quantity-controls">
                    <button
                      className="quantity-btn"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <FaMinus />
                    </button>
                    <span className="quantity-display">{item.quantity}</span>
                    <button
                      className="quantity-btn"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <FaPlus />
                    </button>
                  </div>
                  <div className="cart-item-price">
                    {item.price * item.quantity} ₪
                  </div>
                  <button
                    className="remove-item"
                    onClick={() => removeFromCart(item.id)}
                    title="הסר מהעגלה"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>{t("orderSummary")}</h2>

            <div className="summary-row">
              <span>{t("subtotal")}:</span>
              <span>{getCartTotal()} ₪</span>
            </div>

            <div className="summary-row">
              <span>{t("shipping")}:</span>
              <span>{calculateShipping()} ₪</span>
            </div>

            <div className="summary-row total">
              <span>{t("total")}:</span>
              <span>{calculateTotal()} ₪</span>
            </div>

            <button className="btn checkout-btn" onClick={handleCheckout}>
              {t("proceedToCheckout")}
            </button>

            {!localStorage.getItem("token") && (
              <p className="guest-checkout-info">
                💡{" "}
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
