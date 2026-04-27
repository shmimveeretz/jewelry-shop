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
} from "react-icons/fa";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../contexts/LanguageContext";
import ProductForm from "../components/ProductForm";
import { getAllProducts, deleteProduct } from "../services/productApi";
import "../styles/pages/Admin.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Admin() {
  const { language, t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState("products");
  const [loading, setLoading] = useState(false);

  // Products State - Load from data files
  const [products, setProducts] = useState([]);

  // Users State
  const [users, setUsers] = useState([]);

  // Orders State - Mock data
  const [orders, setOrders] = useState([
    // {
    //   id: "ORD-001",
    //   customerId: "user-1",
    //   customerName: "רוי רביב",
    //   email: "raviroi@gmail.com",
    //   totalPrice: 2890,
    //   status: "pending",
    //   createdAt: "2026-01-28T14:30:00",
    //   items: [
    //     { id: "aleph", name: "אלף", price: 890, quantity: 2 },
    //     { id: "ruby-odem", name: "אבן רובי", price: 1290, quantity: 1 },
    //   ],
    // },
    // {
    //   id: "ORD-002",
    //   customerId: "user-2",
    //   customerName: "דנה כהן",
    //   email: "dana@gmail.com",
    //   totalPrice: 950,
    //   status: "shipped",
    //   createdAt: "2026-01-27T10:15:00",
    //   items: [
    //     { id: "aries-pendant", name: "תליון מזל טלה", price: 950, quantity: 1 },s
    //   ],
    // },
    // {
    //   id: "ORD-003",
    //   customerId: "user-3",
    //   customerName: "אברהם לוי",
    //   email: "abraham@gmail.com",
    //   totalPrice: 1690,
    //   status: "delivered",
    //   createdAt: "2026-01-25T08:45:00",
    //   items: [
    //     { id: "trinity-aries", name: "שלישיית טלה", price: 1690, quantity: 1 },
    //   ],
    // },
  ]);

  const [orderSearchTerm, setOrderSearchTerm] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [devices, setDevices] = useState([]);

  const [blockedIPs, setBlockedIPs] = useState([]);
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

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, []);

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
    setOrders(
      orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
    );
    const order = orders.find((o) => o.id === orderId);
    showSuccess(
      language === "he"
        ? `סטטוס ההזמנה ${orderId} עודכן`
        : `Order ${orderId} status updated`,
    );
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
      order.customerName
        .toLowerCase()
        .includes(orderSearchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(orderSearchTerm.toLowerCase());

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
        <div className="loading-state" style={{ minHeight: "50vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
        </ul>
      </nav>

      {/* ── Main Content ── */}
      <div className="admin-container">
        {/* ───────────────── PRODUCTS TAB ───────────────── */}
        {activeTab === "products" && (
          <>
            {/* Section Header */}
            <div className="section-header">
              <div>
                <h1>{language === "he" ? "ניהול מוצרים" : "Product Management"}</h1>
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
                        {language === "he" ? "טוען מוצרים..." : "Loading products..."}
                      </td>
                    </tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-table">
                        {language === "he" ? "לא נמצאו מוצרים" : "No products found"}
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product._id || product.id}>
                        <td>
                          <div className="product-thumb">
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
                        </td>
                        <td className="product-name-cell">
                          {product.name}
                          {product.nameEn && (
                            <span className="product-name-sub">{product.nameEn}</span>
                          )}
                        </td>
                        <td className="text-muted">
                          {product.category}
                          {product.categoryEn && (
                            <span className="product-name-sub">{product.categoryEn}</span>
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
                  <div key={product._id || product.id} className="product-card-mobile">
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
                              handleDeleteProductWithImage(product._id || product.id)
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
                <h1>{language === "he" ? "ניהול משתמשים" : "User Management"}</h1>
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
                                  JSON.parse(localStorage.getItem("user") || "{}")
                                    .id ||
                                user._id ===
                                  JSON.parse(localStorage.getItem("user") || "{}")
                                    ._id
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
                                user.blocked ? "status-blocked" : "status-active"
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
                <h1>{language === "he" ? "ניהול הזמנות" : "Order Management"}</h1>
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
                        ? "חיפוש הזמנה או לקוח..."
                        : "Search order or customer..."
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
                    {language === "he" ? "הוסלמה" : "Delivered"}
                  </option>
                  <option value="cancelled">
                    {language === "he" ? "בוטלה" : "Cancelled"}
                  </option>
                </select>
              </div>
            </div>

            <div className="admin-table-card">
              <div style={{ overflowX: "auto" }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>{language === "he" ? "מספר הזמנה" : "Order #"}</th>
                      <th>{language === "he" ? "לקוח" : "Customer"}</th>
                      <th>{language === "he" ? "אימייל" : "Email"}</th>
                      <th>{language === "he" ? "סכום" : "Total"}</th>
                      <th>{language === "he" ? "סטטוס" : "Status"}</th>
                      <th>{language === "he" ? "תאריך" : "Date"}</th>
                      <th>{language === "he" ? "פרטים" : "Items"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="text-bold">{order.id}</td>
                        <td>{order.customerName}</td>
                        <td className="text-muted">{order.email}</td>
                        <td className="price-cell">₪{order.totalPrice}</td>
                        <td>
                          <select
                            className={`status-select status-${order.status}`}
                            value={order.status}
                            onChange={(e) =>
                              handleOrderStatusChange(order.id, e.target.value)
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
                              {language === "he" ? "הוסלמה" : "Delivered"}
                            </option>
                            <option value="cancelled">
                              {language === "he" ? "בוטלה" : "Cancelled"}
                            </option>
                          </select>
                        </td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>
                          <details>
                            <summary className="items-summary">
                              {language === "he"
                                ? `${order.items.length} פריטים`
                                : `${order.items.length} items`}
                            </summary>
                            <ul className="items-list">
                              {order.items.map((item) => (
                                <li key={item.id}>
                                  {item.name} x{item.quantity} – ₪
                                  {item.price * item.quantity}
                                </li>
                              ))}
                            </ul>
                          </details>
                        </td>
                      </tr>
                    ))}
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan="7" className="empty-table">
                          {language === "he" ? "לא נמצאו הזמנות" : "No orders found"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ───────────────── DEVICES TAB ───────────────── */}
        {activeTab === "devices" && isROI() && (
          <>
            <div className="section-header">
              <div>
                <h1>{language === "he" ? "ניהול מכשירים" : "Device Management"}</h1>
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
                {language === "he" ? "🔥 ניהול חומת אש" : "🔥 Firewall Management"}
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
                  <h4 style={{ marginBottom: "var(--spacing-sm)", color: "#e74c3c" }}>
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
                          title={language === "he" ? "הסר מחומת אש" : "Remove from firewall"}
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
                      <th>{language === "he" ? "מכשיר / דפדפן" : "Device / Browser"}</th>
                      <th>{language === "he" ? "מערכת הפעלה" : "OS"}</th>
                      <th>{language === "he" ? "מיקום" : "Location"}</th>
                      <th>{language === "he" ? "מסך / שפה" : "Screen / Lang"}</th>
                      <th>{language === "he" ? "ספירת כניסות" : "Login Count"}</th>
                      <th>{language === "he" ? "כניסה אחרונה" : "Last Login"}</th>
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
                            <span className="product-name-sub">{device.browser}</span>
                          )}
                        </td>
                        <td className="text-muted">{device.os || "-"}</td>
                        <td>
                          <strong>
                            {device.location?.city && device.location?.country
                              ? `${device.location.city}, ${device.location.country}`
                              : device.location?.city || device.location?.country || "-"}
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
                            <span className="product-name-sub">{device.language}</span>
                          )}
                        </td>
                        <td>
                          <span className="login-count">{device.loginCount}</span>
                        </td>
                        <td>{formatDate(device.lastLogin)}</td>
                        <td>
                          <span
                            className={`status-badge ${
                              device.blocked ? "status-blocked" : "status-active"
                            }`}
                          >
                            <span className="status-dot"></span>
                            {device.blocked
                              ? language === "he" ? "חסום" : "Blocked"
                              : language === "he" ? "פעיל" : "Active"}
                          </span>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button
                              className={`action-btn ${device.blocked ? "unblock" : "block"}`}
                              onClick={() => handleBlockIP(device._id || device.id)}
                            >
                              {device.blocked
                                ? language === "he" ? "בטל חסימה" : "Unblock"
                                : language === "he" ? "חסום IP" : "Block IP"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredDevices.length === 0 && (
                      <tr>
                        <td colSpan="9" className="empty-table">
                          {language === "he" ? "לא נמצאו מכשירים" : "No devices found"}
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
