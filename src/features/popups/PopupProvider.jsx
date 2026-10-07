import {
  createContext,
  lazy,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { sendPopupEvent } from "./popupEvents";
import { useTrigger } from "./useTrigger";
import { detectDevice, isEligible, pickVariant } from "./targeting";
import { markConverted, markVisited, recordImpression } from "./visitor";
import { API_BASE_URL } from "../../constants/api";

const POPUP_FREE_PREFIXES = [
  "/checkout",
  "/cart",
  "/payment",
  "/login",
  "/forgot-password",
  "/verify-code",
  "/change-password",
  "/unsubscribe",
  "/admin",
];


const PopupContext = createContext(null);

/**
 * The rendering half is split out: most visitors never see a popup, and every
 * page of the site pays for whatever sits in the eager bundle. The chunk loads
 * while the trigger is firing, which is well before anyone could interact.
 */
const PopupHost = lazy(() => import("./PopupHost"));

/**
 * Site-wide popup runtime.
 *
 * Rules come from the server; when and to whom they fire is decided here.
 * Only ever one popup on screen: they are ranked by priority and the rest wait
 * for the next page view, because two simultaneous popups convert neither.
 *
 * Lives above the Router so a popup survives client-side navigation, and
 * renders through a portal so it can never be clipped by a page's own
 * stacking or overflow rules.
 */
export function PopupProvider({ children }) {
  const { pathname } = useLocation();
  const { language } = useLanguage();

  const [rules, setRules] = useState([]);
  const [shownIds, setShownIds] = useState([]);
  const [active, setActive] = useState(null);
  const [device, setDevice] = useState(detectDevice);

  // Set by DppPage: campaign pages already received their popups inside the
  // bootstrap payload, so fetching them again would be a wasted round trip on
  // the one page where latency matters most.
  const registeredPath = useRef(null);

  // Id of the popup whose outcome has already been reported, so a conversion
  // followed by a close is not also counted as a dismissal.
  const reportedRef = useRef(null);

  useEffect(() => {
    markVisited();
  }, []);

  useEffect(() => {
    const onResize = () => setDevice(detectDevice());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // A new page view resets what has been shown, so an exit-intent offer can
  // reappear later in the session if its frequency rules still allow it.
  useEffect(() => {
    setShownIds([]);
    setActive(null);
  }, [pathname]);

  useEffect(() => {
    if (registeredPath.current === pathname) return undefined;

    // Never interrupt a purchase, a login or the admin — whatever the
    // popup's own path rules say ("all pages" included).
    if (POPUP_FREE_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
      setRules([]);
      return undefined;
    }

    const controller = new AbortController();

    fetch(
      `${API_BASE_URL}/api/popups/active?path=${encodeURIComponent(pathname)}`,
      { signal: controller.signal },
    )
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => setRules(payload?.data || []))
      .catch(() => {
        // A popup that fails to load is a non-event for the visitor.
      });

    return () => controller.abort();
  }, [pathname]);

  const registerPopups = useCallback(
    (popups, path) => {
      registeredPath.current = path ?? pathname;
      setRules(popups || []);
    },
    [pathname],
  );

  const candidate = useMemo(() => {
    if (active) return null;

    return (
      rules
        .filter((popup) => !shownIds.includes(popup._id))
        // The server already sorts by priority; this keeps that guarantee if
        // rules ever arrive from somewhere else.
        .sort((a, b) => (b.priority || 0) - (a.priority || 0))
        .find((popup) => isEligible(popup, { language, device })) || null
    );
  }, [rules, shownIds, active, language, device]);

  const handleFire = useCallback(() => {
    if (!candidate) return;

    const variant = pickVariant(candidate);
    if (!variant) return;

    recordImpression(candidate.frequency.storageKey);
    sendPopupEvent(candidate._id, variant.key, "impression");
    setActive({ popup: candidate, variant });
  }, [candidate]);

  useTrigger(candidate, handleFire);

  /**
   * `keepOpen` covers the case where converting produces something the visitor
   * still needs to read — a coupon code. The outcome is reported immediately
   * but the dialog stays up until they close it, and the guard below makes
   * sure that second close does not also count as a dismissal.
   */
  const close = useCallback(
    (outcome, { keepOpen = false } = {}) => {
      if (!active) return;

      const { popup, variant } = active;

      if (reportedRef.current !== popup._id) {
        reportedRef.current = popup._id;

        if (outcome === "converted") {
          markConverted(popup.frequency.storageKey);
          sendPopupEvent(popup._id, variant.key, "conversion");
        } else {
          sendPopupEvent(popup._id, variant.key, "dismissal");
        }
      }

      if (keepOpen) return;

      setShownIds((current) => [...current, popup._id]);
      setActive(null);
    },
    [active],
  );

  const value = useMemo(() => ({ registerPopups }), [registerPopups]);

  return (
    <PopupContext.Provider value={value}>
      {children}
      {active ? (
        <Suspense fallback={null}>
          <PopupHost
            popup={active.popup}
            variant={active.variant}
            onClose={close}
          />
        </Suspense>
      ) : null}
    </PopupContext.Provider>
  );
}

/**
 * Lets a page hand its own popup rules to the runtime instead of triggering a
 * second fetch. Safe to call when the provider is absent (the admin preview
 * iframe renders DppPage without it).
 */
export function usePopupRegistry() {
  return useContext(PopupContext);
}
