const percent = new Intl.NumberFormat("he-IL", {
  style: "percent",
  maximumFractionDigits: 1,
});

/**
 * A/B readout.
 *
 * The "leading" marker is deliberately not called a winner: at these volumes a
 * few hundred impressions is noise, so the sample size is shown next to the
 * rate and the call stays with the person reading it.
 */
function PopupStats({ stats, onReset, canReset }) {
  if (!stats) return null;

  const best = stats.variants.reduce(
    (leader, variant) =>
      variant.impressions >= 100 &&
      (!leader || variant.conversionRate > leader.conversionRate)
        ? variant
        : leader,
    null,
  );

  return (
    <section className="dpp-panel">
      <header className="dpp-panel__head">
        <h3>ביצועים</h3>
        {canReset ? (
          <button type="button" className="dpp-link-btn" onClick={onReset}>
            איפוס נתונים
          </button>
        ) : null}
      </header>

      <table className="popup-stats">
        <thead>
          <tr>
            <th>וריאנט</th>
            <th>הצגות</th>
            <th>המרות</th>
            <th>סגירות</th>
            <th>אחוז המרה</th>
          </tr>
        </thead>
        <tbody>
          {stats.variants.map((variant) => (
            <tr
              key={variant.key}
              className={best?.key === variant.key ? "is-leading" : ""}
            >
              <td>
                {variant.label || variant.key}
                {best?.key === variant.key ? " ★" : ""}
              </td>
              <td>{variant.impressions}</td>
              <td>{variant.conversions}</td>
              <td>{variant.dismissals}</td>
              <td>{percent.format(variant.conversionRate)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="dpp-panel__hint">
        הכוכב מסמן את הוריאנט המוביל מבין אלה שעברו 100 הצגות. מתחת לכמות הזו
        ההפרש הוא רעש ולא תוצאה.
      </p>
    </section>
  );
}

export default PopupStats;
