/**
 * Backend origin, without a trailing slash. Set VITE_API_URL per environment
 * (Netlify sets it for production builds); the fallbacks only cover a local
 * dev server and a production build that forgot to set it.
 */
export const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:5000" : "https://jewelry-shop-udr7.onrender.com")
).replace(/\/+$/, "");
