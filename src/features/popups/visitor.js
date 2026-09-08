const VISITOR_KEY = "sve_visitor_id";
const SESSION_KEY = "sve_session_id";
const VISITED_KEY = "sve_has_visited";

const safeGet = (storage, key) => {
  try {
    return storage.getItem(key);
  } catch {
    // Private mode, or storage disabled entirely.
    return null;
  }
};

const safeSet = (storage, key, value) => {
  try {
    storage.setItem(key, value);
  } catch {
    // Nothing to do — the popup engine degrades to "treat as a new visitor".
  }
};

const newId = () =>
  crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;

/**
 * Stable per-browser id. Used only to keep A/B variant assignment and
 * frequency capping consistent between visits — never sent anywhere that
 * identifies a person.
 */
export const getVisitorId = () => {
  let id = safeGet(localStorage, VISITOR_KEY);
  if (!id) {
    id = newId();
    safeSet(localStorage, VISITOR_KEY, id);
  }
  return id;
};

export const getSessionId = () => {
  let id = safeGet(sessionStorage, SESSION_KEY);
  if (!id) {
    id = newId();
    safeSet(sessionStorage, SESSION_KEY, id);
  }
  return id;
};

/** True before the first visit is recorded, for `newVisitorsOnly` targeting. */
export const isNewVisitor = () => !safeGet(localStorage, VISITED_KEY);

export const markVisited = () => safeSet(localStorage, VISITED_KEY, "1");

/* ------------------------------ Frequency -------------------------------- */

const frequencyKey = (storageKey) => `sve_popup_${storageKey}`;

export const readFrequency = (storageKey) => {
  try {
    const raw = safeGet(localStorage, frequencyKey(storageKey));
    return raw ? JSON.parse(raw) : { count: 0, lastShownAt: 0 };
  } catch {
    return { count: 0, lastShownAt: 0 };
  }
};

export const recordImpression = (storageKey) => {
  const current = readFrequency(storageKey);
  safeSet(
    localStorage,
    frequencyKey(storageKey),
    JSON.stringify({ count: current.count + 1, lastShownAt: Date.now() }),
  );

  const sessionCount = Number(safeGet(sessionStorage, frequencyKey(storageKey)) || 0);
  safeSet(sessionStorage, frequencyKey(storageKey), String(sessionCount + 1));
};

export const sessionImpressions = (storageKey) =>
  Number(safeGet(sessionStorage, frequencyKey(storageKey)) || 0);

/** Set when a popup converts, so it stops competing for attention afterwards. */
export const markConverted = (storageKey) =>
  safeSet(localStorage, `${frequencyKey(storageKey)}_converted`, "1");

export const hasConverted = (storageKey) =>
  Boolean(safeGet(localStorage, `${frequencyKey(storageKey)}_converted`));
