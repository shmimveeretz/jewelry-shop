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

      const params = new URLSearchParams();
      if (filters.featured) params.set("featured", "true");
      if (filters.limit) params.set("limit", String(filters.limit));
      const query = params.toString() ? `?${params.toString()}` : "";

      const response = await fetch(`${API_BASE_URL}/api/products${query}`);
      const data = await response.json();

      if (data.success && data.data) {
        let allProducts = data.data;

        // #region agent log
        const rawCats = {};
        for (const p of allProducts) {
          rawCats[p.category] = (rawCats[p.category] || 0) + 1;
        }
        fetch('http://127.0.0.1:7344/ingest/04171ffe-b9c7-4a68-aa80-feae36360d3e',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e05af8'},body:JSON.stringify({sessionId:'e05af8',runId:'pre-fix',hypothesisId:'E',location:'useProducts.js:beforeFilter',message:'API products before client filter',data:{filterCategory:filters.category||null,total:allProducts.length,rawCats,shilatCount:rawCats['שילת']||0,symbolsCount:rawCats['סמלי בני ישראל']||0},timestamp:Date.now()})}).catch(()=>{});
        // #endregion

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
