import { useEffect, useMemo, useState } from "react";
import { FaEyeSlash, FaCheck, FaSlidersH, FaCompress, FaExpand } from "react-icons/fa";
import { useToast } from "../../context/ToastContext";
import SortableList from "./components/SortableList";
import { useAdminPreference } from "./AdminPreferenceContext";
import { WIDGET_REGISTRY, resolveWidgets } from "./widgetRegistry";
import { getAdminStats, listPopups, listProductPages } from "./adminApi";

const PERIODS = [
  { value: "day", label: "יום" },
  { value: "week", label: "שבוע" },
  { value: "month", label: "חודש" },
  { value: "year", label: "שנה" },
];

/** Widths an admin can cycle through, on a 12-column grid. */
const SPAN_CYCLE = [3, 4, 6, 12];

function DashboardHome() {
  const { showError } = useToast();
  const { preference, updateWidgets } = useAdminPreference();

  const [period, setPeriod] = useState("week");
  const [data, setData] = useState({ stats: null, pages: [], popups: [] });
  const [isEditing, setEditing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Each widget reads from this one payload rather than fetching its own —
    // eight widgets each doing their own round trip would be eight requests.
    Promise.all([
      getAdminStats(period).catch(() => null),
      listProductPages().catch(() => []),
      listPopups().catch(() => []),
    ]).then(([stats, pages, popups]) => {
      if (cancelled) return;
      setData({ stats, pages: pages || [], popups: popups || [] });
    });

    return () => {
      cancelled = true;
    };
  }, [period]);

  const widgets = useMemo(
    () => resolveWidgets(preference.dashboardWidgets),
    [preference.dashboardWidgets],
  );

  const visibleWidgets = isEditing
    ? widgets
    : widgets.filter((widget) => widget.visible !== false);

  const patchWidget = (widgetKey, changes) =>
    updateWidgets(
      widgets.map((widget) =>
        widget.widgetKey === widgetKey ? { ...widget, ...changes } : widget,
      ),
    );

  const cycleSpan = (widget) => {
    const next =
      SPAN_CYCLE[(SPAN_CYCLE.indexOf(widget.span) + 1) % SPAN_CYCLE.length];
    patchWidget(widget.widgetKey, { span: next });
  };

  const hiddenCount = widgets.filter((widget) => widget.visible === false).length;

  return (
    <div className="admin-dashboard">
      <header className="admin-dashboard__head">
        <div>
          <h1>לוח בקרה</h1>
          <p className="admin-dashboard__sub">
            גררו כרטיסים כדי לסדר מחדש. הפריסה נשמרת לחשבון שלכם.
          </p>
        </div>

        <div className="admin-dashboard__controls">
          <div className="admin-dashboard__periods">
            {PERIODS.map((item) => (
              <button
                key={item.value}
                type="button"
                className={period === item.value ? "is-active" : ""}
                onClick={() => setPeriod(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className={`admin-shell__ghost-btn ${isEditing ? "is-on" : ""}`}
            onClick={() => setEditing((value) => !value)}
          >
            {isEditing ? <FaCheck /> : <FaSlidersH />}
            {isEditing ? "סיום" : "עריכת פריסה"}
            {!isEditing && hiddenCount > 0 ? ` (${hiddenCount} מוסתרים)` : ""}
          </button>
        </div>
      </header>

      <SortableList
        items={visibleWidgets}
        getId={(widget) => widget.widgetKey}
        onReorder={(next) => {
          // Reordering the visible subset must not drop hidden widgets, so the
          // hidden ones are appended back before saving.
          const visibleKeys = new Set(next.map((widget) => widget.widgetKey));
          updateWidgets([
            ...next,
            ...widgets.filter((widget) => !visibleKeys.has(widget.widgetKey)),
          ]);
        }}
        disabled={!isEditing}
        layout="grid"
        className="admin-dashboard__grid"
        renderItem={(widget, index, { ref, style, handleProps }) => {
          const definition = WIDGET_REGISTRY[widget.widgetKey];
          const isHidden = widget.visible === false;

          return (
            <section
              ref={ref}
              style={{ ...style, "--widget-span": widget.span || 4 }}
              className={`admin-widget ${isHidden ? "is-hidden" : ""}`}
            >
              {isEditing ? (
                <div className="admin-widget__bar">
                  <button
                    type="button"
                    className="admin-shell__grip"
                    aria-label={`שינוי מיקום: ${definition.label}`}
                    {...handleProps}
                  >
                    ⠿
                  </button>
                  <span className="admin-widget__title">{definition.label}</span>
                  <button
                    type="button"
                    className="admin-shell__icon-btn"
                    onClick={() => cycleSpan(widget)}
                    title="שינוי רוחב"
                  >
                    {widget.span >= 12 ? <FaCompress /> : <FaExpand />}
                  </button>
                  <button
                    type="button"
                    className={`admin-shell__icon-btn ${isHidden ? "is-on" : ""}`}
                    onClick={() =>
                      patchWidget(widget.widgetKey, { visible: isHidden })
                    }
                    title={isHidden ? "הצגה" : "הסתרה"}
                  >
                    <FaEyeSlash />
                  </button>
                </div>
              ) : null}

              <div className="admin-widget__body">
                {definition.render({ ...data, showError })}
              </div>
            </section>
          );
        }}
      />
    </div>
  );
}

export default DashboardHome;
