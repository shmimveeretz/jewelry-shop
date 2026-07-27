import { Link, useNavigate } from "react-router-dom";
import { FaPlus, FaMinus, FaTimes, FaTrash } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useProducts } from "../hooks/useProducts";
import { formatItemNameWithExtraLetters } from "../utils/extraHebrewLetters";
import "../styles/components/CartDrawer.css";

function CartDrawer() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const {
    cartItems,
    isCartDrawerOpen,
    closeCartDrawer,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    addToCart,
  } = useCart();

  const { products: featuredProducts } = useProducts({
    featured: true,
    limit: 6,
  });

  const cartIds = new Set(cartItems.map((i) => i.id));
  const crossSell = featuredProducts
    .filter((p) => !cartIds.has(p.id))
    .slice(0, 3);

  if (!isCartDrawerOpen) return null;

  const handleCheckout = () => {
    closeCartDrawer();
    navigate("/checkout", {
      state: {
        cartItems,
        total: getCartTotal(),
      },
    });
  };

  // Products with required option groups (metal, length, …) must go through
  // the product modal; only option-free products can be added in one tap.
  const productNeedsOptions = (product) => {
    const pa = product.priceAdditions || {};
    return Object.keys(pa).some(
      (key) =>
        key !== "extraLetterForBracelet" &&
        typeof pa[key] === "object" &&
        pa[key] !== null &&
        Object.keys(pa[key]).length > 0,
    );
  };

  const handleCrossSellClick = (product) => {
    if (productNeedsOptions(product)) {
      closeCartDrawer();
      navigate("/shop", { state: { openProductId: product.id } });
      return;
    }
    addToCart(
      {
        ...product,
        price: product.price,
        basePrice: product.price,
        selectedOptions: {},
        selections: {},
        cartItemId: product.id,
      },
      1,
    );
  };

  return (
    <div className="cart-drawer-root" role="dialog" aria-modal="true">
      <div className="cart-drawer-backdrop" onClick={closeCartDrawer} />
      <aside className="cart-drawer" dir={language === "he" ? "rtl" : "ltr"}>
        <header className="cart-drawer-header">
          <h2>{language === "he" ? "העגלה שלי" : "Your Cart"}</h2>
          <button
            type="button"
            className="cart-drawer-close"
            onClick={closeCartDrawer}
            aria-label={language === "he" ? "סגור" : "Close"}
          >
            <FaTimes />
          </button>
        </header>

        <div className="cart-drawer-body">
          {cartItems.length === 0 ? (
            <div className="cart-drawer-empty">
              <p>
                {language === "he" ? "העגלה ריקה" : "Your cart is empty"}
              </p>
              <Link
                to="/shop"
                className="btn"
                onClick={closeCartDrawer}
              >
                {language === "he" ? "לחנות" : "Shop now"}
              </Link>
            </div>
          ) : (
            <>
              <ul className="cart-drawer-items">
                {cartItems.map((item) => {
                  const key = item.cartItemId || item.id;
                  const img = Array.isArray(item.images)
                    ? item.images[0]
                    : item.image;
                  return (
                    <li key={key} className="cart-drawer-item">
                      <img
                        src={
                          img ||
                          "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=80&h=80&fit=crop"
                        }
                        alt={item.name}
                      />
                      <div className="cart-drawer-item-info">
                        <h3>
                          {formatItemNameWithExtraLetters(
                            language === "en" && item.nameEn
                              ? item.nameEn
                              : item.name,
                            item.selections?.extraLetters,
                          )}
                        </h3>
                        {item.selections?.extraLetters?.length > 0 && (
                          <p className="cart-drawer-meta">
                            {language === "he" ? "צירוף: " : "Extra: "}
                            {item.selections.extraLetters.join(", ")}
                          </p>
                        )}
                        <p className="cart-drawer-price">
                          {item.price * item.quantity} ₪
                        </p>
                        <div className="cart-drawer-qty">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(key, item.quantity - 1)
                            }
                            aria-label="-"
                          >
                            <FaMinus />
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(key, item.quantity + 1)
                            }
                            aria-label="+"
                          >
                            <FaPlus />
                          </button>
                          <button
                            type="button"
                            className="cart-drawer-remove"
                            onClick={() => removeFromCart(key)}
                            aria-label={
                              language === "he" ? "הסר" : "Remove"
                            }
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {crossSell.length > 0 && (
                <div className="cart-drawer-crosssell">
                  <h3>
                    {language === "he"
                      ? "אולי יעניין אתכם גם"
                      : "You may also like"}
                  </h3>
                  <div className="cart-drawer-crosssell-grid">
                    {crossSell.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        className="cart-drawer-crosssell-card"
                        onClick={() => handleCrossSellClick(product)}
                      >
                        <img
                          src={
                            Array.isArray(product.images)
                              ? product.images[0]
                              : product.image
                          }
                          alt={product.name}
                        />
                        <span>
                          {language === "en" && product.nameEn
                            ? product.nameEn
                            : product.name}
                        </span>
                        <em>{product.price} ₪</em>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {cartItems.length > 0 && (
          <footer className="cart-drawer-footer">
            <div className="cart-drawer-summary">
              <span>{language === "he" ? "משלוח" : "Shipping"}</span>
              <strong className="shipping-free">
                {language === "he" ? "חינם" : "Free"}
              </strong>
            </div>
            <div className="cart-drawer-summary cart-drawer-total">
              <span>{language === "he" ? 'סה״כ' : "Total"}</span>
              <strong>{getCartTotal()} ₪</strong>
            </div>
            <button
              type="button"
              className="btn cart-drawer-checkout"
              onClick={handleCheckout}
            >
              {language === "he"
                ? `מעבר לתשלום מאובטח — ${getCartTotal()} ₪`
                : `Secure checkout — ₪${getCartTotal()}`}
            </button>
            <Link
              to="/cart"
              className="cart-drawer-full-cart"
              onClick={closeCartDrawer}
            >
              {language === "he" ? "לעמוד העגלה המלא" : "View full cart"}
            </Link>
          </footer>
        )}
      </aside>
    </div>
  );
}

export default CartDrawer;
