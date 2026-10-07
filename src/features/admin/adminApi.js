import { API_BASE_URL } from "../../constants/api";

/**
 * Thin authenticated client for the marketing CMS endpoints.
 *
 * Throws an Error carrying the server's Hebrew message so callers can surface
 * it straight through the existing toast system.
 */
const request = async (path, { method = "GET", body, signal } = {}) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/api${path}`, {
    method,
    signal,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const raw = await response.text();
  const payload = raw ? JSON.parse(raw) : {};

  if (!response.ok || payload.success === false) {
    const error = new Error(payload.message || "אירעה שגיאה");
    error.status = response.status;
    error.details = payload.errors;
    throw error;
  }

  return payload.data;
};

/* ----------------------------- Product pages ----------------------------- */

export const listProductPages = (params = {}) => {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value),
  ).toString();
  return request(`/admin/product-pages${query ? `?${query}` : ""}`);
};

export const createProductPage = (body) =>
  request("/admin/product-pages", { method: "POST", body });

export const getProductPage = (id) => request(`/admin/product-pages/${id}`);

export const updateProductPage = (id, body) =>
  request(`/admin/product-pages/${id}`, { method: "PUT", body });

export const saveProductPageBlocks = (id, blocks, theme) =>
  request(`/admin/product-pages/${id}/blocks`, {
    method: "PATCH",
    body: { blocks, theme },
  });

export const publishProductPage = (id) =>
  request(`/admin/product-pages/${id}/publish`, { method: "POST" });

export const unpublishProductPage = (id) =>
  request(`/admin/product-pages/${id}/unpublish`, { method: "POST" });

export const duplicateProductPage = (id, slug) =>
  request(`/admin/product-pages/${id}/duplicate`, {
    method: "POST",
    body: { slug },
  });

export const restoreRevision = (id, index) =>
  request(`/admin/product-pages/${id}/revisions/${index}/restore`, {
    method: "POST",
  });

export const archiveProductPage = (id) =>
  request(`/admin/product-pages/${id}`, { method: "DELETE" });

export const createPreviewToken = (id) =>
  request(`/admin/product-pages/${id}/preview-token`, { method: "POST" });

export const getBlockTypes = () => request("/admin/block-types");

/* --------------------------------- Popups -------------------------------- */

export const listPopups = (params = {}) => {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value),
  ).toString();
  return request(`/admin/popups${query ? `?${query}` : ""}`);
};

export const createPopup = (body) =>
  request("/admin/popups", { method: "POST", body });

export const getPopup = (id) => request(`/admin/popups/${id}`);

export const updatePopup = (id, body) =>
  request(`/admin/popups/${id}`, { method: "PUT", body });

export const setPopupStatus = (id, status) =>
  request(`/admin/popups/${id}/status`, { method: "PATCH", body: { status } });

export const duplicatePopup = (id) =>
  request(`/admin/popups/${id}/duplicate`, { method: "POST" });

export const getPopupStats = (id) => request(`/admin/popups/${id}/stats`);

export const resetPopupStats = (id) =>
  request(`/admin/popups/${id}/stats/reset`, { method: "POST" });

export const deletePopup = (id) =>
  request(`/admin/popups/${id}`, { method: "DELETE" });

/* --------------------------- Layout preference --------------------------- */

export const getLayoutPreference = () => request("/admin/layout-preference");

export const saveDashboardWidgets = (dashboardWidgets) =>
  request("/admin/layout-preference/widgets", {
    method: "PATCH",
    body: { dashboardWidgets },
  });

export const saveSidebarPreference = (sidebar) =>
  request("/admin/layout-preference/sidebar", {
    method: "PATCH",
    body: { sidebar },
  });

export const resetLayoutPreference = () =>
  request("/admin/layout-preference", { method: "DELETE" });

/* --------------------------------- Misc ---------------------------------- */

// The server understands day | week | month | year | all, and silently falls
// back to month for anything else — so the default names it outright.
export const getAdminStats = (period = "month") =>
  request(`/admin/stats?period=${encodeURIComponent(period)}`);
