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
