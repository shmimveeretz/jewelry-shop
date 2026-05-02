import { useState } from "react";
import {
  createProductWithImage,
  updateProductWithImage,
} from "../services/productApi";
import { useLanguage } from "../contexts/LanguageContext";

export default function ProductForm({ onSuccess, initialProduct = null }) {
  const { language } = useLanguage();
  const L = (he, en) => (language === "en" ? en : he);
  const [formData, setFormData] = useState({
    name: initialProduct?.name || "",
    nameEn: initialProduct?.nameEn || "",
    description: initialProduct?.description || "",
    descriptionEn: initialProduct?.descriptionEn || "",
    price: initialProduct?.price || "",
    category: initialProduct?.category || "",
    categoryEn: initialProduct?.categoryEn || "",
    zodiacSign: initialProduct?.zodiacSign || "",
    stock: initialProduct?.stock || "",
    metals: initialProduct?.metals?.join(", ") || "",
    discountPrice: initialProduct?.discountPrice || "",
    letter: initialProduct?.letter || "",
    meaningHe: initialProduct?.meaningHe || "",
    meaningEn: initialProduct?.meaningEn || "",
    gematria: initialProduct?.gematria || "",
    types: initialProduct?.types?.join(", ") || "",
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(initialProduct?.images?.[0] || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const categoryEnMap = {
    "אותיות עבריות": "Ancient Hebrew Script",
    "תליוני מזלות": "Zodiac Pendants",
    "אבני חושן": "Hoshen Stones",
    "כוכבים": "Planets",
    "מזל, אבן חושן וכוכב": "Trinity Pendants",
    "אחר": "Other",
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "category" && { categoryEn: categoryEnMap[value] || "" }),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("nameEn", formData.nameEn);
      data.append("description", formData.description);
      data.append("descriptionEn", formData.descriptionEn);
      data.append("price", formData.price);
      data.append("category", formData.category);
      data.append("categoryEn", formData.categoryEn);
      data.append("zodiacSign", formData.zodiacSign);
      data.append("stock", formData.stock);

      if (formData.letter) {
        data.append("letter", formData.letter);
      }

      if (formData.meaningHe) {
        data.append("meaningHe", formData.meaningHe);
      }

      if (formData.meaningEn) {
        data.append("meaningEn", formData.meaningEn);
      }

      if (formData.gematria) {
        data.append("gematria", formData.gematria);
      }

      if (formData.metals) {
        data.append("metals", formData.metals);
      }

      if (formData.types) {
        data.append("types", formData.types);
      }

      if (formData.discountPrice) {
        data.append("discountPrice", formData.discountPrice);
      }

      if (image) {
        data.append("image", image);
      }

      const token = localStorage.getItem("token");
      let result;

      if (initialProduct) {
        result = await updateProductWithImage(initialProduct._id, data, token);
      } else {
        result = await createProductWithImage(data, token);
      }

      if (result.success) {
        alert(result.message);
        onSuccess?.(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message || "Error creating product");
      console.error("Form error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="product-form">
      <h2>
        {initialProduct
          ? L("עדכן מוצר", "Edit Product")
          : L("צור מוצר חדש", "Create New Product")}
      </h2>

      {error && <div className="error-message">{error}</div>}

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
        <label>{L("שם המוצר (אנגלית)", "Product Name (English)")}</label>
        <input
          type="text"
          name="nameEn"
          value={formData.nameEn}
          onChange={handleInputChange}
        />
      </div>

      <div className="form-group">
        <label>{L("תיאור (עברית) *", "Description (Hebrew) *")}</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="form-group">
        <label>{L("תיאור (אנגלית)", "Description (English)")}</label>
        <textarea
          name="descriptionEn"
          value={formData.descriptionEn}
          onChange={handleInputChange}
        />
      </div>

      <div className="form-group">
        <label>{L("מחיר *", "Price *")}</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="form-group">
        <label>{L("קטגוריה *", "Category *")}</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          required
        >
          <option value="">{L("בחר קטגוריה", "Select category")}</option>
          <option value="אותיות עבריות">אותיות עבריות</option>
          <option value="תליוני מזלות">תליוני מזלות</option>
          <option value="אבני חושן">אבני חושן</option>
          <option value="כוכבים">כוכבים</option>
          <option value="מזל, אבן חושן וכוכב">מזל, אבן חושן וכוכב</option>
          <option value="אחר">אחר</option>
        </select>
      </div>

      <div className="form-group">
        <label>
          {L(
            "אות (למוצרי אותיות עברית)",
            "Letter (for Hebrew letter products)",
          )}
        </label>
        <input
          type="text"
          name="letter"
          value={formData.letter}
          onChange={handleInputChange}
          placeholder={L("א, ב, ג...", "א, ב, ג...")}
        />
      </div>

      <div className="form-group">
        <label>{L("משמעות (עברית)", "Meaning (Hebrew)")}</label>
        <input
          type="text"
          name="meaningHe"
          value={formData.meaningHe}
          onChange={handleInputChange}
          placeholder={L("נשמה, נאמנות, צמיחה", "Soul, Faithfulness, Growth")}
        />
      </div>

      <div className="form-group">
        <label>{L("משמעות (אנגלית)", "Meaning (English)")}</label>
        <input
          type="text"
          name="meaningEn"
          value={formData.meaningEn}
          onChange={handleInputChange}
          placeholder="Soul, Faithfulness, Growth"
        />
      </div>

      <div className="form-group">
        <label>{L("גימטריה (מספר)", "Gematria (number)")}</label>
        <input
          type="number"
          name="gematria"
          value={formData.gematria}
          onChange={handleInputChange}
        />
      </div>

      <div className="form-group">
        <label>{L("סוגים (מופרדים בפסיקים)", "Types (comma-separated)")}</label>
        <input
          type="text"
          name="types"
          value={formData.types}
          onChange={handleInputChange}
          placeholder={L("תליון, טבעת, עגיל", "Pendant, Ring, Earring")}
        />
      </div>

      <div className="form-group">
        <label>{L("תמונה", "Image")}</label>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {preview && (
          <img src={preview} alt="preview" className="image-preview" />
        )}
      </div>

      <div className="form-group">
        <label>
          {L("מתכות (מופרדות בפסיקים)", "Metals (comma-separated)")}
        </label>
        <input
          type="text"
          name="metals"
          value={formData.metals}
          onChange={handleInputChange}
          placeholder={L("זהב, כסף, ברונזה", "Gold, Silver, Bronze")}
        />
      </div>

      <div className="form-group">
        <label>{L("מלאי", "Stock")}</label>
        <input
          type="number"
          name="stock"
          value={formData.stock}
          onChange={handleInputChange}
        />
      </div>

      <div className="form-group">
        <label>{L("מחיר מוזל", "Discount Price")}</label>
        <input
          type="number"
          name="discountPrice"
          value={formData.discountPrice}
          onChange={handleInputChange}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading
          ? L("טוען...", "Loading...")
          : initialProduct
            ? L("עדכן מוצר", "Update Product")
            : L("צור מוצר", "Create Product")}
      </button>
    </form>
  );
}
