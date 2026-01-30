import { createContext, useContext, useState, useCallback } from "react";
import Toast from "../components/Toast";

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "info", options = {}) => {
    setToast({
      message,
      type,
      ...options,
      id: Date.now(),
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const showSuccess = useCallback(
    (message) => {
      showToast(message, "success");
    },
    [showToast]
  );

  const showError = useCallback(
    (message) => {
      showToast(message, "error");
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message) => {
      showToast(message, "info");
    },
    [showToast]
  );

  const showCartToast = useCallback(
    (message, productImage) => {
      showToast(message, "cart", { productImage });
    },
    [showToast]
  );

  const value = {
    showToast,
    showSuccess,
    showError,
    showInfo,
    showCartToast,
    hideToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          productImage={toast.productImage}
          onClose={hideToast}
          duration={toast.duration || 3000}
        />
      )}
    </ToastContext.Provider>
  );
};
