import { useEffect, useState } from "react";
import {
  createProductWithImage,
  updateProductWithImage,
} from "../services/productApi";
import { useLanguage } from "../contexts/LanguageContext";
import "../styles/productForm.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ProductForm({ onSuccess, initialProduct = null }) {
  const { language } = useLanguage();
  const L = (he, en) => (language === "en" ? en : he);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: initialProduct?.name || "",
    nameEn: initialProduct?.nameEn || "",
    description: initialProduct?.description || "",
    descriptionEn: initialProduct?.descriptionEn || "",
    price: initialProduct?.price || "",
    category: initialProduct?.category || "",
    categoryEn: initialProduct?.categoryEn || "",
    stock: initialProduct?.stock ?? "",
    metals: initialProduct?.metals?.join?.(", ") || "",
    discountPrice: initialProduct?.discountPrice || "",
    letter: initialProduct?.letter || "",
    meaningHe: initialProduct?.meaningHe || "",
    gematria: initialProduct?.gematria || "",
    types: initialProduct?.types?.join?.(", ") || "",
    status: initialProduct?.status || "active",
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(
    initialProduct?.images?.[0] || null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/categories`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setCategories(data.data || []);
      })
      .catch(() => {});
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "category") {
      const cat = categories.find((c) => c.slug === value);
      setFormData((prev) => ({
        ...prev,
        category: value,
        categoryEn: cat?.nameEn || prev.categoryEn,
      }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        if (val !== "" && val !== undefined && val !== null) {
          data.append(key, val);
        }
      });

      if (image) data.append("image", image);

      const token = localStorage.getItem("token");
      const productId = initialProduct?.id || initialProduct?._id;
      const result = initialProduct
        ? await updateProductWithImage(productId, data, token)
        : await createProductWithImage(data, token);

      if (result.success) {
        onSuccess?.(result.data);
      } else {
        setError(result.message || "Error saving product");
      }
    } catch (err) {
      setError(err.message || "Error saving product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="product-form">
      <h2>
        {initialProduct
          ? L("עדכון מוצר", "Edit Product")
          : L("הוספת מוצר חדש", "Add New Product")}
      </h2>

      <p className="form-hint">
        {L(
          "מלאו את השדות המסומנים ב-* — שאר השדות אופציונליים",
          "Fill in fields marked * — others are optional",
        )}
      </p>

      {error && <div className="error-message">{error}</div>}

      <div className="form-row">
        <div className="form-group">
          <label>{L("שם המוצר (עברית) *", "Product Name (Hebrew) *")}</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>{L("שם (אנגלית)", "Name (English)")}</label>
          <input
            type="text"
            name="nameEn"
            value={formData.nameEn}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="form-group">
        <label>{L("תיאור (עברית) *", "Description (Hebrew) *")}</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          required
          rows={4}
        />
      </div>

      <div className="form-group">
        <label>{L("תיאור (אנגלית)", "Description (English)")}</label>
        <textarea
          name="descriptionEn"
          value={formData.descriptionEn}
          onChange={handleInputChange}
          rows={3}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>{L("מחיר (₪) *", "Price (₪) *")}</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            required
            min="0"
          />
        </div>
        <div className="form-group">
          <label>{L("מחיר מבצע", "Sale Price")}</label>
          <input
            type="number"
            name="discountPrice"
            value={formData.discountPrice}
            onChange={handleInputChange}
            min="0"
          />
        </div>
        <div className="form-group">
          <label>{L("מלאי", "Stock")}</label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleInputChange}
            min="0"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>{L("קטגוריה *", "Category *")}</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
          >
            <option value="">{L("בחרו קטגוריה", "Select category")}</option>
            {categories.map((cat) => (
              <option key={cat._id || cat.slug} value={cat.slug}>
                {cat.nameHe}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>{L("סטטוס", "Status")}</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
          >
            <option value="active">{L("פעיל", "Active")}</option>
            <option value="inactive">{L("לא פעיל", "Inactive")}</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>{L("תמונת מוצר", "Product Image")}</label>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {preview && (
          <img src={preview} alt="preview" className="image-preview" />
        )}
      </div>

      <details className="form-advanced">
        <summary>{L("שדות מתקדמים (אופציונלי)", "Advanced fields (optional)")}</summary>
        <div className="form-row">
          <div className="form-group">
            <label>{L("אות עברית", "Hebrew Letter")}</label>
            <input
              type="text"
              name="letter"
              value={formData.letter}
              onChange={handleInputChange}
              placeholder="א"
            />
          </div>
          <div className="form-group">
            <label>{L("משמעות", "Meaning")}</label>
            <input
              type="text"
              name="meaningHe"
              value={formData.meaningHe}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>{L("גימטריה", "Gematria")}</label>
            <input
              type="number"
              name="gematria"
              value={formData.gematria}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>{L("סוגי תכשיט (מופרד בפסיקים)", "Jewelry types (comma-separated)")}</label>
            <input
              type="text"
              name="types"
              value={formData.types}
              onChange={handleInputChange}
              placeholder={L("תליון, צמיד", "Pendant, Bracelet")}
            />
          </div>
          <div className="form-group">
            <label>{L("מתכות (מופרד בפסיקים)", "Metals (comma-separated)")}</label>
            <input
              type="text"
              name="metals"
              value={formData.metals}
              onChange={handleInputChange}
              placeholder={L("כסף, זהב", "Silver, Gold")}
            />
          </div>
        </div>
      </details>

      <button type="submit" className="product-form-submit" disabled={loading}>
        {loading
          ? L("שומר...", "Saving...")
          : initialProduct
            ? L("שמור שינויים", "Save Changes")
            : L("צור מוצר", "Create Product")}
      </button>
    </form>
  );
}
