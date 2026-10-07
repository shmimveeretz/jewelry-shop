import { useCallback, useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../constants/api";

/**
 * Product catalog with a small shared cache.
 *
 * The navbar cart drawer, the home page (twice) and the shop all read the
 * catalog. Without sharing, one page view fired up to four identical
 * requests, and switching categories in the shop refetched everything. Now
 * each distinct server query is fetched once per CACHE_TTL_MS and concurrent
 * callers share the same in-flight request; category/price filters are
 * applied in memory.
 */
const CACHE_TTL_MS = 2 * 60 * 1000;
const cache = new Map(); // query -> { at, promise, data }

function buildQuery({ featured, limit }) {
  const params = new URLSearchParams();
  if (featured) params.set("featured", "true");
  if (limit) params.set("limit", String(limit));
  const query = params.toString();
  return query ? `?${query}` : "";
}

function fetchCatalog(query, { force = false } = {}) {
  const entry = cache.get(query);
  if (!force && entry && Date.now() - entry.at < CACHE_TTL_MS) {
    return entry.promise;
  }

  const promise = fetch(`${API_BASE_URL}/api/products${query}`)
    .then((response) => response.json())
    .then((data) => {
      if (!data.success || !Array.isArray(data.data)) {
        throw new Error(data.message || "Failed to load products");
      }
      return data.data;
    })
    .catch((error) => {
      // Never cache a failure: the next caller should retry.
      cache.delete(query);
      throw error;
    });

  cache.set(query, { at: Date.now(), promise });
  return promise;
}

export const useProducts = (filters = {}) => {
  const { featured, limit, category, minPrice, maxPrice } = filters;
  const query = buildQuery({ featured, limit });

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(
    (force = false) => {
      let cancelled = false;
      setLoading(true);
      setError(null);

      fetchCatalog(query, { force })
        .then((products) => {
          if (!cancelled) setAllProducts(products);
        })
        .catch((err) => {
          console.error("Error fetching products:", err);
          if (!cancelled) {
            setAllProducts([]);
            setError(err.message || "Connection error");
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });

      return () => {
        cancelled = true;
      };
    },
    [query],
  );

  useEffect(() => load(), [load]);

  const products = useMemo(() => {
    let list = allProducts;
    if (category && category !== "הכל") {
      list = list.filter((product) => product.category === category);
    }
    if (minPrice) list = list.filter((product) => product.price >= minPrice);
    if (maxPrice) list = list.filter((product) => product.price <= maxPrice);
    return list;
  }, [allProducts, category, minPrice, maxPrice]);

  const refetch = useCallback(() => {
    load(true);
  }, [load]);

  return { products, loading, error, refetch };
};
