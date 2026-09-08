import { Link } from "react-router-dom";
import {
  FaArrowDown,
  FaArrowUp,
  FaBoxOpen,
  FaEye,
  FaFileAlt,
  FaMoneyBillWave,
  FaPlus,
  FaRegWindowRestore,
  FaShoppingCart,
  FaUserPlus,
} from "react-icons/fa";
import DashboardCharts from "../../components/DashboardCharts";

const shekels = new Intl.NumberFormat("he-IL", {
  style: "currency",
  currency: "ILS",
  maximumFractionDigits: 0,
});

const percent = new Intl.NumberFormat("he-IL", {
  style: "percent",
  maximumFractionDigits: 1,
});

function Trend({ value }) {
  if (value === undefined || value === null) return null;
  const isUp = value >= 0;

  return (
    <span className={`admin-widget__trend ${isUp ? "is-up" : "is-down"}`}>
      {isUp ? <FaArrowUp /> : <FaArrowDown />}
      {Math.abs(value)}%
    </span>
  );
}

function StatWidget({ icon: Icon, label, value, trend, hint }) {
  return (
    <div className="admin-widget__stat">
      <span className="admin-widget__stat-icon">
        <Icon />
      </span>
      <div>
        <p className="admin-widget__stat-label">{label}</p>
        <p className="admin-widget__stat-value">{value}</p>
        {hint ? <p className="admin-widget__stat-hint">{hint}</p> : null}
      </div>
      <Trend value={trend} />
    </div>
  );
}

function EmptyNote({ children }) {
  return <p className="admin-widget__empty">{children}</p>;
}

/**
 * widgetKey -> definition. A user's saved layout stores only keys and spans,
 * so removing a widget from this file drops it from every saved dashboard
 * without a migration.
 */
export const WIDGET_REGISTRY = {
  revenue: {
    label: "הכנסות",
    defaultSpan: 3,
    render: ({ stats }) => (
      <StatWidget
        icon={FaMoneyBillWave}
        label="הכנסות בתקופה"
        value={shekels.format(stats?.revenue?.total || 0)}
        trend={stats?.revenue?.trend}
        hint={`סה"כ אי פעם: ${shekels.format(stats?.totalRevenue || 0)}`}
      />
    ),
  },
  orders: {
    label: "הזמנות",
    defaultSpan: 3,
    render: ({ stats }) => (
      <StatWidget
        icon={FaShoppingCart}
        label="הזמנות בתקופה"
        value={stats?.orders?.count ?? 0}
        trend={stats?.orders?.trend}
        hint={`סה"כ: ${stats?.totalOrders ?? 0}`}
      />
    ),
  },
  visits: {
    label: "כניסות",
    defaultSpan: 3,
    render: ({ stats }) => (
      <StatWidget
        icon={FaEye}
        label="כניסות בתקופה"
        value={stats?.visits?.count ?? 0}
        trend={stats?.visits?.trend}
        hint={`מבקרים ייחודיים: ${stats?.visits?.total ?? 0}`}
      />
    ),
  },
  newUsers: {
    label: "משתמשים חדשים",
    defaultSpan: 3,
    render: ({ stats }) => (
      <StatWidget
        icon={FaUserPlus}
        label="נרשמים חדשים"
        value={stats?.newUsers?.count ?? 0}
        trend={stats?.newUsers?.trend}
        hint={`ניוזלטר: ${stats?.newsletterSubscribers ?? 0}`}
      />
    ),
  },
  charts: {
    label: "גרפים",
    defaultSpan: 12,
    render: ({ stats }) => <DashboardCharts charts={stats?.charts} />,
  },
  campaignPages: {
    label: "עמודי קמפיין",
    defaultSpan: 6,
    render: ({ pages }) => {
      const published = (pages || []).filter(
        (page) => page.status === "published",
      );

      if (published.length === 0) {
        return (
          <EmptyNote>
            אין עדיין עמודי מוצר שפורסמו.{" "}
            <Link to="/admin/pages">בנו את הראשון</Link>
          </EmptyNote>
        );
      }

      return (
        <ul className="admin-widget__list">
          {published.slice(0, 6).map((page) => (
            <li key={page._id}>
              <Link to={`/admin/pages/${page._id}`}>{page.internalName}</Link>
              <a
                href={`/lp/${page.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-widget__list-meta"
              >
                /lp/{page.slug}
              </a>
            </li>
          ))}
        </ul>
      );
    },
  },
  popupPerformance: {
    label: "ביצועי פופאפים",
    defaultSpan: 6,
    render: ({ popups }) => {
      const active = (popups || []).filter((popup) => popup.status === "active");

      if (active.length === 0) {
        return (
          <EmptyNote>
            אין פופאפים פעילים.{" "}
            <Link to="/admin/popups">הפעילו אחד</Link>
          </EmptyNote>
        );
      }

      return (
        <ul className="admin-widget__list">
          {active.slice(0, 6).map((popup) => {
            const rate =
              popup.impressions > 0 ? popup.conversions / popup.impressions : 0;

            return (
              <li key={popup._id}>
                <Link to={`/admin/popups/${popup._id}`}>{popup.name}</Link>
                <span className="admin-widget__list-meta">
                  {popup.impressions} הצגות · {percent.format(rate)} המרה
                </span>
              </li>
            );
          })}
        </ul>
      );
    },
  },
  quickActions: {
    label: "פעולות מהירות",
    defaultSpan: 12,
    render: () => (
      <div className="admin-widget__actions">
        <Link to="/admin/pages" className="admin-widget__action">
          <FaPlus />
          עמוד מוצר חדש
        </Link>
        <Link to="/admin/popups" className="admin-widget__action">
          <FaRegWindowRestore />
          פופאפ חדש
        </Link>
        <Link to="/admin/store" className="admin-widget__action">
          <FaBoxOpen />
          ניהול מוצרים
        </Link>
        <Link to="/admin/store" className="admin-widget__action">
          <FaFileAlt />
          הזמנות
        </Link>
      </div>
    ),
  },
};

/** Shown to an admin who has never rearranged anything. */
export const DEFAULT_DASHBOARD_LAYOUT = [
  { widgetKey: "revenue", visible: true, span: 3 },
  { widgetKey: "orders", visible: true, span: 3 },
  { widgetKey: "visits", visible: true, span: 3 },
  { widgetKey: "newUsers", visible: true, span: 3 },
  { widgetKey: "quickActions", visible: true, span: 12 },
  { widgetKey: "campaignPages", visible: true, span: 6 },
  { widgetKey: "popupPerformance", visible: true, span: 6 },
  { widgetKey: "charts", visible: true, span: 12 },
];

/**
 * Merges a saved layout with the registry: unknown keys are dropped and
 * widgets added to the code since the last save are appended, so neither
 * side can strand the other.
 */
export function resolveWidgets(saved) {
  const base = saved?.length > 0 ? saved : DEFAULT_DASHBOARD_LAYOUT;

  const known = base.filter((widget) => WIDGET_REGISTRY[widget.widgetKey]);
  const present = new Set(known.map((widget) => widget.widgetKey));

  const added = DEFAULT_DASHBOARD_LAYOUT.filter(
    (widget) => !present.has(widget.widgetKey),
  );

  return [...known, ...added];
}
