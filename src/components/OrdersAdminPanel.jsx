import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FaBoxOpen, FaSearch, FaSpinner, FaFilter } from "react-icons/fa";
import { useToast } from "../context/ToastContext";
import "../styles/components/AdminPanel.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const getToken = () => localStorage.getItem("token");

const STATUS_OPTIONS = [
  { value: "paid", label: "שולם", labelEn: "Paid" },
  { value: "processing", label: "בעיבוד", labelEn: "Processing" },
  { value: "shipped", label: "נשלח", labelEn: "Shipped" },
  { value: "delivered", label: "נמסר", labelEn: "Delivered" },
  { value: "cancelled", label: "בוטל", labelEn: "Cancelled" },
];

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "כל הסטטוסים" },
  ...STATUS_OPTIONS,
];

function statusClass(status) {
  const map = {
    pending: "ap-status--pending",
    paid: "ap-status--paid",
    processing: "ap-status--processing",
    shipped: "ap-status--shipped",
    delivered: "ap-status--delivered",
    cancelled: "ap-status--cancelled",
  };
  return `ap-status-badge ${map[String(status).toLowerCase()] ?? "ap-status--pending"}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("he-IL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function SectionHeading({ icon: Icon, title, subtitle }) {
  return (
    <div className="ap-heading">
      <div className="ap-heading__icon">
        <Icon />
      </div>
      <div>
        <h2 className="ap-heading__title">{title}</h2>
        {subtitle && <p className="ap-heading__sub">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function OrdersAdminPanel() {
  const { showSuccess, showError } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      // Support both { orders: [] } and a bare array response
      const data = Array.isArray(res.data)
        ? res.data
        : (res.data.orders ?? res.data.data ?? []);
      setOrders(data);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "שגיאה בטעינת ההזמנות";
      showError(msg);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await axios.put(
        `${API_BASE_URL}/api/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${getToken()}` } },
      );
      setOrders((prev) =>
        prev.map((o) =>
          (o._id ?? o.id) === orderId ? { ...o, status: newStatus } : o,
        ),
      );
      const label =
        STATUS_OPTIONS.find((s) => s.value === newStatus)?.label ?? newStatus;
      showSuccess(`סטטוס הזמנה עודכן ל: ${label}`);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "שגיאה בעדכון סטטוס ההזמנה";
      showError(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = orders.filter((order) => {
    const id = String(order._id ?? order.id ?? "").toLowerCase();
    const name = String(order.customerName ?? "").toLowerCase();
    const email = String(order.customerEmail ?? "").toLowerCase();
    const term = searchTerm.toLowerCase();

    const matchesSearch =
      !term || id.includes(term) || name.includes(term) || email.includes(term);
    const matchesStatus =
      statusFilter === "all" ||
      String(order.status).toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="ap-table-wrap" style={{ marginBottom: "1.5rem" }}>
      {/* Header bar */}
      <div className="ap-table-bar">
        <div className="ap-table-bar__title">
          <FaBoxOpen />
          ניהול הזמנות
          <span className="ap-table-bar__badge">{filtered.length}</span>
        </div>

        <div
          style={{
            display: "flex",
            gap: "0.6rem",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {/* Status filter */}
          <div style={{ position: "relative" }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="ap-orders-filter-select"
              aria-label="סנן לפי סטטוס"
            >
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <FaFilter className="ap-search-icon" style={{ right: "0.5rem" }} />
          </div>

          {/* Search */}
          <div className="ap-search-wrap">
            <input
              type="text"
              placeholder="חיפוש לפי שם / אימייל / מזהה..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="ap-search-icon" />
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="ap-table-loading">
          <FaSpinner className="ap-spin" />
          טוען הזמנות...
        </div>
      ) : filtered.length === 0 ? (
        <div className="ap-table-loading" style={{ color: "#6b7280" }}>
          לא נמצאו הזמנות
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="ap-subscribers-table ap-orders-table">
            <thead>
              <tr>
                <th>#</th>
                <th>מזהה הזמנה</th>
                <th>לקוח</th>
                <th>אימייל</th>
                <th className="center">סכום</th>
                <th className="center">תאריך</th>
                <th className="center">סטטוס</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order, idx) => {
                const orderId = order._id ?? order.id;
                const isUpdating = updatingId === orderId;
                return (
                  <tr key={orderId}>
                    <td className="td-num">{idx + 1}</td>
                    <td>
                      <span className="ap-order-id" title={orderId}>
                        {String(orderId).slice(-8).toUpperCase()}
                      </span>
                    </td>
                    <td className="td-name">
                      {order.customerName ||
                        order.shippingAddress?.fullName ||
                        "—"}
                    </td>
                    <td style={{ direction: "ltr", textAlign: "right" }}>
                      {order.customerEmail || "—"}
                    </td>
                    <td className="center" style={{ fontWeight: 600 }}>
                      {(
                        order.totalPrice ??
                        order.totalAmount ??
                        0
                      ).toLocaleString("he-IL")}{" "}
                      ₪
                    </td>
                    <td className="center">
                      {formatDate(order.createdAt ?? order.date)}
                    </td>
                    <td className="center">
                      {isUpdating ? (
                        <FaSpinner
                          className="ap-spin"
                          style={{ color: "#d97706" }}
                        />
                      ) : (
                        <select
                          value={String(
                            order.status ?? "pending",
                          ).toLowerCase()}
                          onChange={(e) =>
                            handleStatusChange(orderId, e.target.value)
                          }
                          className={`ap-status-select ${statusClass(order.status)}`}
                          aria-label={`שנה סטטוס להזמנה ${orderId}`}
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
