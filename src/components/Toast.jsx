import { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaInfoCircle,
  FaExclamationTriangle,
  FaTimes,
  FaShoppingCart,
} from "react-icons/fa";
import "../styles/components/Toast.css";

function Toast({
  message,
  type = "info",
  onClose,
  duration = 3000,
  productImage,
}) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <FaCheckCircle class"name"="toast-icon success-icon" />;
      case "error":
        return <FaExclamationTriangle class"name"="toast-icon error-icon" />;
      case "cart":
        return <FaShoppingCart class"name"="toast-icon cart-icon" />;
      default:
        return <FaInfoCircle class"name"="toast-icon info-icon" />;
    }
  };

  const getClass"name" = () => {
    const baseClass = `toast toast-${type}`;
    return isClosing ? `${baseClass} toast-closing` : baseClass;
  };

  return (
    <div class"name"={getClass"name"()}>
      <div class"name"="toast-content">
        {productImage && (
          <img src={productImage} alt="" class"name"="toast-product-image" />
        )}
        <div class"name"="toast-icon-wrapper">{getIcon()}</div>
        <div class"name"="toast-message">
          {message}
          {type === "cart" && (
            <a href="/cart" class"name"="toast-cart-link" onClick={handleClose}>
              עבור לעגלה ←
            </a>
          )}
        </div>
      </div>
      <button class"name"="toast-close" onClick={handleClose}>
        <FaTimes />
      </button>
      <div class"name"="toast-progress"></div>
    </div>
  );
}

export default Toast;
