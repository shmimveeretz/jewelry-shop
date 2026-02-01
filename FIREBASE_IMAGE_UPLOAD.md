# 📱 Frontend - Image Upload Integration

**Last Updated:** February 1, 2026  
**Status:** Ready for Implementation

---

## 📋 Overview

Frontend needs to support image uploads for products. Images are stored in **Firebase Storage** (FREE, up to 1GB/month).

---

## 🔌 API Endpoint

### **Create Product with Image**

**Endpoint:** `POST /api/products`

**Request Format:** `multipart/form-data`

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data
```

**Form Fields:**

```
name:              אלף
description:       תיאור המוצר
price:             890
category:          אותיות עבריות
zodiacSign:        (optional) כללי
stock:             (optional) 10
metals:            (optional) זהב, כסף
discountPrice:     (optional) 750
image:             (FILE) image.jpg
```

**Response - Success (201):**

```json
{
  "success": true,
  "message": "מוצר נוצר בהצלחה",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "אלף",
    "description": "תיאור המוצר",
    "price": 890,
    "category": "אותיות עבריות",
    "images": [
      {
        "url": "https://storage.googleapis.com/shamayim-vaaretz.appspot.com/products/1706790000_abc123.jpg",
        "alt": "אלף"
      }
    ],
    "stock": 10,
    "isAvailable": true,
    "createdAt": "2026-02-01T10:00:00Z"
  }
}
```

**Response - Error (400):**

```json
{
  "success": false,
  "message": "שם, מחיר, תיאור וקטגוריה נדרשים"
}
```

---

## 💻 Frontend Implementation

### **Step 1: Create API Service Function**

**File:** `src/services/productApi.js`

```javascript
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const createProductWithImage = async (formData, token) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/products`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("❌ Product creation error:", error);
    throw error.response?.data || error.message;
  }
};

export const updateProductWithImage = async (productId, formData, token) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/api/products/${productId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("❌ Product update error:", error);
    throw error.response?.data || error.message;
  }
};

export const getAllProducts = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/products`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    throw error.response?.data || error.message;
  }
};

export const deleteProduct = async (productId, token) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/api/products/${productId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("❌ Product delete error:", error);
    throw error.response?.data || error.message;
  }
};
```

---

### **Step 2: Create Form Component**

**File:** `src/components/ProductForm.jsx`

```javascript
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
```

---

### **Step 3: CSS Styling**

**File:** `src/styles/productForm.css`

```css
.product-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #333;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.image-preview {
  max-width: 200px;
  margin-top: 10px;
  border-radius: 4px;
}

button[type="submit"] {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  width: 100%;
}

button[type="submit"]:hover {
  background-color: #0056b3;
}

button[type="submit"]:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
}
```

---

### **Step 4: Use in Admin Page**

**File:** `src/pages/Admin.jsx`

```javascript
import ProductForm from "../components/ProductForm";
import { useState, useEffect } from "react";
import { getAllProducts, deleteProduct } from "../services/productApi";

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);

  const loadProducts = async () => {
    try {
      const result = await getAllProducts();
      if (result.success) {
        setProducts(result.data);
      }
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleProductSuccess = (product) => {
    setEditingProduct(null);
    loadProducts();
  };

  const handleDeleteProduct = async (productId) => {
    if (confirm("האם בטוח לחוק את המוצר?")) {
      try {
        const token = localStorage.getItem("token");
        const result = await deleteProduct(productId, token);
        if (result.success) {
          alert("המוצר נמחק בהצלחה");
          loadProducts();
        }
      } catch (error) {
        alert("שגיאה: " + error.message);
      }
    }
  };

  return (
    <div className="admin-page">
      <h1>ניהול מוצרים</h1>

      <ProductForm
        onSuccess={handleProductSuccess}
        initialProduct={editingProduct}
      />

      <div className="products-list">
        <h2>מוצרים קיימים</h2>
        {products.map((product) => (
          <div key={product._id} className="product-item">
            {product.images?.[0] && (
              <img src={product.images[0].url} alt={product.name} />
            )}
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p>מחיר: ₪{product.price}</p>
            <button onClick={() => setEditingProduct(product)}>עדכן</button>
            <button onClick={() => handleDeleteProduct(product._id)}>
              מחק
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## ✅ Image Upload Process

```
1. User selects image file
2. Frontend creates FormData with all product info + image
3. FormData sent to POST /api/products
4. Backend uploads image to Firebase Storage
5. Backend saves product with Firebase image URL to MongoDB
6. Response includes image URL
7. Frontend displays image
```

---

## 🔐 Security

- ✅ Image validation in backend (only certain MIME types)
- ✅ Maximum file size: 10MB
- ✅ Images stored in Firebase (encrypted)
- ✅ Only authenticated users can upload (Bearer token required)
- ✅ Only admin/roi can create products

---

## 📊 File Size Limits

```
Max file size: 10MB
Recommended: Under 5MB for faster upload
Firebase free tier: 1GB/month storage
```

---

## 🧪 Testing

### **Using cURL:**

```bash
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "name=אלף" \
  -F "description=תכשיט יהלום" \
  -F "price=890" \
  -F "category=אותיות" \
  -F "stock=10" \
  -F "image=@/path/to/image.jpg"
```

### **Using Postman:**

1. POST to `http://localhost:5000/api/products`
2. Headers: `Authorization: Bearer TOKEN`
3. Body: `form-data`
4. Add fields: name, description, price, category, stock
5. Add file field: name=`image`, type=`File`
6. Select image file
7. Send

---

## 🚀 Deployment

When deployed to production:

1. Backend on Render (with Firebase credentials)
2. Frontend on Netlify/Vercel
3. Firebase Storage auto-scales
4. Images served from Firebase CDN

---

## ❌ Common Issues

**Issue:** "Failed to upload image"

- **Solution:** Check Firebase is configured, file size < 10MB

**Issue:** "Image URL returns 403"

- **Solution:** Verify Firebase Storage permissions (should be public)

**Issue:** "CORS error when uploading"

- **Solution:** Backend CORS should include frontend URL

---

## 📚 Reference

- Firebase Storage: https://firebase.google.com/docs/storage
- FormData API: https://developer.mozilla.org/en-US/docs/Web/API/FormData
- Axios File Upload: https://github.com/axios/axios#handling-multipart-form-data

---

**Status:** ✅ Ready for Implementation
