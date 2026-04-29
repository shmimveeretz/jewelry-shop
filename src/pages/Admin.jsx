import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaUsers,
  FaShieldAlt,
  FaBoxOpen,
  FaShoppingCart,
  FaTag,
  FaEnvelope,
  FaChartBar,
  FaUserPlus,
  FaEye,
  FaMoneyBillWave,
  FaArrowUp,
  FaArrowDown,
  FaFileInvoice,
} from "react-icons/fa";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../contexts/LanguageContext";
import ProductForm from "../components/ProductForm";
import PayPlusDocumentForm from "../components/PayPlusDocumentForm";
import { getAllProducts, deleteProduct } from "../services/productApi";
import "../styles/pages/Admin.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Admin() {
  const { language, t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);

  // Products State - Load from data files
  const [products, setProducts] = useState([]);

  // Users State
  const [users, setUsers] = useState([]);

  // Dashboard Stats State
  const [dashboardStats, setDashboardStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsTimePeriod, setStatsTimePeriod] = useState("week");

  // Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [orderSearchTerm, setOrderSearchTerm] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [devices, setDevices] = useState([]);

  const [blockedIPs, setBlockedIPs] = useState([]);

  // Newsletter State
  const [subscribers, setSubscribers] = useState([]);
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterSearchTerm, setNewsletterSearchTerm] = useState("");

  // Coupons State
  const [coupons, setCoupons] = useState([]);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discountPercent: "",
    description: "",
  });
  const [couponLoading, setCouponLoading] = useState(false);
  const [deviceSearchTerm, setDeviceSearchTerm] = useState("");
  const [newFirewallIP, setNewFirewallIP] = useState("");
  const [firewall, setFirewall] = useState([]);

  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState(null);

  // Products State
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    nameEn: "",
    category: "",
    categoryEn: "",
    description: "",
    descriptionEn: "",
    price: "",
    metals: "",
    images: "",
    status: "active",
  });

  // Load products from MongoDB via API
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.data || []);
      } else {
        console.error("Failed to fetch products:", data.message);
        showError(
          language === "he" ? "שגיאה בטעינת מוצרים" : "Error loading products",
        );
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      showError(
        language === "he"
          ? "שגיאה בחיבור לשרת - ודא שה-API פעיל"
          : "Connection error - make sure API is running",
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle ProductForm success
  const handleProductFormSuccess = (newProduct) => {
    setShowProductForm(false);
    setEditingProduct(null);
    fetchProducts();
    showSuccess(
      language === "he" ? "המוצר עודכן בהצלחה" : "Product updated successfully",
    );
  };

  // Handle delete product from new ProductForm
  const handleDeleteProductWithImage = async (productId) => {
    if (
      window.confirm(
        language === "he"
          ? "האם אתה בטוח שברצונך למחוק את המוצר?"
          : "Are you sure you want to delete this product?",
      )
    ) {
      try {
        const token = localStorage.getItem("token");
        const result = await deleteProduct(productId, token);
        if (result.success) {
          fetchProducts();
          showSuccess(
            language === "he"
              ? "המוצר נמחק בהצלחה"
              : "Product deleted successfully",
          );
        } else {
          showError(result.message || "Error deleting product");
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        showError(language === "he" ? "שגיאה בחיבור" : "Connection error");
      }
    }
  };

  // Check authorization on mount
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const userData = JSON.parse(user);
      if (userData.role !== "admin" && userData.role !== "roi") {
        showError(
          language === "he"
            ? "אין לך הרשאה לגשת לדף זה"
            : "You don't have permission to access this page",
        );
        navigate("/");
        return;
      }
      setIsAuthorized(true);
    } catch (error) {
      navigate("/login");
    }
  }, [navigate, language, showError]);

  // Fetch dashboard stats
  useEffect(() => {
    if (isAuthorized) fetchDashboardStats(statsTimePeriod);
  }, [isAuthorized, statsTimePeriod]);

  const fetchDashboardStats = async (period) => {
    setStatsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/api/admin/stats?period=${period}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await response.json();
      if (data.success) setDashboardStats(data.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch orders from API
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setOrders(data.data || []);
      } else {
        console.error("Failed to fetch orders:", data.message);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch newsletter subscribers from API
  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    setNewsletterLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/api/newsletter/subscribers`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      if (data.success) setSubscribers(data.data || []);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
    } finally {
      setNewsletterLoading(false);
    }
  };

  const handleDeleteSubscriber = async (subscriberId) => {
    if (
      !window.confirm(
        language === "he"
          ? "האם אתה בטוח שברצונך למחוק מנוי זה?"
          : "Are you sure you want to delete this subscriber?",
      )
    )
      return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/api/newsletter/subscribers/${subscriberId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      if (data.success) {
        setSubscribers((prev) =>
          prev.filter((s) => (s._id || s.id) !== subscriberId),
        );
        showSuccess(
          language === "he"
            ? "המנוי נמחק בהצלחה"
            : "Subscriber deleted successfully",
        );
      } else {
        showError(data.message || "Error deleting subscriber");
      }
    } catch (error) {
      console.error("Error deleting subscriber:", error);
      showError(language === "he" ? "שגיאה בחיבור" : "Connection error");
    }
  };

  // Fetch coupons from API
  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/coupons`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) setCoupons(data.data || []);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    }
  };

  const handleCreateCoupon = async () => {
    if (!newCoupon.code.trim() || !newCoupon.discountPercent) {
      showError(
        language === "he"
          ? "אנא מלא קוד ואחוז הנחה"
          : "Please fill in code and discount percent",
      );
      return;
    }
    const pct = Number(newCoupon.discountPercent);
    if (isNaN(pct) || pct <= 0 || pct > 100) {
      showError(
        language === "he"
          ? "אחוז הנחה חייב להיות בין 1-100"
          : "Discount must be between 1 and 100",
      );
      return;
    }
    setCouponLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/coupons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: newCoupon.code.trim().toUpperCase(),
          discountPercent: pct,
          description: newCoupon.description.trim(),
          type: "manual",
        }),
      });
      const data = await response.json();
      if (data.success) {
        setCoupons((prev) => [...prev, data.data]);
        setNewCoupon({ code: "", discountPercent: "", description: "" });
        showSuccess(
          language === "he"
            ? "קופון נוצר בהצלחה"
            : "Coupon created successfully",
        );
      } else {
        showError(data.message || "Error creating coupon");
      }
    } catch (error) {
      console.error("Error creating coupon:", error);
      showError(language === "he" ? "שגיאה בחיבור" : "Connection error");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (
      !window.confirm(
        language === "he"
          ? "האם אתה בטוח שברצונך למחוק קופון זה?"
          : "Are you sure you want to delete this coupon?",
      )
    )
      return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/coupons/${couponId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setCoupons((prev) => prev.filter((c) => (c._id || c.id) !== couponId));
        showSuccess(
          language === "he"
            ? "קופון נמחק בהצלחה"
            : "Coupon deleted successfully",
        );
      } else {
        showError(data.message || "Error deleting coupon");
      }
    } catch (error) {
      console.error("Error deleting coupon:", error);
      showError(language === "he" ? "שגיאה בחיבור" : "Connection error");
    }
  };

  // Fetch devices from API
  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/admin/devices`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        console.log("Device sample:", JSON.stringify(data.data[0], null, 2));
        setDevices(data.data);
      } else {
        console.error("Error fetching devices:", data.message);
      }
    } catch (error) {
      console.error("Error fetching devices:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (language === "he") {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${day}.${month}.${year} ${hours}:${minutes}`;
      } else {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${month}/${day}/${year} ${hours}:${minutes}`;
      }
    } catch {
      return "-";
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        // Convert MongoDB _id to id for consistency
        const usersWithId = data.data.map((user) => ({
          ...user,
          id: user._id || user.id,
        }));
        setUsers(usersWithId);
      } else {
        showError(
          data.message ||
            (language === "he"
              ? "שגיאה בטעינת משתמשים"
              : "Error loading users"),
        );
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      showError(language === "he" ? "שגיאה בחיבור לשרת" : "Connection error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleUserSearch = (e) => {
    setUserSearchTerm(e.target.value);
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.firstname &&
        user.firstname.toLowerCase().includes(userSearchTerm.toLowerCase())) ||
      (user.lastname &&
        user.lastname.toLowerCase().includes(userSearchTerm.toLowerCase())) ||
      (user.email &&
        user.email.toLowerCase().includes(userSearchTerm.toLowerCase())),
  );

  const handleChangeUserRole = (userId, newRole) => {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const targetUser = users.find((u) => u.id === userId || u._id === userId);

    // Check if trying to change own role
    if (currentUser._id === userId || currentUser.id === userId) {
      showError(
        language === "he"
          ? "🚫 לא יכול לשנות את התפקיד שלך לעצמך"
          : "🚫 Cannot change your own role",
      );
      return;
    }

    // Role hierarchy: ROI > ADMIN > USER
    // Admin cannot manage ROI/ADMIN roles
    if (
      currentUser.role === "admin" &&
      (targetUser?.role === "roi" || targetUser?.role === "admin")
    ) {
      showError(
        language === "he"
          ? "🔒 רק מנהל ניטור (ROI) יכול לנהל משתמשים בעלי תפקידים גבוהים"
          : "🔒 Only ROI (Device Manager) can manage higher-level roles",
      );
      return;
    }

    // Warning and confirmation for ROI role
    if (newRole === "roi") {
      const confirmed = window.confirm(
        language === "he"
          ? `⚠️ אתה עומד לתת ל-${targetUser?.firstname} גישה כמנהל ניטור (ROI). 👑 זה התפקיד הגבוה ביותר במערכת. האם אתה בטוח?`
          : `⚠️ You are about to grant ${targetUser?.firstname} ROI access. 👑 This is the highest role in the system. Are you sure?`,
      );
      if (!confirmed) return;
    }

    // Warning when removing ROI role
    if (targetUser?.role === "roi" && newRole !== "roi") {
      const confirmed = window.confirm(
        language === "he"
          ? `⚠️ אתה עומד להסיר מ-${targetUser?.firstname} את תפקיד מנהל ניטור (ROI). תפקיד זה הוא הגבוה ביותר. האם אתה בטוח?`
          : `⚠️ You are about to remove ${targetUser?.firstname}'s ROI (highest) role. Are you sure?`,
      );
      if (!confirmed) return;
    }

    const updateUserRole = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${API_BASE_URL}/api/users/${userId}/role`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ role: newRole }),
          },
        );

        const data = await response.json();
        if (data.success) {
          setUsers(
            users.map((u) =>
              u.id === userId || u._id === userId ? { ...u, role: newRole } : u,
            ),
          );

          const roleDisplayNames = {
            user: language === "he" ? "משתמש" : "User",
            admin: language === "he" ? "מנהל" : "Admin",
            roi:
              language === "he" ? "מנהל ניטור (ROI)" : "Device Manager (ROI)",
          };

          showSuccess(
            language === "he"
              ? `✅ תפקיד המשתמש ${targetUser?.firstname} עודכן ל-${roleDisplayNames[newRole]}`
              : `✅ ${targetUser?.firstname}'s role updated to ${roleDisplayNames[newRole]}`,
          );
        } else {
          showError(
            data.message ||
              (language === "he"
                ? "שגיאה בעדכון תפקיד"
                : "Error updating role"),
          );
        }
      } catch (error) {
        console.error("Error updating role:", error);
        showError(language === "he" ? "שגיאה בחיבור לשרת" : "Connection error");
      }
    };
    updateUserRole();
  };

  const handleDeleteUser = (userId) => {
    const user = users.find((u) => u.id === userId || u._id === userId);
    if (!user) {
      showError(language === "he" ? "משתמש לא נמצא" : "User not found");
      return;
    }

    const username = `${user.firstname} ${user.lastname}`;
    if (
      window.confirm(
        language === "he"
          ? `האם אתה בטוח שברצונך למחוק את המשתמש ${username}?`
          : `Are you sure you want to delete ${username}?`,
      )
    ) {
      const deleteUserAsync = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(
            `${API_BASE_URL}/api/users/${user._id || userId}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            },
          );

          const data = await response.json();
          if (data.success) {
            setUsers(
              users.filter((u) => (u._id || u.id) !== (user._id || userId)),
            );
            showSuccess(
              language === "he"
                ? "המשתמש נמחק בהצלחה"
                : "User deleted successfully",
            );
          } else {
            showError(
              data.message ||
                (language === "he"
                  ? "שגיאה במחיקת משתמש"
                  : "Error deleting user"),
            );
          }
        } catch (error) {
          console.error("Error deleting user:", error);
          showError(
            language === "he" ? "שגיאה בחיבור לשרת" : "Connection error",
          );
        }
      };
      deleteUserAsync();
    }
  };

  const handleBlockUser = (userId) => {
    const user = users.find((u) => u.id === userId || u._id === userId);
    if (!user) return;

    const username = `${user.firstname} ${user.lastname}`;
    const action = user.blocked ? "ביטול חסימה" : "חסימה";
    const actionEn = user.blocked ? "Unblock" : "Block";

    if (
      window.confirm(
        language === "he"
          ? `האם אתה בטוח שברצונך ${action} את המשתמש ${username}?`
          : `Are you sure you want to ${actionEn} ${username}?`,
      )
    ) {
      setUsers(
        users.map((u) =>
          u.id === userId || u._id === userId
            ? { ...u, blocked: !u.blocked }
            : u,
        ),
      );
      showSuccess(
        language === "he"
          ? `המשתמש ${user.blocked ? "הוסר מחסימה" : "חסום"} בהצלחה`
          : `User ${user.blocked ? "unblocked" : "blocked"} successfully`,
      );
    }
  };

  const handleOrderStatusChange = (orderId, newStatus) => {
    // Optimistic update
    setOrders((prev) =>
      prev.map((o) =>
        (o._id || o.id) === orderId ? { ...o, status: newStatus } : o,
      ),
    );
    // Persist to backend
    const updateAsync = async () => {
      try {
        const token = localStorage.getItem("token");
        await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        });
      } catch (error) {
        console.error("Error updating order status:", error);
      }
    };
    updateAsync();
    showSuccess(
      language === "he" ? `סטטוס ההזמנה עודכן` : `Order status updated`,
    );
  };

  const filteredOrders = orders.filter((order) => {
    const searchLower = orderSearchTerm.toLowerCase();
    const matchesSearch =
      (order._id || order.id || "").toLowerCase().includes(searchLower) ||
      (order.customerName || "").toLowerCase().includes(searchLower) ||
      (order.customerEmail || order.email || "")
        .toLowerCase()
        .includes(searchLower) ||
      (order.customerPhone || "").toLowerCase().includes(searchLower);

    const matchesStatus =
      orderStatusFilter === "all" || order.status === orderStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleBlockIP = (deviceId) => {
    const device = devices.find((d) => d.id === deviceId || d._id === deviceId);
    if (!device) return;

    const newBlocked = !device.blocked;
    const blockDeviceAsync = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${API_BASE_URL}/api/admin/devices/${device._id || device.id}/block`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ blocked: newBlocked }),
          },
        );

        const data = await response.json();
        if (data.success) {
          setDevices(
            devices.map((d) =>
              d.id === deviceId || d._id === deviceId
                ? { ...d, blocked: newBlocked }
                : d,
            ),
          );
          showSuccess(
            language === "he"
              ? `כתובת IP ${device.ipAddress} ${newBlocked ? "חסומה" : "הוסרה מחסימה"} בהצלחה`
              : `IP address ${device.ipAddress} ${newBlocked ? "blocked" : "unblocked"} successfully`,
          );
        } else {
          showError(data.message || "Error updating block status");
        }
      } catch (error) {
        console.error("Error blocking device:", error);
        showError(language === "he" ? "שגיאה בחיבור לשרת" : "Connection error");
      }
    };
    blockDeviceAsync();
  };

  const handleAddToFirewall = () => {
    // Validate IP address format
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!newFirewallIP.trim()) {
      showError(
        language === "he" ? "אנא הזן כתובת IP" : "Please enter an IP address",
      );
      return;
    }

    if (!ipRegex.test(newFirewallIP)) {
      showError(
        language === "he"
          ? "פורמט IP לא תקין (דוגמה: 192.168.1.100)"
          : "Invalid IP format (example: 192.168.1.100)",
      );
      return;
    }

    // Check if IP already in firewall
    if (firewall.includes(newFirewallIP)) {
      showError(
        language === "he"
          ? `כתובת IP ${newFirewallIP} כבר קיימת בחומת אש`
          : `IP address ${newFirewallIP} is already in the firewall`,
      );
      return;
    }

    // Add to firewall
    setFirewall([...firewall, newFirewallIP]);
    setNewFirewallIP("");

    // Call backend to add to firewall
    addToFirewall(newFirewallIP);

    showSuccess(
      language === "he"
        ? `כתובת IP ${newFirewallIP} נוספה לחומת אש בהצלחה`
        : `IP address ${newFirewallIP} added to firewall successfully`,
    );
  };

  const addToFirewall = async (ipAddress) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/firewall/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ipAddress }),
      });

      const data = await response.json();
      if (!data.success) {
        console.error("Failed to add IP to firewall:", data.message);
      }
    } catch (error) {
      console.error("Error adding IP to firewall:", error);
    }
  };

  const removeFromFirewall = (ipAddress) => {
    const confirmed = window.confirm(
      language === "he"
        ? `האם אתה בטוח שברצונך להסיר את ${ipAddress} מחומת האש?`
        : `Are you sure you want to remove ${ipAddress} from firewall?`,
    );

    if (confirmed) {
      setFirewall(firewall.filter((ip) => ip !== ipAddress));

      // Call backend to remove from firewall
      removeFromFirewallBackend(ipAddress);

      showSuccess(
        language === "he"
          ? `כתובת IP ${ipAddress} הוסרה מחומת אש`
          : `IP address ${ipAddress} removed from firewall`,
      );
    }
  };

  const removeFromFirewallBackend = async (ipAddress) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/firewall/remove`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ipAddress }),
      });

      const data = await response.json();
      if (!data.success) {
        console.error("Failed to remove IP from firewall:", data.message);
      }
    } catch (error) {
      console.error("Error removing IP from firewall:", error);
    }
  };

  const filteredDevices = devices
    .filter((device) => {
      const locationStr = [
        device.location?.city,
        device.location?.country,
        device.location?.timezone,
      ]
        .filter(Boolean)
        .join(", ")
        .toLowerCase();
      return (
        (device.ipAddress || "")
          .toLowerCase()
          .includes(deviceSearchTerm.toLowerCase()) ||
        (device.deviceName || "")
          .toLowerCase()
          .includes(deviceSearchTerm.toLowerCase()) ||
        locationStr.includes(deviceSearchTerm.toLowerCase())
      );
    })
    .sort((a, b) => new Date(b.lastLogin) - new Date(a.lastLogin));

  // Check if user is "roi" (super admin)
  const isROI = () => {
    const user = localStorage.getItem("user");
    if (!user) return false;
    try {
      const userData = JSON.parse(user);
      return userData.role === "roi";
    } catch {
      return false;
    }
  };

  const filteredProducts = products.filter((product) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (product.name && product.name.toLowerCase().includes(searchLower)) ||
      (product.nameEn && product.nameEn.toLowerCase().includes(searchLower)) ||
      (product.category &&
        product.category.toLowerCase().includes(searchLower)) ||
      (product.categoryEn &&
        product.categoryEn.toLowerCase().includes(searchLower))
    );
  });

  const handleAddProduct = () => {
    setEditingProduct(null);
    setFormData({
      id: "",
      name: "",
      nameEn: "",
      category: "",
      categoryEn: "",
      description: "",
      descriptionEn: "",
      price: "",
      metals: "",
      images: "",
      status: "active",
    });
    setShowForm(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      id: product.id,
      name: product.name,
      nameEn: product.nameEn || "",
      category: product.category,
      categoryEn: product.categoryEn || "",
      description: product.description || "",
      descriptionEn: product.descriptionEn || "",
      price: product.price,
      metals: Array.isArray(product.metals)
        ? product.metals.join(", ")
        : product.metals || "",
      images: Array.isArray(product.images)
        ? product.images.join(", ")
        : product.images || "",
      status: product.status || "active",
    });
    setShowForm(true);
  };

  const handleDeleteProduct = (id) => {
    if (
      window.confirm(
        language === "he"
          ? "האם אתה בטוח שברצונך למחוק מוצר זה?"
          : "Are you sure you want to delete this product?",
      )
    ) {
      setProducts(products.filter((p) => p.id !== id));
      showSuccess(
        language === "he"
          ? "המוצר נמחק בהצלחה"
          : "Product deleted successfully",
      );
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (editingProduct) {
      // Update existing product
      updateProductAPI({
        ...editingProduct,
        name: formData.name,
        nameEn: formData.nameEn,
        category: formData.category,
        categoryEn: formData.categoryEn,
        description: formData.description,
        descriptionEn: formData.descriptionEn,
        price: parseFloat(formData.price),
        metals: formData.metals
          .split(",")
          .map((m) => m.trim())
          .filter((m) => m),
        images: formData.images
          .split(",")
          .map((i) => i.trim())
          .filter((i) => i),
        status: formData.status,
      });
    } else {
      // Add new product
      const newProduct = {
        name: formData.name,
        nameEn: formData.nameEn,
        category: formData.category,
        categoryEn: formData.categoryEn,
        description: formData.description,
        descriptionEn: formData.descriptionEn,
        price: parseFloat(formData.price),
        metals: formData.metals
          .split(",")
          .map((m) => m.trim())
          .filter((m) => m),
        images: formData.images
          .split(",")
          .map((i) => i.trim())
          .filter((i) => i),
        status: formData.status,
      };
      addProductAPI(newProduct);
    }

    setShowForm(false);
  };

  const addProductAPI = async (product) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(product),
      });

      const data = await response.json();
      if (data.success) {
        setProducts([...products, data.data]);
        showSuccess(
          language === "he"
            ? "המוצר הוסף בהצלחה"
            : "Product added successfully",
        );
      } else {
        showError(data.message || "Error adding product");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      showError(language === "he" ? "שגיאה בחיבור" : "Connection error");
    }
  };

  const updateProductAPI = async (product) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/api/products/${product._id || product.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(product),
        },
      );

      const data = await response.json();
      if (data.success) {
        setProducts(
          products.map((p) =>
            p._id === data.data._id || p.id === data.data.id ? data.data : p,
          ),
        );
        showSuccess(
          language === "he"
            ? "המוצר עודכן בהצלחה"
            : "Product updated successfully",
        );
      } else {
        showError(data.message || "Error updating product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      showError(language === "he" ? "שגיאה בחיבור" : "Connection error");
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  // If not authorized, show loading
  if (!isAuthorized) {
    return (
      <div className="admin-page">
        <div
          className="loading-state"
          style={{
            minHeight: "50vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p>{language === "he" ? "טוען..." : "Loading..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* ── Navigation Tabs ── */}
      <nav className="admin-nav-tabs">
        <ul className="admin-nav-pill">
          <li>
            <button
              className={`admin-nav-item ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >
              <FaChartBar className="nav-icon" />
              {language === "he" ? "דשבורד" : "Dashboard"}
            </button>
          </li>
          <li>
            <button
              className={`admin-nav-item ${activeTab === "products" ? "active" : ""}`}
              onClick={() => setActiveTab("products")}
            >
              <FaBoxOpen className="nav-icon" />
              {language === "he" ? "מוצרים" : "Products"}
            </button>
          </li>
          <li>
            <button
              className={`admin-nav-item ${activeTab === "orders" ? "active" : ""}`}
              onClick={() => setActiveTab("orders")}
            >
              <FaShoppingCart className="nav-icon" />
              {language === "he" ? "הזמנות" : "Orders"}
            </button>
          </li>
          {isROI() && (
            <li>
              <button
                className={`admin-nav-item ${activeTab === "users" ? "active" : ""}`}
                onClick={() => setActiveTab("users")}
              >
                <FaUsers className="nav-icon" />
                {language === "he" ? "משתמשים" : "Users"}
              </button>
            </li>
          )}
          {isROI() && (
            <li>
              <button
                className={`admin-nav-item ${activeTab === "devices" ? "active" : ""}`}
                onClick={() => setActiveTab("devices")}
              >
                <FaShieldAlt className="nav-icon" />
                {language === "he" ? "מכשירים" : "Devices"}
              </button>
            </li>
          )}
          <li>
            <button
              className={`admin-nav-item ${activeTab === "coupons" ? "active" : ""}`}
              onClick={() => setActiveTab("coupons")}
            >
              <FaTag className="nav-icon" />
              {language === "he" ? "קופונים" : "Coupons"}
            </button>
          </li>
          <li>
            <button
              className={`admin-nav-item ${activeTab === "newsletter" ? "active" : ""}`}
              onClick={() => setActiveTab("newsletter")}
            >
              <FaEnvelope className="nav-icon" />
              {language === "he" ? "ניוזלטר" : "Newsletter"}
            </button>
          </li>
          <li>
            <button
              className={`admin-nav-item ${activeTab === "documents" ? "active" : ""}`}
              onClick={() => setActiveTab("documents")}
            >
              <FaFileInvoice className="nav-icon" />
              {language === "he" ? "מסמכים" : "Documents"}
            </button>
          </li>
        </ul>
      </nav>

      {/* ── Main Content ── */}
      <div className="admin-container">
        {/* ───────────────── DASHBOARD TAB ───────────────── */}
        {activeTab === "dashboard" && (
          <>
            <div className="section-header">
              <div>
                <h1>{language === "he" ? "סקירה כללית" : "Overview"}</h1>
                <p className="section-subtitle">
                  {language === "he"
                    ? "נתוני האתר לפי תקופה נבחרת"
                    : "Site statistics for selected period"}
                </p>
              </div>
              <div className="period-toggle">
                {[
                  { key: "day", he: "יום", en: "Today" },
                  { key: "week", he: "שבוע", en: "Week" },
                  { key: "month", he: "חודש", en: "Month" },
                ].map(({ key, he, en }) => (
                  <button
                    key={key}
                    className={`period-btn ${statsTimePeriod === key ? "active" : ""}`}
                    onClick={() => setStatsTimePeriod(key)}
                  >
                    {language === "he" ? he : en}
                  </button>
                ))}
              </div>
            </div>

            {statsLoading ? (
              <div className="loading-state">
                {language === "he" ? "טוען נתונים..." : "Loading stats..."}
              </div>
            ) : (
              <>
                {/* ── Stat Cards ── */}
                <div className="dashboard-grid">
                  {/* Orders */}
                  <div className="stat-card">
                    <div className="stat-icon-wrap stat-icon-orders">
                      <FaShoppingCart />
                    </div>
                    <div className="stat-body">
                      <p className="stat-value">
                        {dashboardStats?.orders?.count ?? "-"}
                      </p>
                      <p className="stat-label">
                        {language === "he" ? "הזמנות" : "Orders"}
                      </p>
                      {dashboardStats?.orders?.trend !== undefined && (
                        <span
                          className={`stat-trend ${dashboardStats.orders.trend >= 0 ? "trend-up" : "trend-down"}`}
                        >
                          {dashboardStats.orders.trend >= 0 ? (
                            <FaArrowUp />
                          ) : (
                            <FaArrowDown />
                          )}
                          {Math.abs(dashboardStats.orders.trend)}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Revenue */}
                  <div className="stat-card">
                    <div className="stat-icon-wrap stat-icon-revenue">
                      <FaMoneyBillWave />
                    </div>
                    <div className="stat-body">
                      <p className="stat-value">
                        ₪
                        {(dashboardStats?.revenue?.total ?? 0).toLocaleString()}
                      </p>
                      <p className="stat-label">
                        {language === "he" ? "הכנסות" : "Revenue"}
                      </p>
                      {dashboardStats?.revenue?.trend !== undefined && (
                        <span
                          className={`stat-trend ${dashboardStats.revenue.trend >= 0 ? "trend-up" : "trend-down"}`}
                        >
                          {dashboardStats.revenue.trend >= 0 ? (
                            <FaArrowUp />
                          ) : (
                            <FaArrowDown />
                          )}
                          {Math.abs(dashboardStats.revenue.trend)}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* New Users */}
                  <div className="stat-card">
                    <div className="stat-icon-wrap stat-icon-users">
                      <FaUserPlus />
                    </div>
                    <div className="stat-body">
                      <p className="stat-value">
                        {dashboardStats?.newUsers?.count ?? "-"}
                      </p>
                      <p className="stat-label">
                        {language === "he" ? "משתמשים חדשים" : "New Users"}
                      </p>
                      {dashboardStats?.newUsers?.trend !== undefined && (
                        <span
                          className={`stat-trend ${dashboardStats.newUsers.trend >= 0 ? "trend-up" : "trend-down"}`}
                        >
                          {dashboardStats.newUsers.trend >= 0 ? (
                            <FaArrowUp />
                          ) : (
                            <FaArrowDown />
                          )}
                          {Math.abs(dashboardStats.newUsers.trend)}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Site Visits */}
                  <div className="stat-card">
                    <div className="stat-icon-wrap stat-icon-visits">
                      <FaEye />
                    </div>
                    <div className="stat-body">
                      <p className="stat-value">
                        {(dashboardStats?.visits?.count ?? 0).toLocaleString()}
                      </p>
                      <p className="stat-label">
                        {language === "he" ? "ביקורים" : "Site Visits"}
                      </p>
                      {dashboardStats?.visits?.trend !== undefined && (
                        <span
                          className={`stat-trend ${dashboardStats.visits.trend >= 0 ? "trend-up" : "trend-down"}`}
                        >
                          {dashboardStats.visits.trend >= 0 ? (
                            <FaArrowUp />
                          ) : (
                            <FaArrowDown />
                          )}
                          {Math.abs(dashboardStats.visits.trend)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Recent Orders preview ── */}
                <div
                  className="admin-table-card"
                  style={{ marginTop: "1.5rem" }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "1rem",
                    }}
                  >
                    <h3 style={{ color: "var(--color-primary)", margin: 0 }}>
                      {language === "he" ? "הזמנות אחרונות" : "Recent Orders"}
                    </h3>
                    <button
                      className="btn-gold"
                      style={{ padding: "0.4rem 1rem", fontSize: "0.8rem" }}
                      onClick={() => setActiveTab("orders")}
                    >
                      {language === "he"
                        ? "צפייה בכל ההזמנות"
                        : "View All Orders"}
                    </button>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>
                            {language === "he" ? "מספר הזמנה" : "Order #"}
                          </th>
                          <th>{language === "he" ? "לקוח" : "Customer"}</th>
                          <th>{language === "he" ? "סכום" : "Amount"}</th>
                          <th>{language === "he" ? "תשלום" : "Payment"}</th>
                          <th>{language === "he" ? "סטטוס" : "Status"}</th>
                          <th>{language === "he" ? "תאריך" : "Date"}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...orders]
                          .sort(
                            (a, b) =>
                              new Date(b.createdAt) - new Date(a.createdAt),
                          )
                          .slice(0, 8)
                          .map((order) => (
                            <tr key={order._id || order.id}>
                              <td>
                                <code
                                  style={{
                                    fontSize: "0.78rem",
                                    color: "var(--color-secondary)",
                                    fontWeight: 700,
                                  }}
                                >
                                  {String(order._id || order.id)
                                    .slice(-8)
                                    .toUpperCase()}
                                </code>
                              </td>
                              <td className="text-bold">
                                {order.customerName || "-"}
                              </td>
                              <td className="text-bold">
                                ₪{order.totalPrice || 0}
                              </td>
                              <td>
                                <span
                                  className={`status-badge ${
                                    order.paymentStatus === "completed"
                                      ? "status-active"
                                      : order.paymentStatus === "failed"
                                        ? "status-blocked"
                                        : "status-pending"
                                  }`}
                                >
                                  <span className="status-dot"></span>
                                  {order.paymentStatus === "completed"
                                    ? language === "he"
                                      ? "שולם"
                                      : "Paid"
                                    : order.paymentStatus === "failed"
                                      ? language === "he"
                                        ? "נכשל"
                                        : "Failed"
                                      : language === "he"
                                        ? "ממתין"
                                        : "Pending"}
                                </span>
                              </td>
                              <td>
                                <span
                                  className={`status-badge ${
                                    order.status === "delivered"
                                      ? "status-active"
                                      : order.status === "cancelled"
                                        ? "status-blocked"
                                        : "status-pending"
                                  }`}
                                >
                                  <span className="status-dot"></span>
                                  {{
                                    pending:
                                      language === "he" ? "בהמתנה" : "Pending",
                                    processing:
                                      language === "he"
                                        ? "בעיבוד"
                                        : "Processing",
                                    shipped:
                                      language === "he" ? "נשלחה" : "Shipped",
                                    delivered:
                                      language === "he" ? "נמסרה" : "Delivered",
                                    cancelled:
                                      language === "he" ? "בוטלה" : "Cancelled",
                                  }[order.status] || order.status}
                                </span>
                              </td>
                              <td className="text-muted">
                                {formatDate(order.createdAt)}
                              </td>
                            </tr>
                          ))}
                        {orders.length === 0 && (
                          <tr>
                            <td colSpan="6" className="empty-table">
                              {language === "he"
                                ? "אין הזמנות עדיין"
                                : "No orders yet"}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* ───────────────── PRODUCTS TAB ───────────────── */}
        {activeTab === "products" && (
          <>
            {/* Section Header */}
            <div className="section-header">
              <div>
                <h1>
                  {language === "he" ? "ניהול מוצרים" : "Product Management"}
                </h1>
                <p className="section-subtitle">
                  {language === "he"
                    ? `מנהל ${filteredProducts.length} פריטים בחנות`
                    : `Managing ${filteredProducts.length} items in store`}
                </p>
              </div>
              <div className="section-actions">
                <div className="search-input-wrapper">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    className="search-input"
                    placeholder={
                      language === "he"
                        ? "חיפוש מוצר, קטגוריה..."
                        : "Search product, category..."
                    }
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
                <button
                  className="btn-gold"
                  onClick={() => {
                    setEditingProduct(null);
                    setShowProductForm(true);
                  }}
                >
                  <FaPlus />
                  {language === "he" ? "הוסף מוצר" : "Add Product"}
                </button>
              </div>
            </div>

            {/* Desktop Table */}
            <div className="admin-table-card desktop-only">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{language === "he" ? "תמונה" : "Image"}</th>
                    <th>{language === "he" ? "שם מוצר" : "Product Name"}</th>
                    <th>{language === "he" ? "קטגוריה" : "Category"}</th>
                    <th>{language === "he" ? "מחיר" : "Price"}</th>
                    <th>{language === "he" ? "סטטוס" : "Status"}</th>
                    <th>{language === "he" ? "פעולות" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="empty-table">
                        {language === "he"
                          ? "טוען מוצרים..."
                          : "Loading products..."}
                      </td>
                    </tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-table">
                        {language === "he"
                          ? "לא נמצאו מוצרים"
                          : "No products found"}
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product._id || product.id}>
                        <td>
                          <div className="product-thumb">
                            {Array.isArray(product.images) &&
                            product.images[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                onError={(e) => {
                                  e.target.src =
                                    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400";
                                }}
                              />
                            ) : (
                              <div className="product-thumb-placeholder">
                                {language === "he" ? "ללא תמונה" : "No image"}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="product-name-cell">
                          {product.name}
                          {product.nameEn && (
                            <span className="product-name-sub">
                              {product.nameEn}
                            </span>
                          )}
                        </td>
                        <td className="text-muted">
                          {product.category}
                          {product.categoryEn && (
                            <span className="product-name-sub">
                              {product.categoryEn}
                            </span>
                          )}
                        </td>
                        <td className="text-bold">₪{product.price}</td>
                        <td>
                          <span
                            className={`status-badge ${
                              product.status === "active"
                                ? "status-active"
                                : "status-inactive"
                            }`}
                          >
                            <span className="status-dot"></span>
                            {product.status === "active"
                              ? language === "he"
                                ? "פעיל"
                                : "Active"
                              : language === "he"
                                ? "לא פעיל"
                                : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button
                              className="icon-btn icon-btn-edit"
                              onClick={() => {
                                setEditingProduct(product);
                                setShowProductForm(true);
                              }}
                              title={language === "he" ? "ערוך" : "Edit"}
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="icon-btn icon-btn-delete"
                              onClick={() =>
                                handleDeleteProductWithImage(
                                  product._id || product.id,
                                )
                              }
                              title={language === "he" ? "מחק" : "Delete"}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="mobile-cards mobile-only">
              {loading ? (
                <div className="loading-state">
                  {language === "he" ? "טוען..." : "Loading..."}
                </div>
              ) : filteredProducts.length === 0 ? (
                <p className="empty-table">
                  {language === "he" ? "לא נמצאו מוצרים" : "No products found"}
                </p>
              ) : (
                filteredProducts.map((product) => (
                  <div
                    key={product._id || product.id}
                    className="product-card-mobile"
                  >
                    <div className="product-card-image">
                      {Array.isArray(product.images) && product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400";
                          }}
                        />
                      ) : (
                        <div className="product-thumb-placeholder">
                          {language === "he" ? "ללא תמונה" : "No image"}
                        </div>
                      )}
                    </div>
                    <div className="product-card-body">
                      <div className="product-card-header">
                        <h3>{product.name}</h3>
                        <div className="card-actions">
                          <button
                            className="icon-btn icon-btn-edit"
                            onClick={() => {
                              setEditingProduct(product);
                              setShowProductForm(true);
                            }}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="icon-btn icon-btn-delete"
                            onClick={() =>
                              handleDeleteProductWithImage(
                                product._id || product.id,
                              )
                            }
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                      <p className="text-muted" style={{ fontSize: "0.8rem" }}>
                        {product.category}
                      </p>
                      <div className="product-card-footer">
                        <span className="text-bold">₪{product.price}</span>
                        <span
                          className={`status-badge ${
                            product.status === "active"
                              ? "status-active"
                              : "status-inactive"
                          }`}
                        >
                          {product.status === "active"
                            ? language === "he"
                              ? "פעיל"
                              : "Active"
                            : language === "he"
                              ? "לא פעיל"
                              : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* ───────────────── USERS TAB ───────────────── */}
        {activeTab === "users" && isROI() && (
          <>
            <div className="section-header">
              <div>
                <h1>
                  {language === "he" ? "ניהול משתמשים" : "User Management"}
                </h1>
                <p className="section-subtitle">
                  {language === "he"
                    ? `סה"כ ${users.length} משתמשים רשומים`
                    : `Total ${users.length} registered users`}
                </p>
              </div>
              <div className="section-actions">
                <div className="search-input-wrapper">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    className="search-input"
                    placeholder={
                      language === "he" ? "חיפוש משתמשים..." : "Search users..."
                    }
                    value={userSearchTerm}
                    onChange={handleUserSearch}
                  />
                </div>
                <span className="user-count-badge">
                  {language === "he"
                    ? `${filteredUsers.length} תוצאות`
                    : `${filteredUsers.length} results`}
                </span>
              </div>
            </div>

            <div className="admin-table-card">
              {loading ? (
                <div className="loading-state">
                  {language === "he" ? "טוען משתמשים..." : "Loading users..."}
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>{language === "he" ? "שם פרטי" : "First Name"}</th>
                        <th>{language === "he" ? "שם משפחה" : "Last Name"}</th>
                        <th>{language === "he" ? "אימייל" : "Email"}</th>
                        <th>{language === "he" ? "טלפון" : "Phone"}</th>
                        <th>{language === "he" ? "תפקיד" : "Role"}</th>
                        <th>{language === "he" ? "סטטוס" : "Status"}</th>
                        <th>{language === "he" ? "הצטרף" : "Joined"}</th>
                        <th>{language === "he" ? "פעולות" : "Actions"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td>{user.firstname}</td>
                          <td>{user.lastname}</td>
                          <td>{user.email}</td>
                          <td>{user.phone}</td>
                          <td>
                            <select
                              className="role-select"
                              value={user.role}
                              onChange={(e) =>
                                handleChangeUserRole(user.id, e.target.value)
                              }
                              disabled={
                                user.id ===
                                  JSON.parse(
                                    localStorage.getItem("user") || "{}",
                                  ).id ||
                                user._id ===
                                  JSON.parse(
                                    localStorage.getItem("user") || "{}",
                                  )._id
                              }
                            >
                              <option value="user">
                                {language === "he" ? "משתמש" : "User"}
                              </option>
                              <option value="admin">
                                {language === "he" ? "מנהל" : "Admin"}
                              </option>
                              <option value="roi">
                                {language === "he"
                                  ? "🔒 מנהל ניטור (ROI)"
                                  : "🔒 Device Manager (ROI)"}
                              </option>
                            </select>
                          </td>
                          <td>
                            <span
                              className={`status-badge ${
                                user.blocked
                                  ? "status-blocked"
                                  : "status-active"
                              }`}
                            >
                              <span className="status-dot"></span>
                              {user.blocked
                                ? language === "he"
                                  ? "חסום"
                                  : "Blocked"
                                : language === "he"
                                  ? "פעיל"
                                  : "Active"}
                            </span>
                          </td>
                          <td>{formatDate(user.createdAt)}</td>
                          <td>
                            <div className="row-actions">
                              <button
                                className={`action-btn ${user.blocked ? "unblock" : "block"}`}
                                onClick={() => handleBlockUser(user.id)}
                              >
                                {user.blocked
                                  ? language === "he"
                                    ? "בטל חסימה"
                                    : "Unblock"
                                  : language === "he"
                                    ? "חסום"
                                    : "Block"}
                              </button>
                              <button
                                className="icon-btn icon-btn-delete"
                                onClick={() => handleDeleteUser(user.id)}
                                title={language === "he" ? "מחק" : "Delete"}
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ───────────────── ORDERS TAB ───────────────── */}
        {activeTab === "orders" && (
          <>
            <div className="section-header">
              <div>
                <h1>
                  {language === "he" ? "ניהול הזמנות" : "Order Management"}
                </h1>
                <p className="section-subtitle">
                  {language === "he"
                    ? `סה"כ ${filteredOrders.length} הזמנות`
                    : `Total ${filteredOrders.length} orders`}
                </p>
              </div>
              <div className="section-actions">
                <div className="search-input-wrapper">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    className="search-input"
                    placeholder={
                      language === "he"
                        ? "חיפוש לפי שם, אימייל, טלפון..."
                        : "Search by name, email, phone..."
                    }
                    value={orderSearchTerm}
                    onChange={(e) => setOrderSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="filter-select"
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                >
                  <option value="all">
                    {language === "he" ? "כל ההזמנות" : "All Orders"}
                  </option>
                  <option value="pending">
                    {language === "he" ? "בהמתנה" : "Pending"}
                  </option>
                  <option value="processing">
                    {language === "he" ? "בעיבוד" : "Processing"}
                  </option>
                  <option value="shipped">
                    {language === "he" ? "נשלחה" : "Shipped"}
                  </option>
                  <option value="delivered">
                    {language === "he" ? "נמסרה" : "Delivered"}
                  </option>
                  <option value="cancelled">
                    {language === "he" ? "בוטלה" : "Cancelled"}
                  </option>
                </select>
                <button className="btn-gold" onClick={fetchOrders} title="רענן">
                  ↻
                </button>
              </div>
            </div>

            <div className="admin-table-card">
              {ordersLoading ? (
                <div className="loading-state">
                  {language === "he" ? "טוען הזמנות..." : "Loading orders..."}
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>{language === "he" ? "מספר הזמנה" : "Order #"}</th>
                        <th>{language === "he" ? "לקוח" : "Customer"}</th>
                        <th>
                          {language === "he"
                            ? "אימייל / טלפון"
                            : "Email / Phone"}
                        </th>
                        <th>
                          {language === "he" ? "כתובת משלוח" : "Shipping"}
                        </th>
                        <th>{language === "he" ? "סכום ששולם" : "Paid"}</th>
                        <th>{language === "he" ? "קופון" : "Coupon"}</th>
                        <th>{language === "he" ? "תשלום" : "Payment"}</th>
                        <th>
                          {language === "he" ? "סטטוס הזמנה" : "Order Status"}
                        </th>
                        <th>{language === "he" ? "תאריך" : "Date"}</th>
                        <th>{language === "he" ? "פריטים" : "Items"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => {
                        const orderId = order._id || order.id;
                        const items = order.items || [];
                        const shipping = order.shippingAddress || {};
                        return (
                          <tr key={orderId}>
                            <td>
                              <code
                                style={{
                                  fontSize: "0.78rem",
                                  color: "var(--color-secondary)",
                                  fontWeight: 700,
                                }}
                              >
                                {String(orderId).slice(-8).toUpperCase()}
                              </code>
                            </td>
                            <td className="text-bold">
                              {order.customerName || "-"}
                            </td>
                            <td>
                              <span>
                                {order.customerEmail || order.email || "-"}
                              </span>
                              {(order.customerPhone || order.phone) && (
                                <span className="product-name-sub">
                                  {order.customerPhone || order.phone}
                                </span>
                              )}
                            </td>
                            <td>
                              {shipping.address ? (
                                <>
                                  <span style={{ fontSize: "0.82rem" }}>
                                    {shipping.address}
                                  </span>
                                  <span className="product-name-sub">
                                    {[shipping.city, shipping.zipCode]
                                      .filter(Boolean)
                                      .join(", ")}
                                  </span>
                                </>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td className="text-bold">
                              ₪{order.totalPrice || 0}
                              {order.discountPercent > 0 && (
                                <span
                                  className="product-name-sub"
                                  style={{ color: "#27ae60" }}
                                >
                                  {language === "he"
                                    ? `הנחה ${order.discountPercent}%`
                                    : `${order.discountPercent}% off`}
                                </span>
                              )}
                            </td>
                            <td>
                              {order.couponCode ? (
                                <code
                                  style={{
                                    fontSize: "0.78rem",
                                    color: "var(--color-secondary)",
                                    fontWeight: 700,
                                  }}
                                >
                                  {order.couponCode}
                                </code>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td>
                              <span
                                className={`status-badge ${
                                  order.paymentStatus === "completed"
                                    ? "status-active"
                                    : order.paymentStatus === "failed"
                                      ? "status-blocked"
                                      : "status-pending"
                                }`}
                              >
                                <span className="status-dot"></span>
                                {order.paymentStatus === "completed"
                                  ? language === "he"
                                    ? "שולם"
                                    : "Paid"
                                  : order.paymentStatus === "failed"
                                    ? language === "he"
                                      ? "נכשל"
                                      : "Failed"
                                    : language === "he"
                                      ? "ממתין"
                                      : "Pending"}
                              </span>
                            </td>
                            <td>
                              <select
                                className={`status-select status-${order.status}`}
                                value={order.status || "pending"}
                                onChange={(e) =>
                                  handleOrderStatusChange(
                                    orderId,
                                    e.target.value,
                                  )
                                }
                              >
                                <option value="pending">
                                  {language === "he" ? "בהמתנה" : "Pending"}
                                </option>
                                <option value="processing">
                                  {language === "he" ? "בעיבוד" : "Processing"}
                                </option>
                                <option value="shipped">
                                  {language === "he" ? "נשלחה" : "Shipped"}
                                </option>
                                <option value="delivered">
                                  {language === "he" ? "נמסרה" : "Delivered"}
                                </option>
                                <option value="cancelled">
                                  {language === "he" ? "בוטלה" : "Cancelled"}
                                </option>
                              </select>
                            </td>
                            <td className="text-muted">
                              {formatDate(order.createdAt)}
                            </td>
                            <td>
                              <details>
                                <summary className="items-summary">
                                  {language === "he"
                                    ? `${items.length} פריטים`
                                    : `${items.length} items`}
                                </summary>
                                <ul className="items-list">
                                  {items.map((item, i) => (
                                    <li key={item.productId || item.id || i}>
                                      {item.name} x{item.quantity} – ₪
                                      {item.price * item.quantity}
                                      {item.selectedOptions &&
                                        Object.keys(item.selectedOptions)
                                          .length > 0 && (
                                          <span
                                            style={{
                                              fontSize: "0.75rem",
                                              color: "rgba(44,62,80,0.5)",
                                              display: "block",
                                            }}
                                          >
                                            {Object.entries(
                                              item.selectedOptions,
                                            )
                                              .map(([k, v]) => `${k}: ${v}`)
                                              .join(", ")}
                                          </span>
                                        )}
                                    </li>
                                  ))}
                                </ul>
                              </details>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredOrders.length === 0 && (
                        <tr>
                          <td colSpan="10" className="empty-table">
                            {language === "he"
                              ? "לא נמצאו הזמנות"
                              : "No orders found"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ───────────────── DEVICES TAB ───────────────── */}
        {activeTab === "devices" && isROI() && (
          <>
            <div className="section-header">
              <div>
                <h1>
                  {language === "he" ? "ניהול מכשירים" : "Device Management"}
                </h1>
                <p className="section-subtitle">
                  {language === "he"
                    ? `סה"כ ${filteredDevices.length} מכשירים`
                    : `Total ${filteredDevices.length} devices`}
                </p>
              </div>
              <div className="section-actions">
                <div className="search-input-wrapper">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    className="search-input"
                    placeholder={
                      language === "he"
                        ? "חיפוש לפי IP או מכשיר..."
                        : "Search by IP or device..."
                    }
                    value={deviceSearchTerm}
                    onChange={(e) => setDeviceSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Firewall Section */}
            <div className="firewall-section">
              <h3>
                {language === "he"
                  ? "🔥 ניהול חומת אש"
                  : "🔥 Firewall Management"}
              </h3>
              <div className="firewall-input-group">
                <div className="search-input-wrapper" style={{ flex: 1 }}>
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    className="search-input"
                    style={{ width: "100%" }}
                    placeholder={
                      language === "he"
                        ? "הזן כתובת IP (דוגמה: 192.168.1.100)"
                        : "Enter IP address (e.g. 192.168.1.100)"
                    }
                    value={newFirewallIP}
                    onChange={(e) => setNewFirewallIP(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") handleAddToFirewall();
                    }}
                  />
                </div>
                <button className="btn-gold" onClick={handleAddToFirewall}>
                  <FaPlus />
                  {language === "he" ? "הוסף לחומת אש" : "Add to Firewall"}
                </button>
              </div>

              {firewall.length > 0 && (
                <div className="firewall-list">
                  <h4
                    style={{
                      marginBottom: "var(--spacing-sm)",
                      color: "#e74c3c",
                    }}
                  >
                    {language === "he"
                      ? `כתובות IP חסומות (${firewall.length})`
                      : `Blocked IPs (${firewall.length})`}
                  </h4>
                  <div className="firewall-grid">
                    {firewall.map((ip, index) => (
                      <div key={index} className="firewall-item">
                        <code className="ip-address">{ip}</code>
                        <button
                          className="icon-btn icon-btn-delete"
                          onClick={() => removeFromFirewall(ip)}
                          title={
                            language === "he"
                              ? "הסר מחומת אש"
                              : "Remove from firewall"
                          }
                        >
                          {language === "he" ? "🗑️ הסר" : "🗑️ Remove"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="admin-table-card">
              <div style={{ overflowX: "auto" }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>{language === "he" ? "כתובת IP" : "IP Address"}</th>
                      <th>
                        {language === "he"
                          ? "מכשיר / דפדפן"
                          : "Device / Browser"}
                      </th>
                      <th>{language === "he" ? "מערכת הפעלה" : "OS"}</th>
                      <th>{language === "he" ? "מיקום" : "Location"}</th>
                      <th>
                        {language === "he" ? "מסך / שפה" : "Screen / Lang"}
                      </th>
                      <th>
                        {language === "he" ? "ספירת כניסות" : "Login Count"}
                      </th>
                      <th>
                        {language === "he" ? "כניסה אחרונה" : "Last Login"}
                      </th>
                      <th>{language === "he" ? "סטטוס" : "Status"}</th>
                      <th>{language === "he" ? "פעולות" : "Actions"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDevices.map((device) => (
                      <tr key={device._id || device.id}>
                        <td>
                          <code className="ip-address">{device.ipAddress}</code>
                        </td>
                        <td>
                          <strong>{device.deviceName || "-"}</strong>
                          {device.browser && (
                            <span className="product-name-sub">
                              {device.browser}
                            </span>
                          )}
                        </td>
                        <td className="text-muted">{device.os || "-"}</td>
                        <td>
                          <strong>
                            {device.location?.city && device.location?.country
                              ? `${device.location.city}, ${device.location.country}`
                              : device.location?.city ||
                                device.location?.country ||
                                "-"}
                          </strong>
                          <span className="product-name-sub">
                            {typeof device.location?.timezone === "string"
                              ? device.location.timezone
                              : ""}
                          </span>
                        </td>
                        <td className="text-muted">
                          {device.screen || "-"}
                          {device.language && (
                            <span className="product-name-sub">
                              {device.language}
                            </span>
                          )}
                        </td>
                        <td>
                          <span className="login-count">
                            {device.loginCount}
                          </span>
                        </td>
                        <td>{formatDate(device.lastLogin)}</td>
                        <td>
                          <span
                            className={`status-badge ${
                              device.blocked
                                ? "status-blocked"
                                : "status-active"
                            }`}
                          >
                            <span className="status-dot"></span>
                            {device.blocked
                              ? language === "he"
                                ? "חסום"
                                : "Blocked"
                              : language === "he"
                                ? "פעיל"
                                : "Active"}
                          </span>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button
                              className={`action-btn ${device.blocked ? "unblock" : "block"}`}
                              onClick={() =>
                                handleBlockIP(device._id || device.id)
                              }
                            >
                              {device.blocked
                                ? language === "he"
                                  ? "בטל חסימה"
                                  : "Unblock"
                                : language === "he"
                                  ? "חסום IP"
                                  : "Block IP"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredDevices.length === 0 && (
                      <tr>
                        <td colSpan="9" className="empty-table">
                          {language === "he"
                            ? "לא נמצאו מכשירים"
                            : "No devices found"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Blocked IPs Summary */}
            <div className="blocked-ips-summary">
              <h3>
                {language === "he"
                  ? "📋 רשימת כתובות IP החסומות"
                  : "📋 Blocked IP Addresses"}
              </h3>
              {blockedIPs.length > 0 ? (
                <ul className="blocked-ips-list">
                  {blockedIPs.map((ip) => (
                    <li key={ip}>
                      <code>{ip}</code>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: "#999", fontStyle: "italic" }}>
                  {language === "he"
                    ? "אין כתובות IP חסומות כרגע"
                    : "No blocked IP addresses at the moment"}
                </p>
              )}
            </div>
          </>
        )}

        {/* ───────────────── COUPONS TAB ───────────────── */}
        {activeTab === "coupons" && (
          <>
            <div className="section-header">
              <div>
                <h1>{language === "he" ? "קודי קופון" : "Coupon Codes"}</h1>
                <p className="section-subtitle">
                  {language === "he"
                    ? `${coupons.length} קודים פעילים`
                    : `${coupons.length} active codes`}
                </p>
              </div>
            </div>

            {/* Create Coupon Form */}
            <div
              className="admin-table-card"
              style={{ marginBottom: "1.5rem" }}
            >
              <h3
                style={{ marginBottom: "1rem", color: "var(--color-primary)" }}
              >
                {language === "he" ? "צור קופון חדש" : "Create New Coupon"}
              </h3>
              <div className="coupon-create-form">
                <div className="form-group">
                  <label>{language === "he" ? "קוד" : "Code"}</label>
                  <input
                    type="text"
                    className="search-input"
                    style={{ textTransform: "uppercase" }}
                    placeholder={
                      language === "he" ? "לדוגמא: SUMMER20" : "e.g. SUMMER20"
                    }
                    value={newCoupon.code}
                    onChange={(e) =>
                      setNewCoupon((p) => ({
                        ...p,
                        code: e.target.value.toUpperCase(),
                      }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label>
                    {language === "he" ? "אחוז הנחה" : "Discount %"}
                  </label>
                  <input
                    type="number"
                    className="search-input"
                    min="1"
                    max="100"
                    placeholder="10"
                    value={newCoupon.discountPercent}
                    onChange={(e) =>
                      setNewCoupon((p) => ({
                        ...p,
                        discountPercent: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label>
                    {language === "he"
                      ? "תיאור (אפציונלי)"
                      : "Description (optional)"}
                  </label>
                  <input
                    type="text"
                    className="search-input"
                    placeholder={
                      language === "he"
                        ? "דוגמא: קופון קיץ"
                        : "e.g. Summer sale"
                    }
                    value={newCoupon.description}
                    onChange={(e) =>
                      setNewCoupon((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>
                <button
                  className="btn-gold"
                  onClick={handleCreateCoupon}
                  disabled={couponLoading}
                  style={{ alignSelf: "flex-end" }}
                >
                  <FaPlus />
                  {couponLoading
                    ? language === "he"
                      ? "יוצר..."
                      : "Creating..."
                    : language === "he"
                      ? "צור קופון"
                      : "Create Coupon"}
                </button>
              </div>
            </div>

            {/* Coupons Table */}
            <div className="admin-table-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{language === "he" ? "קוד" : "Code"}</th>
                    <th>{language === "he" ? "הנחה" : "Discount"}</th>
                    <th>{language === "he" ? "סוג" : "Type"}</th>
                    <th>{language === "he" ? "תיאור" : "Description"}</th>
                    <th>{language === "he" ? "סטאטוס" : "Status"}</th>
                    <th>{language === "he" ? "פעולות" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-table">
                        {language === "he"
                          ? "אין קודי קופון עדיין"
                          : "No coupon codes yet"}
                      </td>
                    </tr>
                  ) : (
                    coupons.map((coupon) => (
                      <tr key={coupon._id || coupon.id}>
                        <td>
                          <code
                            style={{
                              fontWeight: 700,
                              letterSpacing: "0.08rem",
                              color: "var(--color-secondary)",
                            }}
                          >
                            {coupon.code}
                          </code>
                        </td>
                        <td style={{ fontWeight: 700 }}>
                          {coupon.discountPercent}%
                        </td>
                        <td>
                          <span
                            className={`status-badge ${
                              coupon.type === "newsletter"
                                ? "status-pending"
                                : "status-active"
                            }`}
                          >
                            <span className="status-dot"></span>
                            {coupon.type === "newsletter"
                              ? language === "he"
                                ? "ניוזלטר"
                                : "Newsletter"
                              : language === "he"
                                ? "ידני"
                                : "Manual"}
                          </span>
                        </td>
                        <td className="text-muted">
                          {coupon.description || "-"}
                        </td>
                        <td>
                          <span
                            className={`status-badge ${
                              coupon.isActive !== false
                                ? "status-active"
                                : "status-blocked"
                            }`}
                          >
                            <span className="status-dot"></span>
                            {coupon.isActive !== false
                              ? language === "he"
                                ? "פעיל"
                                : "Active"
                              : language === "he"
                                ? "לא פעיל"
                                : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button
                              className="icon-btn icon-btn-delete"
                              onClick={() =>
                                handleDeleteCoupon(coupon._id || coupon.id)
                              }
                              title={
                                language === "he"
                                  ? "מחק קופון"
                                  : "Delete coupon"
                              }
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
        {/* ───────────────── NEWSLETTER TAB ───────────────── */}
        {activeTab === "newsletter" && (
          <>
            <div className="section-header">
              <div>
                <h1>
                  {language === "he"
                    ? "ניהול ניוזלטר"
                    : "Newsletter Management"}
                </h1>
                <p className="section-subtitle">
                  {language === "he"
                    ? `${subscribers.length} מנויים רשומים`
                    : `${subscribers.length} registered subscribers`}
                </p>
              </div>
              <div className="section-actions">
                <div className="search-input-wrapper">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    className="search-input"
                    placeholder={
                      language === "he"
                        ? "חיפוש לפי אימייל..."
                        : "Search by email..."
                    }
                    value={newsletterSearchTerm}
                    onChange={(e) => setNewsletterSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Stats cards */}
            <div
              style={{
                display: "flex",
                gap: "1rem",
                marginBottom: "1.5rem",
                flexWrap: "wrap",
              }}
            >
              <div
                className="admin-table-card"
                style={{
                  flex: 1,
                  minWidth: 160,
                  textAlign: "center",
                  padding: "1.25rem",
                }}
              >
                <p
                  style={{
                    fontSize: "2rem",
                    fontWeight: 800,
                    color: "var(--color-secondary)",
                    margin: 0,
                  }}
                >
                  {subscribers.length}
                </p>
                <p
                  style={{
                    margin: 0,
                    color: "rgba(44,62,80,0.6)",
                    fontSize: "0.85rem",
                  }}
                >
                  {language === "he" ? 'סה"כ מנויים' : "Total Subscribers"}
                </p>
              </div>
              <div
                className="admin-table-card"
                style={{
                  flex: 1,
                  minWidth: 160,
                  textAlign: "center",
                  padding: "1.25rem",
                }}
              >
                <p
                  style={{
                    fontSize: "2rem",
                    fontWeight: 800,
                    color: "var(--color-secondary)",
                    margin: 0,
                  }}
                >
                  {
                    subscribers.filter((s) => {
                      const d = new Date(s.subscribedAt || s.createdAt);
                      const now = new Date();
                      return (
                        d.getMonth() === now.getMonth() &&
                        d.getFullYear() === now.getFullYear()
                      );
                    }).length
                  }
                </p>
                <p
                  style={{
                    margin: 0,
                    color: "rgba(44,62,80,0.6)",
                    fontSize: "0.85rem",
                  }}
                >
                  {language === "he" ? "הצטרפו החודש" : "Joined This Month"}
                </p>
              </div>
            </div>

            {/* Subscribers Table */}
            <div className="admin-table-card">
              {newsletterLoading ? (
                <p
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                    color: "rgba(44,62,80,0.5)",
                  }}
                >
                  {language === "he" ? "טוען..." : "Loading..."}
                </p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>{language === "he" ? "אימייל" : "Email"}</th>
                      <th>{language === "he" ? "קוד קופון" : "Coupon Code"}</th>
                      <th>
                        {language === "he" ? "תאריך הרשמה" : "Subscribed At"}
                      </th>
                      <th>{language === "he" ? "פעולות" : "Actions"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers
                      .filter((s) =>
                        (s.email || "")
                          .toLowerCase()
                          .includes(newsletterSearchTerm.toLowerCase()),
                      )
                      .map((s, idx) => (
                        <tr key={s._id || s.id}>
                          <td className="text-muted">{idx + 1}</td>
                          <td style={{ fontWeight: 600 }}>{s.email}</td>
                          <td>
                            {s.couponCode ? (
                              <code
                                style={{
                                  fontWeight: 700,
                                  letterSpacing: "0.06rem",
                                  color: "var(--color-secondary)",
                                }}
                              >
                                {s.couponCode}
                              </code>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td className="text-muted">
                            {formatDate(s.subscribedAt || s.createdAt)}
                          </td>
                          <td>
                            <div className="row-actions">
                              <button
                                className="icon-btn icon-btn-delete"
                                onClick={() =>
                                  handleDeleteSubscriber(s._id || s.id)
                                }
                                title={
                                  language === "he"
                                    ? "מחק מנוי"
                                    : "Delete subscriber"
                                }
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    {subscribers.filter((s) =>
                      (s.email || "")
                        .toLowerCase()
                        .includes(newsletterSearchTerm.toLowerCase()),
                    ).length === 0 && (
                      <tr>
                        <td colSpan="5" className="empty-table">
                          {language === "he"
                            ? "אין מנויים עדיין"
                            : "No subscribers yet"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* ───────────────── DOCUMENTS TAB ───────────────── */}
        {activeTab === "documents" && <PayPlusDocumentForm />}
      </div>

      {/* ─── ProductForm Modal (with image upload) ─── */}
      {showProductForm && (
        <div
          className="product-form-modal"
          onClick={() => {
            setShowProductForm(false);
            setEditingProduct(null);
          }}
        >
          <div
            className="product-form-container"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setShowProductForm(false);
                setEditingProduct(null);
              }}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                zIndex: 10,
              }}
            >
              ✕
            </button>
            <ProductForm
              onSuccess={handleProductFormSuccess}
              initialProduct={editingProduct}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
