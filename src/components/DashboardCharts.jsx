import { useLanguage } from "../contexts/LanguageContext";
import "../styles/components/DashboardCharts.css";

function BarChart({ data, valueKey, labelKey, color = "#c9a227", title }) {
  const max = Math.max(...data.map((d) => d[valueKey] || 0), 1);

  return (
    <div className="dash-chart-card">
      <h3 className="dash-chart-title">{title}</h3>
      {data.length === 0 ? (
        <p className="dash-chart-empty">—</p>
      ) : (
        <div className="dash-bar-chart">
          {data.map((item, i) => (
            <div key={i} className="dash-bar-col" title={`${item[labelKey]}: ${item[valueKey]}`}>
              <div className="dash-bar-value">{item[valueKey]}</div>
              <div className="dash-bar-track">
                <div
                  className="dash-bar-fill"
                  style={{
                    height: `${((item[valueKey] || 0) / max) * 100}%`,
                    background: color,
                  }}
                />
              </div>
              <div className="dash-bar-label">{item[labelKey]}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DonutChart({ data, labelKey, valueKey, title }) {
  const total = data.reduce((s, d) => s + (d[valueKey] || 0), 0);
  const colors = ["#c9a227", "#4a7c59", "#5b7fa6", "#8b5a6b", "#6b5b8b", "#a67c52"];

  if (total === 0) {
    return (
      <div className="dash-chart-card">
        <h3 className="dash-chart-title">{title}</h3>
        <p className="dash-chart-empty">—</p>
      </div>
    );
  }

  let cumulative = 0;
  const segments = data.map((item, i) => {
    const pct = ((item[valueKey] || 0) / total) * 100;
    const start = cumulative;
    cumulative += pct;
    return { ...item, pct, start, color: colors[i % colors.length] };
  });

  const gradient = segments
    .map((s) => `${s.color} ${s.start}% ${s.start + s.pct}%`)
    .join(", ");

  return (
    <div className="dash-chart-card">
      <h3 className="dash-chart-title">{title}</h3>
      <div className="dash-donut-wrap">
        <div
          className="dash-donut"
          style={{ background: `conic-gradient(${gradient})` }}
        >
          <div className="dash-donut-hole">
            <span className="dash-donut-total">{total}</span>
          </div>
        </div>
        <ul className="dash-donut-legend">
          {segments.map((s, i) => (
            <li key={i}>
              <span className="dash-legend-dot" style={{ background: s.color }} />
              <span>{s[labelKey]}</span>
              <strong>{s[valueKey]}</strong>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function DashboardCharts({ charts }) {
  const { language } = useLanguage();
  const he = language === "he";

  if (!charts) return null;

  const revenueData = charts.revenueOverTime || [];
  const statusData = (charts.ordersByStatus || []).map((s) => ({
    status: s.status,
    count: s.count,
  }));
  const categoryData = (charts.productsByCategory || []).map((c) => ({
    category: c.category,
    count: c.count,
  }));

  return (
    <div className="dash-charts-grid">
      <BarChart
        data={revenueData}
        valueKey="revenue"
        labelKey="label"
        title={he ? "הכנסות לפי זמן (₪)" : "Revenue Over Time (₪)"}
        color="#c9a227"
      />
      <BarChart
        data={revenueData}
        valueKey="orders"
        labelKey="label"
        title={he ? "הזמנות לפי זמן" : "Orders Over Time"}
        color="#4a7c59"
      />
      <DonutChart
        data={statusData}
        labelKey="status"
        valueKey="count"
        title={he ? "הזמנות לפי סטטוס" : "Orders by Status"}
      />
      <DonutChart
        data={categoryData}
        labelKey="category"
        valueKey="count"
        title={he ? "מוצרים לפי קטגוריה" : "Products by Category"}
      />
    </div>
  );
}
