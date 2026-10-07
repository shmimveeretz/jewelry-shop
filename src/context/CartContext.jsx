import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};

// Same per-line limit the server enforces (Backend/src/utils/orderPricing.js),
// so a customer never discovers it as an error on the payment step.
export const MAX_QUANTITY_PER_ITEM = 20;
const clampQuantity = (quantity) =>
  Math.min(Math.max(Math.floor(quantity) || 1, 1), MAX_QUANTITY_PER_ITEM);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    // A corrupted or hand-edited value must not crash the whole app on load
    try {
      const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      return Array.isArray(savedCart)
        ? savedCart.map((item) => ({ ...item, quantity: clampQuantity(item.quantity) }))
        : [];
    } catch {
      return [];
    }
  });
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const openCartDrawer = () => setIsCartDrawerOpen(true);
  const closeCartDrawer = () => setIsCartDrawerOpen(false);

  const addToCart = (product, quantity = 1) => {
    const key = product.cartItemId || product.id;
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => (item.cartItemId || item.id) === key,
      );

      if (existingItem) {
        return prevItems.map((item) =>
          (item.cartItemId || item.id) === key
            ? { ...item, quantity: clampQuantity(item.quantity + quantity) }
            : item,
        );
      } else {
        return [...prevItems, { ...product, quantity: clampQuantity(quantity) }];
      }
    });
  };

  const removeFromCart = (cartItemId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => (item.cartItemId || item.id) !== cartItemId),
    );
  };

  const updateQuantity = (cartItemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        (item.cartItemId || item.id) === cartItemId
          ? { ...item, quantity: clampQuantity(quantity) }
          : item,
      ),
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    isCartDrawerOpen,
    openCartDrawer,
    closeCartDrawer,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
