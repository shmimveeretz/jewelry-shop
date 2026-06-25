const DISMISS_KEY = "motd_dismissed_id";
const MAX_MOTD_LENGTH = 180;

export const normalizeMotd = (value) => {
  if (typeof value !== "string") return "";
  return value.replace(/<[^>]*>/g, "").trim().slice(0, MAX_MOTD_LENGTH);
};

export const getMotdMessages = (...values) =>
  values.map(normalizeMotd).filter(Boolean);

export const getMotdFingerprint = (...values) =>
  getMotdMessages(...values).join("\x1e");

export const hashMotd = (text) => {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (Math.imul(31, hash) + text.charCodeAt(i)) | 0;
  }
  return `motd_${hash >>> 0}`;
};

export const isMotdDismissed = (...values) => {
  const fingerprint = getMotdFingerprint(...values);
  if (!fingerprint) return true;
  try {
    return sessionStorage.getItem(DISMISS_KEY) === hashMotd(fingerprint);
  } catch {
    return false;
  }
};

export const dismissMotd = (...values) => {
  const fingerprint = getMotdFingerprint(...values);
  if (!fingerprint) return;
  try {
    sessionStorage.setItem(DISMISS_KEY, hashMotd(fingerprint));
  } catch {
    // Ignore storage errors (private mode, etc.)
  }
};

export { MAX_MOTD_LENGTH };
