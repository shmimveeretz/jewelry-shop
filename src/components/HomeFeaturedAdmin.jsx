import { useEffect, useState } from "react";
import {
  FaArrowDown,
  FaArrowUp,
  FaSave,
  FaStar,
  FaTimes,
} from "react-icons/fa";
import { useLanguage } from "../contexts/LanguageContext";
import { useToast } from "../context/ToastContext";
import "../styles/components/AdminPanel.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const HOME_SLOT_COUNT = 4;

export default function HomeFeaturedAdmin() {
  const { language } = useLanguage();
  const { showSuccess, showError } = useToast();
  const he = language === "he";

  const [allProducts, setAllProducts] = useState([]);
  const [slots, setSlots] = useState(Array(HOME_SLOT_COUNT).fill(""));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const token = () => localStorage.getItem("token");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/products?limit=200`);
        const data = await res.json();
        if (!data.success) throw new Error(data.message);

        const products = (data.data || []).filter(
          (p) => p.status !== "inactive",
        );
        setAllProducts(products);

        const featured = products
          .filter((p) => p.featured)
          .sort(
            (a, b) =>
              (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0) ||
              a.name.localeCompare(b.name, "he"),
          )
          .map((p) => p.id);

        const nextSlots = Array(HOME_SLOT_COUNT).fill("");
        featured.slice(0, HOME_SLOT_COUNT).forEach((id, i) => {
          nextSlots[i] = id;
        });
        setSlots(nextSlots);
      } catch {
        showError(he ? "שגיאה בטעינת מוצרים" : "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedIds = slots.filter(Boolean);
  const availableForSlot = (slotIndex) => {
    const usedElsewhere = new Set(
      slots.filter((id, i) => id && i !== slotIndex),
    );
    return allProducts.filter((p) => !usedElsewhere.has(p.id));
  };

  const moveSlot = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= HOME_SLOT_COUNT) return;
    setSlots((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const clearSlot = (index) => {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = "";
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const productIds = slots.filter(Boolean);
      const res = await fetch(`${API_BASE_URL}/api/products/home-featured`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ productIds }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      showSuccess(
        he ? "מוצרי דף הבית עודכנו" : "Home page products updated",
      );
    } catch (err) {
      showError(
        err.message ||
          (he ? "שגיאה בשמירה" : "Failed to save"),
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="ap-wrap">
        <p>{he ? "טוען..." : "Loading..."}</p>
      </div>
    );
  }

  return (
    <div className="ap-wrap" dir={he ? "rtl" : "ltr"}>
      <div className="ap-header">
        <div>
          <h2>
            <FaStar style={{ marginInlineEnd: "0.5rem" }} />
            {he ? "הנמכרים ביותר — דף הבית" : "Best Sellers — Home Page"}
          </h2>
          <p className="ap-subtitle">
            {he
              ? `בחרו עד ${HOME_SLOT_COUNT} מוצרים שיוצגו בדף הבית. הסדר כאן קובע את סדר התצוגה (משמאל לימין).`
              : `Choose up to ${HOME_SLOT_COUNT} products for the home page. Order here controls display order.`}
          </p>
        </div>
        <button
          type="button"
          className="ap-btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          <FaSave />
          {saving ? (he ? "שומר..." : "Saving...") : he ? "שמור" : "Save"}
        </button>
      </div>

      <div className="home-featured-slots">
        {slots.map((productId, index) => {
          const product = allProducts.find((p) => p.id === productId);
          return (
            <div key={index} className="home-featured-slot">
              <div className="home-featured-slot__header">
                <span className="home-featured-slot__num">
                  {he ? `מיקום ${index + 1}` : `Slot ${index + 1}`}
                </span>
                <div className="home-featured-slot__actions">
                  <button
                    type="button"
                    className="ap-btn-icon"
                    onClick={() => moveSlot(index, -1)}
                    disabled={index === 0}
                    title={he ? "הזז למעלה" : "Move up"}
                  >
                    <FaArrowUp />
                  </button>
                  <button
                    type="button"
                    className="ap-btn-icon"
                    onClick={() => moveSlot(index, 1)}
                    disabled={index === HOME_SLOT_COUNT - 1}
                    title={he ? "הזז למטה" : "Move down"}
                  >
                    <FaArrowDown />
                  </button>
                  {productId && (
                    <button
                      type="button"
                      className="ap-btn-icon"
                      onClick={() => clearSlot(index)}
                      title={he ? "נקה" : "Clear"}
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              </div>

              <select
                className="ap-input"
                value={productId}
                onChange={(e) =>
                  setSlots((prev) => {
                    const next = [...prev];
                    next[index] = e.target.value;
                    return next;
                  })
                }
              >
                <option value="">
                  {he ? "— בחר מוצר —" : "— Select product —"}
                </option>
                {availableForSlot(index).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.category})
                  </option>
                ))}
              </select>

              {product && (
                <div className="home-featured-slot__preview">
                  {product.images?.[0] && (
                    <img src={product.images[0]} alt={product.name} />
                  )}
                  <div>
                    <strong>{product.name}</strong>
                    <span>{product.price} ₪</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedIds.length === 0 && (
        <p className="ap-hint">
          {he
            ? "לא נבחרו מוצרים — דף הבית יציג את האזור ריק עד שתבחרו מוצרים."
            : "No products selected — the home section will stay empty until you pick products."}
        </p>
      )}
    </div>
  );
}
