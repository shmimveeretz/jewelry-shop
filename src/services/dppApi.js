import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Reads the payload the Netlify edge function injected into the HTML.
 *
 * Consumed once: after a client-side navigation to a different /lp/ page the
 * injected state belongs to the previous URL, so it is removed as soon as it
 * has been handed over.
 */
export const readInjectedDppState = (slug) => {
  if (typeof window === "undefined") return null;

  const injected = window.__DPP_INITIAL_STATE__;
  if (!injected?.data) return null;

  delete window.__DPP_INITIAL_STATE__;

  // The edge records which slug it fetched for; anything else is stale.
  if (injected.slug && injected.slug !== slug) return null;

  return injected.data;
};

/**
 * Layout + product + popups in one request.
 * Throws `{ notFound: true }` so the page can tell a retired product apart
 * from a network failure and render the right state.
 */
export const getDppBootstrap = async (slug, { signal } = {}) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/dpp/${encodeURIComponent(slug)}`,
      { signal },
    );
    return response.data.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw { notFound: true, message: error.response.data?.message };
    }
    throw error;
  }
};

/** Draft layout for the admin preview iframe. */
export const getDppPreview = async (slug, token, { signal } = {}) => {
  const response = await axios.get(
    `${API_BASE_URL}/api/dpp/${encodeURIComponent(slug)}/preview`,
    { params: { token }, signal },
  );
  return response.data.data;
};
