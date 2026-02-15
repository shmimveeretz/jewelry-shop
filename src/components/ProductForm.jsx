import { useState } from "react";
import {
  createProductWithImage,
  updateProductWithImage,
} from "../services/productApi";

export default function ProductForm({ onSuccess, initialProduct = null }) {
  const [formData, setFormData] = useState({
    name: initialProduct?.name || "",
    nameEn: initialProduct?.nameEn || "",
    description: initialProduct?.description || "",
    descriptionEn: initialProduct?.descriptionEn || "",
    price: initialProduct?.price || "",
    category: initialProduct?.category || "",
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
      <h2>{initialProduct ? "עדכן מוצר" : "צור מוצר חדש"}</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label>שם המוצר (עברית) *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="form-group">
        <label>שם המוצר (אנגלית)</label>
        <input
          type="text"
          name="nameEn"
          value={formData.nameEn}
          onChange={handleInputChange}
        />
      </div>

      <div className="form-group">
        <label>תיאור (עברית) *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="form-group">
        <label>תיאור (אנגלית)</label>
        <textarea
          name="descriptionEn"
          value={formData.descriptionEn}
          onChange={handleInputChange}
        />
      </div>

      <div className="form-group">
        <label>מחיר *</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="form-group">
        <label>קטגוריה *</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          required
        >
          <option value="">בחר קטגוריה</option>
          <option value="אותיות עבריות">אותיות עבריות</option>
          <option value="תליוני מזלות">תליוני מזלות</option>
          <option value="אבני חושן">אבני חושן</option>
          <option value="כוכבים">כוכבים</option>
          <option value="אחר">אחר</option>
        </select>
      </div>

      <div className="form-group">
        <label>אות (למוצרי אותיות עברית)</label>
        <input
          type="text"
          name="letter"
          value={formData.letter}
          onChange={handleInputChange}
          placeholder="א, ב, ג..."
        />
      </div>

      <div className="form-group">
        <label>משמעות (עברית)</label>
        <input
          type="text"
          name="meaningHe"
          value={formData.meaningHe}
          onChange={handleInputChange}
          placeholder="נשמה, נאמנות, צמיחה"
        />
      </div>

      <div className="form-group">
        <label>משמעות (אנגלית)</label>
        <input
          type="text"
          name="meaningEn"
          value={formData.meaningEn}
          onChange={handleInputChange}
          placeholder="Soul, Faithfulness, Growth"
        />
      </div>

      <div className="form-group">
        <label>גימטריה (מספר)</label>
        <input
          type="number"
          name="gematria"
          value={formData.gematria}
          onChange={handleInputChange}
        />
      </div>

      <div className="form-group">
        <label>סוגים (מופרדים בפסיקים)</label>
        <input
          type="text"
          name="types"
          value={formData.types}
          onChange={handleInputChange}
          placeholder="תליון, טבעת, עגיל"
        />
      </div>

      <div className="form-group">
        <label>תמונה</label>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {preview && (
          <img src={preview} alt="preview" className="image-preview" />
        )}
      </div>

      <div className="form-group">
        <label>מתכות (כנויות בפסיקים)</label>
        <input
          type="text"
          name="metals"
          value={formData.metals}
          onChange={handleInputChange}
          placeholder="זהב, כסף, ברונזה"
        />
      </div>

      <div className="form-group">
        <label>מלאי</label>
        <input
          type="number"
          name="stock"
          value={formData.stock}
          onChange={handleInputChange}
        />
      </div>

      <div className="form-group">
        <label>מחיר מוזל</label>
        <input
          type="number"
          name="discountPrice"
          value={formData.discountPrice}
          onChange={handleInputChange}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "טוען..." : initialProduct ? "עדכן מוצר" : "צור מוצר"}
      </button>
    </form>
  );
}
