import { useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import ProductForm from "./ProductForm";
import { useLanguage } from "../contexts/LanguageContext";
import "../styles/components/ProductFormModal.css";

/**
 * Responsive modal wrapper for the admin product create/edit form.
 * Desktop: centered dialog. Mobile: full-screen bottom sheet.
 */
function ProductFormModal({ product = null, onClose, onSuccess }) {
  const { language } = useLanguage();
  const he = language === "he";

  // Close on Escape + lock body scroll while open
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="pfm-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={
        product
          ? he
            ? "עריכת מוצר"
            : "Edit product"
          : he
            ? "הוספת מוצר"
            : "Add product"
      }
    >
      <div
        className="pfm-dialog"
        dir={he ? "rtl" : "ltr"}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="pfm-header">
          <div className="pfm-header-text">
            <h2 className="pfm-title">
              {product
                ? he
                  ? "עריכת מוצר"
                  : "Edit Product"
                : he
                  ? "הוספת מוצר חדש"
                  : "Add New Product"}
            </h2>
            <p className="pfm-subtitle">
              {product
                ? he
                  ? "עדכון פרטי התכשיט במערכת"
                  : "Update the jewelry item details"
                : he
                  ? "הוספת תכשיט חדש למערכת"
                  : "Add a new jewelry item to the store"}
            </p>
          </div>
          <button
            type="button"
            className="pfm-close"
            onClick={onClose}
            aria-label={he ? "סגור" : "Close"}
          >
            <FaTimes />
          </button>
        </header>

        <div className="pfm-body">
          <ProductForm
            onSuccess={onSuccess}
            initialProduct={product}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}

export default ProductFormModal;
