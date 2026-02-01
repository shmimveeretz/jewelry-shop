import { useState } from "react";
import {
  createProductWithImage,
  updateProductWithImage,
} from "../services/productApi";

export default function ProductForm({ onSuccess, initialProduct = null }) {
  const [formData, setFormData] = useState({
    name: initialProduct?.name || "",
    description: initialProduct?.description || "",
    price: initialProduct?.price || "",
    category: initialProduct?.category || "",
    zodiacSign: initialProduct?.zodiacSign || "כללי",
    stock: initialProduct?.stock || "",
    metals: initialProduct?.metals?.join(", ") || "",
    discountPrice: initialProduct?.discountPrice || "",
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(
    initialProduct?.images?.[0]?.url || null,
  );
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
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("category", formData.category);
      data.append("zodiacSign", formData.zodiacSign);
      data.append("stock", formData.stock);

      if (formData.metals) {
        data.append("metals", formData.metals);
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
        <label>שם המוצר *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="form-group">
        <label>תיאור *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          required
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
          <option value="מגן דוד">מגן דוד</option>
          <option value="חי">חי</option>
          <option value="חמסה">חמסה</option>
          <option value="מזוזה">מזוזה</option>
          <option value="אותיות">אותיות</option>
          <option value="אחר">אחר</option>
        </select>
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
