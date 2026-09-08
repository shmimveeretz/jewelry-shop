import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  getLayoutPreference,
  resetLayoutPreference,
  saveDashboardWidgets,
  saveSidebarPreference,
} from "./adminApi";

const AdminPreferenceContext = createContext(null);

const EMPTY = { dashboardWidgets: [], sidebar: {}, preferences: {} };

/**
 * The admin's workspace arrangement.
 *
 * Saves are optimistic: the UI moves the moment a card is dropped and the
 * request goes out behind it. A failed save reverts and reports, because
 * silently losing an arrangement someone just made is worse than a brief
 * flicker.
 */
export function AdminPreferenceProvider({ children, onError }) {
  const [preference, setPreference] = useState(EMPTY);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getLayoutPreference()
      .then((data) => {
        if (cancelled) return;
        setPreference({ ...EMPTY, ...(data || {}) });
      })
      .catch(() => {
        // Never customized, or the request failed — either way the defaults
        // are a working workspace.
        if (!cancelled) setPreference(EMPTY);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(
    async (key, value, save) => {
      const previous = preference;
      setPreference((current) => ({ ...current, [key]: value }));

      try {
        await save(value);
      } catch (error) {
        setPreference(previous);
        onError?.(error.message || "לא הצלחנו לשמור את הפריסה");
      }
    },
    [preference, onError],
  );

  const updateWidgets = useCallback(
    (widgets) => persist("dashboardWidgets", widgets, saveDashboardWidgets),
    [persist],
  );

  const updateSidebar = useCallback(
    (sidebar) => persist("sidebar", sidebar, saveSidebarPreference),
    [persist],
  );

  const reset = useCallback(async () => {
    try {
      await resetLayoutPreference();
      setPreference(EMPTY);
    } catch (error) {
      onError?.(error.message || "לא הצלחנו לאפס את הפריסה");
    }
  }, [onError]);

  const value = useMemo(
    () => ({ preference, isLoading, updateWidgets, updateSidebar, reset }),
    [preference, isLoading, updateWidgets, updateSidebar, reset],
  );

  return (
    <AdminPreferenceContext.Provider value={value}>
      {children}
    </AdminPreferenceContext.Provider>
  );
}

export function useAdminPreference() {
  const context = useContext(AdminPreferenceContext);
  if (!context) {
    throw new Error("useAdminPreference must be used inside AdminPreferenceProvider");
  }
  return context;
}
