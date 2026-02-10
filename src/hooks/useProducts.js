import { useState, useEffect } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const useProducts = (filters = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/products`);
      const data = await response.json();

      if (data.success && data.data) {
        let allProducts = data.data;

        // Apply filters
        if (filters.category && filters.category !== "הכל") {
          allProducts = allProducts.filter(
            (product) => product.category === filters.category,
          );
        }

        if (filters.minPrice) {
          allProducts = allProducts.filter(
            (product) => product.price >= filters.minPrice,
          );
        }

        if (filters.maxPrice) {
          allProducts = allProducts.filter(
            (product) => product.price <= filters.maxPrice,
          );
        }

        setProducts(allProducts);
        setError(null);
      } else {
        setError("Failed to load products");
        setProducts([]);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Connection error - make sure API is running");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [JSON.stringify(filters)]); // Re-fetch when filters change

  const refetch = () => {
    fetchProducts();
  };

  return {
    products,
    loading,
    error,
    refetch,
  };
};

export const useProduct = (id) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/api/products/${id}`);
        const data = await response.json();

        if (data.success) {
          setProduct(data.data);
        } else {
          setError("Product not found");
          setProduct(null);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Connection error - make sure API is running");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  return {
    product,
    loading,
    error,
  };
};
