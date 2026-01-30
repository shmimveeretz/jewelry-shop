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
        return <FaCheckCircle className="toast-icon success-icon" />;
      case "error":
        return <FaExclamationTriangle className="toast-icon error-icon" />;
      case "cart":
        return <FaShoppingCart className="toast-icon cart-icon" />;
      default:
        return <FaInfoCircle className="toast-icon info-icon" />;
    }
  };

  const getClassName = () => {
    const baseClass = `toast toast-${type}`;
    return isClosing ? `${baseClass} toast-closing` : baseClass;
  };

  return (
    <div className={getClassName()}>
      <div className="toast-content">
        {productImage && (
          <img src={productImage} alt="" className="toast-product-image" />
        )}
        <div className="toast-icon-wrapper">{getIcon()}</div>
        <div className="toast-message">
          {message}
          {type === "cart" && (
            <a href="/cart" className="toast-cart-link" onClick={handleClose}>
              עבור לעגלה ←
            </a>
          )}
        </div>
      </div>
      <button className="toast-close" onClick={handleClose}>
        <FaTimes />
      </button>
      <div className="toast-progress"></div>
    </div>
  );
}

export default Toast;
