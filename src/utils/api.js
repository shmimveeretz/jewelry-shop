// API base URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
};

// Products API
export const productsAPI = {
  // Get all products with optional filters
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams();

    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all" && value !== "הכל") {
        queryParams.append(key, value);
      }
    });

    const queryString = queryParams.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ""}`;

    return await apiRequest(endpoint);
  },

  // Get single product by ID
  getById: async (id) => {
    return await apiRequest(`/products/${id}`);
  },

  // Create new product (admin only)
  create: async (productData, token) => {
    return await apiRequest("/products", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    });
  },

  // Update product (admin only)
  update: async (id, productData, token) => {
    return await apiRequest(`/products/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    });
  },

  // Delete product (admin only)
  delete: async (id, token) => {
    return await apiRequest(`/products/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Add review to product
  addReview: async (id, reviewData, token) => {
    return await apiRequest(`/products/${id}/reviews`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(reviewData),
    });
  },
};

export default { productsAPI };
