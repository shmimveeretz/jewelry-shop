import {
  FaChartBar,
  FaBullhorn,
  FaFileAlt,
  FaRegWindowRestore,
  FaThLarge,
} from "react-icons/fa";

/**
 * Sidebar entries, declared rather than hardcoded in JSX.
 *
 * A user's AdminLayoutPreference stores only keys, so reordering or hiding an
 * item never stores a label or a URL that could go stale — and deleting an
 * entry here silently drops it from everyone's saved sidebar.
 */
export const NAV_REGISTRY = [
  {
    key: "dashboard",
    label: "לוח בקרה",
    to: "/admin",
    end: true,
    icon: FaThLarge,
    roles: ["admin", "roi"],
  },
  {
    key: "pages",
    label: "עמודי מוצר",
    to: "/admin/pages",
    icon: FaFileAlt,
    roles: ["admin", "roi"],
  },
  {
    key: "popups",
    label: "פופאפים",
    to: "/admin/popups",
    icon: FaRegWindowRestore,
    roles: ["admin", "roi"],
  },
  {
    key: "marketing",
    label: "מרכז שיווק",
    to: "/admin/marketing",
    icon: FaBullhorn,
    roles: ["admin", "roi"],
  },
  {
    key: "legacy",
    label: "ניהול החנות",
    description: "מוצרים, הזמנות, משתמשים, קופונים",
    to: "/admin/store",
    icon: FaChartBar,
    roles: ["admin", "roi"],
  },
];

const byKey = new Map(NAV_REGISTRY.map((item) => [item.key, item]));

/**
 * Applies the user's saved arrangement on top of the registry: pinned first,
 * then their explicit order, then anything added to the code since they last
 * saved (new items appear rather than vanishing).
 */
export function resolveNavItems(role, sidebar = {}) {
  const { order = [], hidden = [], pinned = [] } = sidebar;

  const allowed = NAV_REGISTRY.filter((item) => item.roles.includes(role));
  const allowedKeys = new Set(allowed.map((item) => item.key));

  const ordered = [
    ...pinned,
    ...order,
    ...allowed.map((item) => item.key),
  ].filter((key, index, keys) => allowedKeys.has(key) && keys.indexOf(key) === index);

  const hiddenSet = new Set(hidden);

  return ordered
    .filter((key) => !hiddenSet.has(key))
    .map((key) => ({ ...byKey.get(key), pinned: pinned.includes(key) }));
}

export function hiddenNavItems(role, sidebar = {}) {
  const hidden = new Set(sidebar.hidden || []);
  return NAV_REGISTRY.filter(
    (item) => item.roles.includes(role) && hidden.has(item.key),
  );
}
