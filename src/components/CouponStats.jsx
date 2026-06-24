import { useState, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function CouponStats() {
  const { language } = useLanguage();
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/api/orders/coupon-stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.success) {
          setStats(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching coupon stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="loading-state">
        {language === "he" ? "טוען נתוני קופונים..." : "Loading coupon stats..."}
      </div>
    );
  }

  return (
    <div className="admin-table-card" style={{ marginTop: "1.5rem" }}>
      <div style={{ marginBottom: "1rem" }}>
        <h3 style={{ color: "var(--color-primary)", margin: 0 }}>
          {language === "he" ? "סטטיסטיקות שימוש בקופונים" : "Coupon Usage Statistics"}
        </h3>
        <p style={{ color: "#888", fontSize: "0.85rem", marginTop: "0.25rem" }}>
          {language === "he"
            ? "סיכום שימוש בקודי קופון לפי כלל ההזמנות"
            : "Summary of coupon code usage across all orders"}
        </p>
      </div>

      {stats.length === 0 ? (
        <p style={{ color: "#aaa", textAlign: "center", padding: "2rem 0" }}>
          {language === "he" ? "לא נעשה שימוש בקופונים עדיין" : "No coupons used yet"}
        </p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>{language === "he" ? "קוד קופון" : "Coupon Code"}</th>
                <th>{language === "he" ? "מספר שימושים" : "Number of Uses"}</th>
                <th>{language === "he" ? "סה״כ הכנסות שנוצרו (₪)" : "Total Revenue Generated (₪)"}</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((row) => (
                <tr key={row.code}>
                  <td>
                    <code
                      style={{
                        fontWeight: 700,
                        letterSpacing: "0.08rem",
                        color: "var(--color-secondary)",
                      }}
                    >
                      {row.code}
                    </code>
                  </td>
                  <td style={{ fontWeight: 600 }}>{row.uses ?? row.count ?? 0}</td>
                  <td style={{ fontWeight: 600 }}>
                    ₪{(row.revenue ?? row.totalRevenue ?? 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CouponStats;
