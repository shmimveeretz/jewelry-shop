import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaCheck,
  FaExclamationTriangle,
  FaExternalLinkAlt,
  FaFileAlt,
  FaInfoCircle,
  FaLink,
  FaPlus,
  FaRegWindowRestore,
} from "react-icons/fa";
import { useToast } from "../../../context/ToastContext";
import { getAdminStats, listPopups, listProductPages } from "../adminApi";
import { buildInsights, summarize } from "./hubInsights";
import "../../../styles/admin/DppBuilder.css";
import "../../../styles/admin/MarketingHub.css";

const percent = new Intl.NumberFormat("he-IL", {
  style: "percent",
  maximumFractionDigits: 1,
});

const SEVERITY_ICON = {
  warn: FaExclamationTriangle,
  info: FaInfoCircle,
};

/** The live campaign URL, which is what actually gets pasted into an ad. */
const pageUrl = (slug) => `${window.location.origin}/lp/${slug}`;

function StatCard({ label, value, sub }) {
  return (
    <div className="mhub-stat">
      <span className="mhub-stat__value">{value}</span>
      <span className="mhub-stat__label">{label}</span>
      {sub ? <span className="mhub-stat__sub">{sub}</span> : null}
    </div>
  );
}

function MarketingHub() {
  const { showSuccess, showError } = useToast();
  const [data, setData] = useState(null);
  const [copiedSlug, setCopiedSlug] = useState(null);

  useEffect(() => {
    // One pass for the whole hub: the two lists feed the counters, the tables
    // and the insight rules alike, so there is nothing to fetch per section.
    Promise.all([
      listProductPages().catch(() => []),
      listPopups().catch(() => []),
      getAdminStats("month").catch(() => null),
    ])
      .then(([pages, popups, stats]) => setData({ pages, popups, stats }))
      .catch((error) => showError(error.message));
  }, [showError]);

  const copyUrl = async (slug) => {
    try {
      await navigator.clipboard.writeText(pageUrl(slug));
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    } catch {
      showError("לא הצלחנו להעתיק את הקישור");
    }
  };

  if (!data) return <p className="dpp-builder__loading">טוען…</p>;

  const { pages, popups, stats } = data;
  const totals = summarize({ pages, popups });
  const insights = buildInsights({ pages, popups });

  const publishedPages = pages.filter((page) => page.status === "published");
  const activePopups = popups
    .filter((popup) => popup.status === "active")
    .sort((a, b) => b.impressions - a.impressions);

  return (
    <div className="mhub">
      <header className="admin-dashboard__head">
        <div>
          <h1>מרכז שיווק</h1>
          <p className="admin-dashboard__sub">
            כל מה שנוגע לקמפיינים במקום אחד — עמודי נחיתה, פופאפים והרשימה.
          </p>
        </div>

        <div className="mhub__quick">
          <Link to="/admin/pages" className="dpp-builder__publish">
            <FaPlus />
            עמוד נחיתה
          </Link>
          <Link to="/admin/popups" className="mhub__ghost-btn">
            <FaPlus />
            פופאפ
          </Link>
        </div>
      </header>

      <section className="mhub__stats">
        <StatCard
          label="עמודי נחיתה חיים"
          value={totals.publishedPages}
          sub={totals.draftPages > 0 ? `${totals.draftPages} בטיוטה` : null}
        />
        <StatCard
          label="פופאפים פעילים"
          value={totals.activePopups}
          sub={`מתוך ${totals.totalPopups}`}
        />
        <StatCard
          label="הצגות פופאפ"
          value={totals.impressions.toLocaleString("he-IL")}
        />
        <StatCard
          label="המרת פופאפ"
          value={percent.format(totals.conversionRate)}
          sub={`${totals.conversions.toLocaleString("he-IL")} המרות`}
        />
        <StatCard
          label="נרשמים לרשימה"
          value={(stats?.newsletterSubscribers ?? 0).toLocaleString("he-IL")}
        />
      </section>

      {insights.length > 0 ? (
        <section className="dpp-panel mhub__insights">
          <h3 className="dpp-panel__title">דורש תשומת לב</h3>
          <ul>
            {insights.map((insight) => {
              const Icon = SEVERITY_ICON[insight.severity];
              return (
                <li
                  key={insight.id}
                  className={`mhub-insight is-${insight.severity}`}
                >
                  <Icon className="mhub-insight__icon" />
                  <div className="mhub-insight__text">
                    <strong>{insight.title}</strong>
                    <span>{insight.detail}</span>
                  </div>
                  <Link to={insight.to} className="mhub-insight__action">
                    {insight.action}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <div className="mhub__columns">
        <section className="dpp-panel">
          <h3 className="dpp-panel__title">
            <FaFileAlt /> עמודי נחיתה חיים
          </h3>

          {publishedPages.length === 0 ? (
            <p className="admin-widget__empty">
              אין עמודים מפורסמים. <Link to="/admin/pages">ליצירת הראשון</Link>
            </p>
          ) : (
            <ul className="mhub-rows">
              {publishedPages.map((page) => (
                <li key={page._id}>
                  <Link
                    to={`/admin/pages/${page._id}`}
                    className="mhub-rows__name"
                  >
                    {page.internalName || page.slug}
                    <small dir="ltr">/lp/{page.slug}</small>
                  </Link>

                  <div className="mhub-rows__tools">
                    {/* Campaign URLs are copied far more often than they are
                        clicked — they go straight into an ad platform. */}
                    <button
                      type="button"
                      className="admin-shell__icon-btn"
                      onClick={() => copyUrl(page.slug)}
                      title="העתקת הקישור"
                    >
                      {copiedSlug === page.slug ? <FaCheck /> : <FaLink />}
                    </button>
                    <a
                      className="admin-shell__icon-btn"
                      href={pageUrl(page.slug)}
                      target="_blank"
                      rel="noreferrer"
                      title="פתיחה בחלון חדש"
                    >
                      <FaExternalLinkAlt />
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="dpp-panel">
          <h3 className="dpp-panel__title">
            <FaRegWindowRestore /> פופאפים פעילים
          </h3>

          {activePopups.length === 0 ? (
            <p className="admin-widget__empty">
              אין פופאפים פעילים. <Link to="/admin/popups">לניהול</Link>
            </p>
          ) : (
            <ul className="mhub-rows">
              {activePopups.map((popup) => {
                const rate =
                  popup.impressions > 0
                    ? popup.conversions / popup.impressions
                    : 0;

                return (
                  <li key={popup._id}>
                    <Link
                      to={`/admin/popups/${popup._id}`}
                      className="mhub-rows__name"
                    >
                      {popup.name}
                      <small>
                        {popup.impressions.toLocaleString("he-IL")} הצגות ·{" "}
                        {percent.format(rate)} המרה
                      </small>
                    </Link>

                    {popup.variantCount > 1 ? (
                      <span className="mhub-rows__tag">A/B</span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export default MarketingHub;
