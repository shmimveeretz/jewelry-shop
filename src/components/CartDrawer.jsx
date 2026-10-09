import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaPlus, FaMinus, FaTimes, FaTrash } from "react-icons/fa";
import { useCart, MAX_QUANTITY_PER_ITEM } from "../context/CartContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useProducts } from "../hooks/useProducts";
import { useDialog } from "../hooks/useDialog";
import { useDragToDismiss } from "../hooks/useDragToDismiss";
import FreeShippingProgress from "./FreeShippingProgress";
import { quoteShipping } from "../utils/shipping";
import { trackEvent, productEventPayload } from "../utils/tracking";
import { formatItemNameWithExtraLetters } from "../utils/extraHebrewLetters";
import {
  formatPrice,
  productName,
  productImage,
  handleImageError,
  sizedImage,
} from "../utils/format";
import "../styles/components/CartDrawer.css";

// Products with required option groups (metal, length, …) must go through
// the product modal; only option-free products can be added in one tap.
function productNeedsOptions(product) {
  const pa = product.priceAdditions || {};
  return Object.keys(pa).some(
    (key) =>
      key !== "extraLetterForBracelet" &&
      typeof pa[key] === "object" &&
      pa[key] !== null &&
      Object.keys(pa[key]).length > 0,
  );
}

function CartDrawer() {
  const { isCartDrawerOpen } = useCart();
  // Mount the panel only while open, so its product fetch does not run on
  // every page of the site.
  return isCartDrawerOpen ? <CartDrawerPanel /> : null;
}

function CartDrawerPanel() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const {
    cartItems,
    closeCartDrawer,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    addToCart,
  } = useCart();
  const he = language === "he";
  const [closing, setClosing] = useState(false);

  // Animate out before unmounting. Respect reduced motion: close at once.
  const requestClose = () => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      closeCartDrawer();
      return;
    }
    setClosing(true);
    window.setTimeout(closeCartDrawer, 220);
  };
  const dialogRef = useDialog(true, requestClose);
  const backdropRef = useRef(null);
  // Swipe the drawer back toward the edge it came from
  useDragToDismiss({
    sheetRef: dialogRef,
    scrimRef: backdropRef,
    axis: "x",
    direction: document.documentElement.dir === "rtl" ? -1 : 1,
    onDismiss: closeCartDrawer,
  });

  const { products: featuredProducts } = useProducts({ featured: true, limit: 6 });

  const cartIds = new Set(cartItems.map((i) => i.id));
  const crossSell = featuredProducts.filter((p) => !cartIds.has(p.id)).slice(0, 3);
  const total = getCartTotal();
  // Destination is chosen at checkout; the cart shows the Israeli rate
  const shipping = quoteShipping("IL", total);

  const handleCheckout = () => {
    closeCartDrawer();
    navigate("/checkout");
  };

  const handleCrossSellClick = (product) => {
    if (productNeedsOptions(product)) {
      closeCartDrawer();
      navigate(`/shop?product=${encodeURIComponent(product.id)}`);
      return;
    }
    // Same key shape as the shop's quick add, so the two merge into one line
    addToCart(
      {
        ...product,
        basePrice: product.price,
        selectedOptions: {},
        selections: {},
        cartItemId: `${product.id}__${JSON.stringify({})}`,
      },
      1,
    );
    trackEvent("AddToCart", productEventPayload(product));
  };

  return (
    <div className={`cart-drawer-root${closing ? " cart-drawer-root--closing" : ""}`}>
      <div
        className="cart-drawer-backdrop"
        ref={backdropRef}
        onClick={requestClose}
        aria-hidden="true"
      />
      <aside
        className="cart-drawer"
        dir={he ? "rtl" : "ltr"}
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        tabIndex={-1}
      >
        <header className="cart-drawer-header">
          <h2 id="cart-drawer-title">{he ? "העגלה שלי" : "Your Cart"}</h2>
          <button
            type="button"
            className="cart-drawer-close"
            onClick={requestClose}
            aria-label={he ? "סגירת העגלה" : "Close cart"}
          >
            <FaTimes />
          </button>
        </header>

        <div className="cart-drawer-body">
          {cartItems.length === 0 ? (
            <div className="cart-drawer-empty">
              <p>{he ? "העגלה ריקה" : "Your cart is empty"}</p>
              <Link to="/shop" className="btn" onClick={closeCartDrawer}>
                {he ? "לחנות" : "Shop now"}
              </Link>
            </div>
          ) : (
            <>
              <ul className="cart-drawer-items">
                {cartItems.map((item) => {
                  const key = item.cartItemId || item.id;
                  const name = formatItemNameWithExtraLetters(
                    productName(item, language),
                    item.selections?.extraLetters,
                  );
                  return (
                    <li key={key} className="cart-drawer-item">
                      <img
                        src={sizedImage(productImage(item), 80)}
                        alt=""
                        loading="lazy"
                        onError={handleImageError}
                      />
                      <div className="cart-drawer-item-info">
                        <h3>{name}</h3>
                        {item.selections?.extraLetters?.length > 0 && (
                          <p className="cart-drawer-meta">
                            {he ? "צירוף: " : "Extra: "}
                            {item.selections.extraLetters.join(", ")}
                          </p>
                        )}
                        <p className="cart-drawer-price">
                          {formatPrice(item.price * item.quantity, language)}
                        </p>
                        <div className="cart-drawer-qty">
                          <button
                            type="button"
                            onClick={() => updateQuantity(key, item.quantity - 1)}
                            aria-label={he ? `הפחתת כמות של ${name}` : `Decrease ${name}`}
                          >
                            <FaMinus />
                          </button>
                          <span aria-live="polite" aria-label={he ? "כמות" : "Quantity"}>
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(key, item.quantity + 1)}
                            disabled={item.quantity >= MAX_QUANTITY_PER_ITEM}
                            aria-label={he ? `הוספת כמות של ${name}` : `Increase ${name}`}
                          >
                            <FaPlus />
                          </button>
                          <button
                            type="button"
                            className="cart-drawer-remove"
                            onClick={() => removeFromCart(key)}
                            aria-label={he ? `הסרת ${name} מהעגלה` : `Remove ${name}`}
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
                  <h3>{he ? "אולי יעניין אתכם גם" : "You may also like"}</h3>
                  <div className="cart-drawer-crosssell-grid">
                    {crossSell.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        className="cart-drawer-crosssell-card"
                        onClick={() => handleCrossSellClick(product)}
                      >
                        <img
                          src={sizedImage(productImage(product), 140)}
                          alt=""
                          loading="lazy"
                          onError={handleImageError}
                        />
                        <span>{productName(product, language)}</span>
                        <em>{formatPrice(product.price, language)}</em>
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
            <FreeShippingProgress total={total} />
            <div className="cart-drawer-summary">
              <span>{he ? "משלוח בישראל" : "Shipping (Israel)"}</span>
              {shipping.price === 0 ? (
                <strong className="shipping-free">{he ? "חינם" : "Free"}</strong>
              ) : (
                <strong>{formatPrice(shipping.price, language)}</strong>
              )}
            </div>
            <div className="cart-drawer-summary cart-drawer-total">
              <span>{he ? 'סה״כ' : "Total"}</span>
              <strong>{formatPrice(total + shipping.price, language)}</strong>
            </div>
            <button type="button" className="btn cart-drawer-checkout" onClick={handleCheckout}>
              {he ? "מעבר לתשלום מאובטח" : "Secure checkout"}
            </button>
            <Link to="/cart" className="cart-drawer-full-cart" onClick={closeCartDrawer}>
              {he ? "לעמוד העגלה המלא" : "View full cart"}
            </Link>
          </footer>
        )}
      </aside>
    </div>
  );
}

export default CartDrawer;
