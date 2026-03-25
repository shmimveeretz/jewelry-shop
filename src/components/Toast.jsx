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
        return <FaCheckCircle classname="toast-icon success-icon" />;
      case "error":
        return <FaExclamationTriangle classname="toast-icon error-icon" />;
      case "cart":
        return <FaShoppingCart classname="toast-icon cart-icon" />;
      default:
        return <FaInfoCircle classname="toast-icon info-icon" />;
    }
  };

  const getclassname = () => {
    const baseClass = `toast toast-${type}`;
    return isClosing ? `${baseClass} toast-closing` : baseClass;
  };

  return (
    <div classname={getclassname()}>
      <div classname="toast-content">
        {productImage && (
          <img src={productImage} alt="" classname="toast-product-image" />
        )}
        <div classname="toast-icon-wrapper">{getIcon()}</div>
        <div classname="toast-message">
          {message}
          {type === "cart" && (
            <a href="/cart" classname="toast-cart-link" onClick={handleClose}>
              עבור לעגלה ←
            </a>
          )}
        </div>
      </div>
      <button classname="toast-close" onClick={handleClose}>
        <FaTimes />
      </button>
      <div classname="toast-progress"></div>
    </div>
  );
}

export default Toast;
