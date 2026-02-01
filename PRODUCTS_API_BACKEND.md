# 📦 Products API - Backend Implementation

**Last Updated:** February 1, 2026  
**Frontend Status:** ✅ Ready - Requires Backend Endpoints

---

## 📋 Overview

Frontend has been updated to fetch all products from **MongoDB collection "products"** instead of JSON files.

**Update made:**
- ✅ Admin.jsx - Loads products from API, supports Create/Update/Delete
- ✅ Shop.jsx - Uses useProducts hook with API fallback
- ✅ useProducts.js hook - Fetches from MongoDB API

---

## 🔌 Required API Endpoints

### 1️⃣ GET ALL PRODUCTS

**Endpoint:** `GET /api/products`

**Query Parameters (optional):**
- `category` - Filter by category
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `limit` - Items per page (default: 100)
- `page` - Page number (default: 1)

**Response - Success (200):**
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "אלף",
      "nameEn": "Aleph",
      "category": "אותיות עבריות",
      "categoryEn": "Hebrew Letters",
      "description": "תיאור המוצר",
      "descriptionEn": "Product description",
      "price": 890,
      "images": [
        "https://example.com/image1.jpg"
      ],
      "metals": ["זהב", "כסף"],
      "status": "active",
      "createdAt": "2026-02-01T10:00:00Z",
      "updatedAt": "2026-02-01T10:00:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 100
}
```

**Response - Error (500):**
```json
{
  "success": false,
  "message": "Error retrieving products"
}
```

**Implementation:**
```javascript
// routes/productRoutes.js
router.get('/products', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, limit = 100, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    let filter = { status: 'active' };
    
    if (category && category !== 'הכל') {
      filter.category = category;
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Fetch products
    const products = await Product.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      message: 'Products retrieved successfully',
      data: products,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
```

---

### 2️⃣ GET SINGLE PRODUCT

**Endpoint:** `GET /api/products/:id`

**Response - Success (200):**
```json
{
  "success": true,
  "message": "Product retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "אלף",
    "nameEn": "Aleph",
    "category": "אותיות עבריות",
    "categoryEn": "Hebrew Letters",
    "description": "תיאור המוצר",
    "descriptionEn": "Product description",
    "price": 890,
    "images": ["https://example.com/image1.jpg"],
    "metals": ["זהב", "כסף"],
    "status": "active",
    "createdAt": "2026-02-01T10:00:00Z",
    "updatedAt": "2026-02-01T10:00:00Z"
  }
}
```

**Response - Error (404):**
```json
{
  "success": false,
  "message": "Product not found"
}
```

**Implementation:**
```javascript
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product retrieved successfully',
      data: product
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
```

---

### 3️⃣ CREATE PRODUCT

**Endpoint:** `POST /api/products`

**Authentication:** Required (Bearer Token)  
**Authorization:** Admin or ROI role

**Request Body:**
```json
{
  "name": "אלף",
  "nameEn": "Aleph",
  "category": "אותיות עבריות",
  "categoryEn": "Hebrew Letters",
  "description": "תיאור המוצר",
  "descriptionEn": "Product description",
  "price": 890,
  "images": ["https://example.com/image1.jpg"],
  "metals": ["זהב", "כסף"],
  "status": "active"
}
```

**Response - Success (201):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "אלף",
    "nameEn": "Aleph",
    "category": "אותיות עבריות",
    "categoryEn": "Hebrew Letters",
    "description": "תיאור המוצר",
    "descriptionEn": "Product description",
    "price": 890,
    "images": ["https://example.com/image1.jpg"],
    "metals": ["זהב", "כסף"],
    "status": "active",
    "createdAt": "2026-02-01T10:00:00Z",
    "updatedAt": "2026-02-01T10:00:00Z"
  }
}
```

**Response - Error (400):**
```json
{
  "success": false,
  "message": "Missing required fields"
}
```

**Implementation:**
```javascript
router.post('/products', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, nameEn, category, categoryEn, price, images, metals, description, descriptionEn, status } = req.body;

    // Validate required fields
    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Create product
    const product = new Product({
      name,
      nameEn: nameEn || name,
      category,
      categoryEn: categoryEn || category,
      description: description || '',
      descriptionEn: descriptionEn || '',
      price: parseFloat(price),
      images: Array.isArray(images) ? images : [],
      metals: Array.isArray(metals) ? metals : [],
      status: status || 'active',
      createdBy: req.user._id
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
```

---

### 4️⃣ UPDATE PRODUCT

**Endpoint:** `PUT /api/products/:id`

**Authentication:** Required (Bearer Token)  
**Authorization:** Admin or ROI role

**Request Body:** (same as CREATE, all fields optional)

**Response - Success (200):**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": { ... }
}
```

**Implementation:**
```javascript
router.put('/products/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, nameEn, category, categoryEn, price, images, metals, description, descriptionEn, status } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update fields
    if (name) product.name = name;
    if (nameEn) product.nameEn = nameEn;
    if (category) product.category = category;
    if (categoryEn) product.categoryEn = categoryEn;
    if (price) product.price = parseFloat(price);
    if (description) product.description = description;
    if (descriptionEn) product.descriptionEn = descriptionEn;
    if (images) product.images = Array.isArray(images) ? images : [];
    if (metals) product.metals = Array.isArray(metals) ? metals : [];
    if (status) product.status = status;

    await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
```

---

### 5️⃣ DELETE PRODUCT

**Endpoint:** `DELETE /api/products/:id`

**Authentication:** Required (Bearer Token)  
**Authorization:** Admin or ROI role

**Response - Success (200):**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

**Implementation:**
```javascript
router.delete('/products/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
```

---

## 🗄️ Product Model (MongoDB Schema)

```javascript
// models/Product.js
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  nameEn: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  categoryEn: {
    type: String,
    required: true
  },
  description: String,
  descriptionEn: String,
  price: {
    type: Number,
    required: true
  },
  images: [String], // Array of image URLs
  metals: [String], // Array of metal types
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);
```

---

## 📊 Database Migration

### Migrate JSON Data to MongoDB

Run this script to populate MongoDB with existing JSON data:

```javascript
// scripts/migrateProducts.js
const mongoose = require('mongoose');
const Product = require('../models/Product');
const { hebrewLettersData } = require('../data/hebrewLetters');
const { hoshenStonesData } = require('../data/hoshenStones');
const { zodiacPendantsData } = require('../data/zodiacPendants');
const { trinityPendantsData } = require('../data/trinityPendants');

async function migrateProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);

    // Clear existing products (optional)
    await Product.deleteMany({});

    // Insert all products
    const allProducts = [
      ...hebrewLettersData,
      ...hoshenStonesData,
      ...zodiacPendantsData,
      ...trinityPendantsData
    ];

    // Add status field if missing
    const productsToInsert = allProducts.map(p => ({
      ...p,
      status: 'active'
    }));

    const result = await Product.insertMany(productsToInsert);

    console.log(`✅ Migrated ${result.length} products to MongoDB`);
    process.exit(0);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateProducts();
```

**Run migration:**
```bash
node scripts/migrateProducts.js
```

---

## 🔐 Middleware Requirements

Both Admin and ROI can create/update/delete products:

```javascript
// middleware/adminMiddleware.js
const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'roi') {
    return res.status(403).json({
      success: false,
      message: 'Only admin or ROI can access this resource'
    });
  }

  next();
};

module.exports = adminMiddleware;
```

---

## 🧪 Testing

### Test 1: Get All Products
```bash
curl http://localhost:5000/api/products
```

### Test 2: Get Product by ID
```bash
curl http://localhost:5000/api/products/507f1f77bcf86cd799439011
```

### Test 3: Create Product
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "אלף",
    "nameEn": "Aleph",
    "category": "אותיות עבריות",
    "categoryEn": "Hebrew Letters",
    "price": 890,
    "images": ["https://example.com/image.jpg"],
    "metals": ["זהב"],
    "status": "active"
  }'
```

### Test 4: Update Product
```bash
curl -X PUT http://localhost:5000/api/products/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"price": 950}'
```

### Test 5: Delete Product
```bash
curl -X DELETE http://localhost:5000/api/products/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📈 Database Indexes

```javascript
// Create indexes for better performance
db.products.createIndex({ "category": 1 })
db.products.createIndex({ "status": 1 })
db.products.createIndex({ "price": 1 })
db.products.createIndex({ "createdAt": -1 })
db.products.createIndex({ "name": "text", "description": "text" })  // For search
```

---

## ✅ Implementation Checklist

- [ ] Create Product model
- [ ] Create product routes
- [ ] Implement GET /api/products endpoint
- [ ] Implement GET /api/products/:id endpoint
- [ ] Implement POST /api/products endpoint
- [ ] Implement PUT /api/products/:id endpoint
- [ ] Implement DELETE /api/products/:id endpoint
- [ ] Create migration script
- [ ] Migrate existing JSON data to MongoDB
- [ ] Create database indexes
- [ ] Test all endpoints
- [ ] Deploy to production

---

## 🔗 Frontend Integration

**Files updated:**
- `src/pages/Admin.jsx` - Uses new API endpoints
- `src/hooks/useProducts.js` - Fetches from API
- `src/pages/Shop.jsx` - Uses useProducts hook

**Fallback mechanism:**
- If API fails, uses local JSON data
- No interruption to user experience
- Error logged to console

---

## 🚀 Deployment

Once endpoints are ready:
1. Deploy backend with new endpoints
2. Frontend will automatically start using them
3. Fallback to JSON ensures smooth transition

---

**Status:** 🔴 AWAITING BACKEND IMPLEMENTATION

Frontend is ready and waiting for:
1. ✅ GET /api/products
2. ✅ GET /api/products/:id
3. ✅ POST /api/products
4. ✅ PUT /api/products/:id
5. ✅ DELETE /api/products/:id

All tests pass with fallback data!
