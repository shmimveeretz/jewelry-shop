import { useState, useEffect } from "react";
import { productsAPI } from "../utils/api";
import { hebrewLettersData } from "../data/hebrewLetters";
import { hoshenStonesData } from "../data/hoshenStones";
import { zodiacPendantsData } from "../data/zodiacPendants";
import { trinityPendantsData } from "../data/trinityPendants";

export const useProducts = (filters = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch from API first
      const response = await productsAPI.getAll(filters);

      let apiProducts = [];
      if (response.success) {
        apiProducts = response.data || [];
      }

      // Add local data collections to products
      let allProducts = [
        ...hebrewLettersData,
        ...hoshenStonesData,
        ...zodiacPendantsData,
        ...trinityPendantsData,
        ...apiProducts,
      ];

      // Apply filters
      if (filters.category && filters.category !== "הכל") {
        allProducts = allProducts.filter(
          (product) => product.category === filters.category
        );
      }

      setProducts(allProducts);
      setError(null);
    } catch (err) {
      console.error("Error fetching products:", err);
      // If API fails, still show local data collections
      let allProducts = [
        ...hebrewLettersData,
        ...hoshenStonesData,
        ...zodiacPendantsData,
        ...trinityPendantsData,
      ];

      // Apply filters
      if (filters.category && filters.category !== "הכל") {
        allProducts = allProducts.filter(
          (product) => product.category === filters.category
        );
      }

      setProducts(allProducts);
      setError(null); // Don't show error if we have local data
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

        const response = await productsAPI.getById(id);

        if (response.success) {
          setProduct(response.data);
        } else {
          setError(response.message || "מוצר לא נמצא");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("שגיאה בטעינת המוצר. אנא נסה שוב מאוחר יותר.");
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
