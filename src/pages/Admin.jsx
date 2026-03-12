import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../contexts/LanguageContext";
import ProductForm from "../components/ProductForm";
import { getAllProducts, deleteProduct } from "../services/productApi";
import "../styles/pages/Admin.css";

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
    {
      id: "ORD-001",
      customerId: "user-1",
      customer"name": "רוי רביב",
      email: "raviroi@gmail.com",
      totalPrice: 2890,
      status: "pending",
      createdAt: "2026-01-28T14:30:00",
      items: [
        { id: "aleph", "name": "אלף", price: 890, quantity: 2 },
        { id: "ruby-odem", "name": "אבן רובי", price: 1290, quantity: 1 },
      ],
    },
    {
      id: "ORD-002",
      customerId: "user-2",
      customer"name": "דנה כהן",
      email: "dana@gmail.com",
      totalPrice: 950,
      status: "shipped",
      createdAt: "2026-01-27T10:15:00",
      items: [
        { id: "aries-pendant", "name": "תליון מזל טלה", price: 950, quantity: 1 },
      ],
    },
    {
      id: "ORD-003",
      customerId: "user-3",
      customer"name": "אברהם לוי",
      email: "abraham@gmail.com",
      totalPrice: 1690,
      status: "delivered",
      createdAt: "2026-01-25T08:45:00",
      items: [
        { id: "trinity-aries", "name": "שלישיית טלה", price: 1690, quantity: 1 },
      ],
    },
  ]);

  const [orderSearchTerm, setOrderSearchTerm] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  // Devices State - Mock data (Only for role "roi")
  const [devices, setDevices] = useState([
    {
      id: "dev-1",
      ipAddress: "192.168.1.100",
      device"name": "Chrome - Windows",
      location: "ירושלים, ישראל",
      locationEn: "Jerusalem, Israel",
      lastLogin: "2026-01-30T14:30:00",
      loginCount: 12,
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      blocked: false,
    },
    {
      id: "dev-2",
      ipAddress: "203.45.67.89",
      device"name": "Safari - iPhone",
      location: "תל אביב, ישראל",
      locationEn: "Tel Aviv, Israel",
      lastLogin: "2026-01-29T10:15:00",
      loginCount: 8,
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)",
      blocked: false,
    },
    {
      id: "dev-3",
      ipAddress: "156.23.45.67",
      device"name": "Edge - Windows",
      location: "חיפה, ישראל",
      locationEn: "Haifa, Israel",
      lastLogin: "2026-01-28T16:45:00",
      loginCount: 5,
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit",
      blocked: false,
    },
  ]);

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
    "name": "",
    "nameEn": "",
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
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
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
      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
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
      (user.first"name" &&
        user.first"name".toLowerCase().includes(userSearchTerm.toLowerCase())) ||
      (user.last"name" &&
        user.last"name".toLowerCase().includes(userSearchTerm.toLowerCase())) ||
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
          ? `⚠️ אתה עומד לתת ל-${targetUser?.first"name"} גישה כמנהל ניטור (ROI). 👑 זה התפקיד הגבוה ביותר במערכת. האם אתה בטוח?`
          : `⚠️ You are about to grant ${targetUser?.first"name"} ROI access. 👑 This is the highest role in the system. Are you sure?`,
      );
      if (!confirmed) return;
    }

    // Warning when removing ROI role
    if (targetUser?.role === "roi" && newRole !== "roi") {
      const confirmed = window.confirm(
        language === "he"
          ? `⚠️ אתה עומד להסיר מ-${targetUser?.first"name"} את תפקיד מנהל ניטור (ROI). תפקיד זה הוא הגבוה ביותר. האם אתה בטוח?`
          : `⚠️ You are about to remove ${targetUser?.first"name"}'s ROI (highest) role. Are you sure?`,
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

          const roleDisplay"name"s = {
            user: language === "he" ? "משתמש" : "User",
            admin: language === "he" ? "מנהל" : "Admin",
            roi:
              language === "he" ? "מנהל ניטור (ROI)" : "Device Manager (ROI)",
          };

          showSuccess(
            language === "he"
              ? `✅ תפקיד המשתמש ${targetUser?.first"name"} עודכן ל-${roleDisplay"name"s[newRole]}`
              : `✅ ${targetUser?.first"name"}'s role updated to ${roleDisplay"name"s[newRole]}`,
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

    const user"name" = `${user.first"name"} ${user.last"name"}`;
    if (
      window.confirm(
        language === "he"
          ? `האם אתה בטוח שברצונך למחוק את המשתמש ${user"name"}?`
          : `Are you sure you want to delete ${user"name"}?`,
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

    const user"name" = `${user.first"name"} ${user.last"name"}`;
    const action = user.blocked ? "ביטול חסימה" : "חסימה";
    const actionEn = user.blocked ? "Unblock" : "Block";

    if (
      window.confirm(
        language === "he"
          ? `האם אתה בטוח שברצונך ${action} את המשתמש ${user"name"}?`
          : `Are you sure you want to ${actionEn} ${user"name"}?`,
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
      order.customer"name"
        .toLowerCase()
        .includes(orderSearchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(orderSearchTerm.toLowerCase());

    const matchesStatus =
      orderStatusFilter === "all" || order.status === orderStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleBlockIP = (deviceId) => {
    const device = devices.find((d) => d.id === deviceId);
    if (!device) return;

    setDevices(
      devices.map((d) =>
        d.id === deviceId ? { ...d, blocked: !d.blocked } : d,
      ),
    );

    if (!device.blocked) {
      setBlockedIPs([...blockedIPs, device.ipAddress]);
      showSuccess(
        language === "he"
          ? `כתובת IP ${device.ipAddress} חסומה בהצלחה`
          : `IP address ${device.ipAddress} blocked successfully`,
      );
    } else {
      setBlockedIPs(blockedIPs.filter((ip) => ip !== device.ipAddress));
      showSuccess(
        language === "he"
          ? `כתובת IP ${device.ipAddress} הוסרה מחסימה`
          : `IP address ${device.ipAddress} unblocked successfully`,
      );
    }
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
      const response = await fetch(
        `${API_BASE_URL}/api/firewall/remove`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ipAddress }),
        },
      );

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
      return (
        device.ipAddress
          .toLowerCase()
          .includes(deviceSearchTerm.toLowerCase()) ||
        device.device"name"
          .toLowerCase()
          .includes(deviceSearchTerm.toLowerCase()) ||
        device.location.toLowerCase().includes(deviceSearchTerm.toLowerCase())
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
      (product."name" && product."name".toLowerCase().includes(searchLower)) ||
      (product."name"En && product."name"En.toLowerCase().includes(searchLower)) ||
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
      "name": "",
      "nameEn": "",
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
      "name": product."name",
      "nameEn": product."name"En || "",
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
    const { "name", value } = e.target;
    setFormData((prev) => ({
      ...prev,
      ["name"]: value,
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (editingProduct) {
      // Update existing product
      updateProductAPI({
        ...editingProduct,
        "name": formData."name",
        "nameEn": formData."name"En,
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
        "name": formData."name",
        "nameEn": formData."name"En,
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
      <div class"name"="admin-page">
        <div class"name"="admin-header">
          <p>{language === "he" ? "טוען..." : "Loading..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div class"name"="admin-page">
      <div class"name"="admin-header">
        <h1>{language === "he" ? "🔓 ניהול חנות" : "🔓 Store Management"}</h1>
        <p>
          {language === "he"
            ? "ממשק ניהול למשתמשי החנות"
            : "Management interface for store users"}
        </p>
      </div>

      {/* Tabs */}
      <div class"name"="admin-tabs">
        <button
          class"name"={`tab-btn ${activeTab === "products" ? "active" : ""}`}
          onClick={() => setActiveTab("products")}
        >
          {language === "he" ? "📦 ניהול מוצרים" : "📦 Manage Products"}
        </button>

        {/* Show Users tab only for ROI */}
        {isROI() && (
          <button
            class"name"={`tab-btn ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            {language === "he" ? "👥 ניהול משתמשים" : "👥 Manage Users"}
          </button>
        )}

        <button
          class"name"={`tab-btn ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          {language === "he" ? "📋 ניהול הזמנות" : "📋 Manage Orders"}
        </button>

        {/* Show Devices tab only for ROI */}
        {isROI() && (
          <button
            class"name"={`tab-btn ${activeTab === "devices" ? "active" : ""}`}
            onClick={() => setActiveTab("devices")}
          >
            {language === "he" ? "🔒 ניהול מכשירים" : "🔒 Device Management"}
          </button>
        )}
      </div>

      <div class"name"="admin-container">
        {/* Products Tab */}
        {activeTab === "products" && (
          <>
            <div class"name"="admin-actions">
              <input
                type="text"
                class"name"="search-bar"
                placeholder={
                  language === "he" ? "חיפוש מוצרים..." : "Search products..."
                }
                value={searchTerm}
                onChange={handleSearch}
              />
              <button class"name"="add-product-btn" onClick={handleAddProduct}>
                {language === "he" ? "➕ הוסף מוצר חדש" : "➕ Add New Product"}
              </button>
              <button
                class"name"="add-product-btn"
                onClick={() => setShowProductForm(true)}
                style={{ backgroundColor: "#28a745", marginLeft: "10px" }}
              >
                {language === "he" ? "📸 הוסף עם תמונה" : "📸 Add with Image"}
              </button>
            </div>

            <div class"name"="admin-products-table">
              <table class"name"="products-table">
                <thead>
                  <tr>
                    <th>{language === "he" ? "תמונה" : "Image"}</th>
                    <th>{language === "he" ? "שם המוצר" : "Product "name""}</th>
                    <th>{language === "he" ? "קטגוריה" : "Category"}</th>
                    <th>{language === "he" ? "מחיר" : "Price"}</th>
                    <th>{language === "he" ? "סטטוס" : "Status"}</th>
                    <th>{language === "he" ? "פעולות" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td>
                        {Array.isArray(product.images) && product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product."name"}
                            class"name"="product-thumbnail"
                            onError={(e) => {
                              e.target.src =
                                "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400";
                            }}
                          />
                        ) : product.images ? (
                          <img
                            src={product.images}
                            alt={product."name"}
                            class"name"="product-thumbnail"
                            onError={(e) => {
                              e.target.src =
                                "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400";
                            }}
                          />
                        ) : (
                          <div class"name"="product-thumbnail-placeholder">
                            {language === "he" ? "ללא תמונה" : "No image"}
                          </div>
                        )}
                      </td>
                      <td>
                        <div>
                          <strong>{product."name"}</strong>
                          {product."name"En && (
                            <div style={{ fontSize: "0.8em", color: "#666" }}>
                              {product."name"En}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div>
                          <strong>{product.category}</strong>
                          {product.categoryEn && (
                            <div style={{ fontSize: "0.8em", color: "#666" }}>
                              {product.categoryEn}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>₪{product.price}</td>
                      <td>
                        <span class"name"={`product-status ${product.status}`}>
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
                        <div class"name"="table-actions">
                          <button
                            class"name"="action-btn edit"
                            onClick={() => handleEditProduct(product)}
                          >
                            {language === "he" ? "✏️ ערוך" : "✏️ Edit"}
                          </button>
                          <button
                            class"name"="action-btn delete"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            {language === "he" ? "🗑️ מחק" : "🗑️ Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Users Tab - ROI Only */}
        {activeTab === "users" && isROI() && (
          <>
            <div class"name"="admin-actions">
              <input
                type="text"
                class"name"="search-bar"
                placeholder={
                  language === "he" ? "חיפוש משתמשים..." : "Search users..."
                }
                value={userSearchTerm}
                onChange={handleUserSearch}
              />
              <span class"name"="user-count">
                {language === "he"
                  ? `סה"כ משתמשים: ${users.length}`
                  : `Total Users: ${users.length}`}
              </span>
            </div>

            <div class"name"="admin-products-table">
              {loading ? (
                <div class"name"="loading-message">
                  {language === "he" ? "טוען משתמשים..." : "Loading users..."}
                </div>
              ) : (
                <table class"name"="users-table">
                  <thead>
                    <tr>
                      <th>{language === "he" ? "שם פרטי" : "First "name""}</th>
                      <th>{language === "he" ? "שם משפחה" : "Last "name""}</th>
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
                        <td>{user.first"name"}</td>
                        <td>{user.last"name"}</td>
                        <td>{user.email}</td>
                        <td>{user.phone}</td>
                        <td>
                          <select
                            class"name"="role-select"
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
                            class"name"={`user-status ${user.blocked ? "blocked" : "active"}`}
                          >
                            {user.blocked
                              ? language === "he"
                                ? "🚫 חסום"
                                : "🚫 Blocked"
                              : language === "he"
                                ? "✅ פעיל"
                                : "✅ Active"}
                          </span>
                        </td>
                        <td>{formatDate(user.createdAt)}</td>
                        <td>
                          <div class"name"="table-actions">
                            <button
                              class"name"={`action-btn ${user.blocked ? "unblock" : "block"}`}
                              onClick={() => handleBlockUser(user.id)}
                              title={
                                language === "he"
                                  ? user.blocked
                                    ? "ביטול חסימה"
                                    : "חסום"
                                  : user.blocked
                                    ? "Unblock"
                                    : "Block"
                              }
                            >
                              {user.blocked
                                ? language === "he"
                                  ? "🔓 בטל חסימה"
                                  : "🔓 Unblock"
                                : language === "he"
                                  ? "🔒 חסום"
                                  : "🔒 Block"}
                            </button>
                            <button
                              class"name"="action-btn delete"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              {language === "he" ? "🗑️ מחק" : "🗑️ Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <>
            <div class"name"="admin-actions">
              <input
                type="text"
                class"name"="search-bar"
                placeholder={
                  language === "he"
                    ? "חיפוש הזמנה או לקוח..."
                    : "Search order or customer..."
                }
                value={orderSearchTerm}
                onChange={(e) => setOrderSearchTerm(e.target.value)}
              />
              <select
                class"name"="filter-select"
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
              <span class"name"="user-count">
                {language === "he"
                  ? `סה"כ הזמנות: ${filteredOrders.length}`
                  : `Total Orders: ${filteredOrders.length}`}
              </span>
            </div>

            <div class"name"="admin-products-table">
              <table class"name"="orders-table">
                <thead>
                  <tr>
                    <th>{language === "he" ? "מספר הזמנה" : "Order #"}</th>
                    <th>{language === "he" ? "לקוח" : "Customer"}</th>
                    <th>{language === "he" ? "אימייל" : "Email"}</th>
                    <th>{language === "he" ? "סכום" : "Total"}</th>
                    <th>{language === "he" ? "סטטוס" : "Status"}</th>
                    <th>{language === "he" ? "תאריך הזמנה" : "Order Date"}</th>
                    <th>{language === "he" ? "פרטים" : "Items"}</th>
                    <th>{language === "he" ? "פעולות" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <strong>{order.id}</strong>
                      </td>
                      <td>{order.customer"name"}</td>
                      <td>{order.email}</td>
                      <td class"name"="price">₪{order.totalPrice}</td>
                      <td>
                        <select
                          class"name"={`status-select status-${order.status}`}
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
                          <summary class"name"="items-summary">
                            {language === "he"
                              ? `${order.items.length} פריטים`
                              : `${order.items.length} items`}
                          </summary>
                          <ul class"name"="items-list">
                            {order.items.map((item) => (
                              <li key={item.id}>
                                {item."name"} x{item.quantity} - ₪
                                {item.price * item.quantity}
                              </li>
                            ))}
                          </ul>
                        </details>
                      </td>
                      <td>
                        <div class"name"="table-actions">
                          <button
                            class"name"="action-btn view"
                            title={
                              language === "he" ? "צפה בפרטים" : "View details"
                            }
                          >
                            {language === "he" ? "👁️ צפה" : "👁️ View"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Devices Tab - ROI Only */}
        {activeTab === "devices" && isROI() && (
          <>
            <div class"name"="admin-actions">
              <input
                type="text"
                class"name"="search-bar"
                placeholder={
                  language === "he"
                    ? "חיפוש לפי IP או שם מכשיר..."
                    : "Search by IP or device "name"..."
                }
                value={deviceSearchTerm}
                onChange={(e) => setDeviceSearchTerm(e.target.value)}
              />
              <span class"name"="user-count">
                {language === "he"
                  ? `סה"כ מכשירים: ${filteredDevices.length}`
                  : `Total Devices: ${filteredDevices.length}`}
              </span>
            </div>

            {/* Firewall Section */}
            <div class"name"="firewall-section">
              <h3>
                {language === "he"
                  ? "🔥 ניהול חומת אש"
                  : "🔥 Firewall Management"}
              </h3>
              <div class"name"="firewall-input-group">
                <input
                  type="text"
                  class"name"="search-bar"
                  placeholder={
                    language === "he"
                      ? "הזן כתובת IP להוספה לחומת אש (דוגמה: 192.168.1.100)"
                      : "Enter IP address to add to firewall (e.g., 192.168.1.100)"
                  }
                  value={newFirewallIP}
                  onChange={(e) => setNewFirewallIP(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleAddToFirewall();
                    }
                  }}
                />
                <button
                  class"name"="add-product-btn"
                  onClick={handleAddToFirewall}
                >
                  {language === "he"
                    ? "➕ הוסף לחומת אש"
                    : "➕ Add to Firewall"}
                </button>
              </div>

              {/* Firewall List */}
              {firewall.length > 0 && (
                <div class"name"="firewall-list">
                  <h4>
                    {language === "he"
                      ? `IP כתובות בחומת אש (${firewall.length})`
                      : `Blocked IPs (${firewall.length})`}
                  </h4>
                  <div class"name"="firewall-grid">
                    {firewall.map((ip, index) => (
                      <div key={index} class"name"="firewall-item">
                        <code class"name"="ip-address">{ip}</code>
                        <button
                          class"name"="action-btn delete"
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

            <div class"name"="admin-products-table">
              <table class"name"="devices-table">
                <thead>
                  <tr>
                    <th>{language === "he" ? "כתובת IP" : "IP Address"}</th>
                    <th>{language === "he" ? "שם מכשיר" : "Device "name""}</th>
                    <th>{language === "he" ? "מיקום" : "Location"}</th>
                    <th>
                      {language === "he" ? "ספירת כניסות" : "Login Count"}
                    </th>
                    <th>
                      {language === "he" ? "התחברות אחרונה" : "Last Login"}
                    </th>
                    <th>{language === "he" ? "סטטוס" : "Status"}</th>
                    <th>{language === "he" ? "פעולות" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDevices.map((device) => (
                    <tr key={device.id}>
                      <td>
                        <code class"name"="ip-address">{device.ipAddress}</code>
                      </td>
                      <td>{device.device"name"}</td>
                      <td>
                        <div>
                          <strong>{device.location}</strong>
                          <div style={{ fontSize: "0.8em", color: "#666" }}>
                            {device.locationEn}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span class"name"="login-count">{device.loginCount}</span>
                      </td>
                      <td>{formatDate(device.lastLogin)}</td>
                      <td>
                        <span
                          class"name"={`device-status ${
                            device.blocked ? "blocked" : "active"
                          }`}
                        >
                          {device.blocked
                            ? language === "he"
                              ? "🚫 חסום"
                              : "🚫 Blocked"
                            : language === "he"
                              ? "✅ פעיל"
                              : "✅ Active"}
                        </span>
                      </td>
                      <td>
                        <div class"name"="table-actions">
                          <button
                            class"name"={`action-btn ${
                              device.blocked ? "unblock" : "block"
                            }`}
                            onClick={() => handleBlockIP(device.id)}
                            title={
                              language === "he"
                                ? device.blocked
                                  ? "בטל חסימה"
                                  : "חסום IP"
                                : device.blocked
                                  ? "Unblock"
                                  : "Block IP"
                            }
                          >
                            {device.blocked
                              ? language === "he"
                                ? "🔓 בטל"
                                : "🔓 Unblock"
                              : language === "he"
                                ? "🔒 חסום"
                                : "🔒 Block"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Blocked IPs Summary */}
            <div class"name"="blocked-ips-summary">
              <h3>
                {language === "he"
                  ? "📋 רשימת כתובות IP החסומות"
                  : "📋 Blocked IP Addresses"}
              </h3>
              {blockedIPs.length > 0 ? (
                <ul class"name"="blocked-ips-list">
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

      {/* Product Form Modal */}
      {showForm && (
        <div class"name"="product-form-modal" onClick={handleFormCancel}>
          <form
            class"name"="product-form"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleFormSubmit}
          >
            <h2>
              {editingProduct
                ? language === "he"
                  ? "עריכת מוצר"
                  : "Edit Product"
                : language === "he"
                  ? "הוספת מוצר חדש"
                  : "Add New Product"}
            </h2>

            <div class"name"="form-group">
              <label>
                {language === "he"
                  ? "שם המוצר (עברית) *"
                  : "Product "name" (Hebrew) *"}
              </label>
              <input
                type="text"
                "name"="name"
                value={formData."name"}
                onChange={handleFormChange}
                required
              />
            </div>

            <div class"name"="form-group">
              <label>
                {language === "he"
                  ? "שם המוצר (אנגלית)"
                  : "Product "name" (English)"}
              </label>
              <input
                type="text"
                "name"="nameEn"
                value={formData."name"En}
                onChange={handleFormChange}
              />
            </div>

            <div class"name"="form-group">
              <label>
                {language === "he"
                  ? "קטגוריה (עברית) *"
                  : "Category (Hebrew) *"}
              </label>
              <select
                "name"="category"
                value={formData.category}
                onChange={handleFormChange}
                required
              >
                <option value="">
                  {language === "he" ? "בחר קטגוריה" : "Select Category"}
                </option>
                <option value="אותיות עבריות">
                  {language === "he" ? "אותיות עבריות" : "Hebrew Letters"}
                </option>
                <option value="אבני חושן">
                  {language === "he" ? "אבני חושן" : "Hoshen Stones"}
                </option>
                <option value="תליוני מזלות">
                  {language === "he" ? "תליוני מזלות" : "Zodiac Pendants"}
                </option>
                <option value="שלישיות מיוחדות">
                  {language === "he" ? "שלישיות מיוחדות" : "Trinity Pendants"}
                </option>
              </select>
            </div>

            <div class"name"="form-group">
              <label>
                {language === "he" ? "קטגוריה (אנגלית)" : "Category (English)"}
              </label>
              <input
                type="text"
                "name"="categoryEn"
                value={formData.categoryEn}
                onChange={handleFormChange}
              />
            </div>

            <div class"name"="form-group">
              <label>
                {language === "he" ? "תיאור (עברית)" : "Description (Hebrew)"}
              </label>
              <textarea
                "name"="description"
                value={formData.description}
                onChange={handleFormChange}
                rows="3"
              />
            </div>

            <div class"name"="form-group">
              <label>
                {language === "he" ? "תיאור (אנגלית)" : "Description (English)"}
              </label>
              <textarea
                "name"="descriptionEn"
                value={formData.descriptionEn}
                onChange={handleFormChange}
                rows="3"
              />
            </div>

            <div class"name"="form-group">
              <label>{language === "he" ? "מחיר (₪) *" : "Price (₪) *"}</label>
              <input
                type="number"
                "name"="price"
                value={formData.price}
                onChange={handleFormChange}
                required
                min="0"
                step="0.01"
              />
            </div>

            <div class"name"="form-group">
              <label>
                {language === "he"
                  ? "סוגי מתכות (מופרדים בפסיק)"
                  : "Metal Types (comma separated)"}
              </label>
              <input
                type="text"
                "name"="metals"
                value={formData.metals}
                onChange={handleFormChange}
                placeholder={language === "he" ? "זהב, כסף" : "Gold, Silver"}
              />
            </div>

            <div class"name"="form-group">
              <label>
                {language === "he"
                  ? "כתובות תמונה (מופרדות בפסיק)"
                  : "Image URLs (comma separated)"}
              </label>
              <textarea
                "name"="images"
                value={formData.images}
                onChange={handleFormChange}
                rows="2"
                placeholder={
                  language === "he"
                    ? "https://example.com/image1.jpg, https://example.com/image2.jpg"
                    : "https://example.com/image1.jpg, https://example.com/image2.jpg"
                }
              />
            </div>

            <div class"name"="form-group">
              <label>{language === "he" ? "סטטוס" : "Status"}</label>
              <select
                "name"="status"
                value={formData.status}
                onChange={handleFormChange}
              >
                <option value="active">
                  {language === "he" ? "פעיל" : "Active"}
                </option>
                <option value="inactive">
                  {language === "he" ? "לא פעיל" : "Inactive"}
                </option>
              </select>
            </div>

            <div class"name"="form-actions">
              <button type="submit" class"name"="btn">
                {editingProduct
                  ? language === "he"
                    ? "שמור שינויים"
                    : "Save Changes"
                  : language === "he"
                    ? "הוסף מוצר"
                    : "Add Product"}
              </button>
              <button
                type="button"
                class"name"="btn btn-secondary"
                onClick={handleFormCancel}
              >
                {language === "he" ? "ביטול" : "Cancel"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ProductForm Component Modal - For Image Upload */}
      {showProductForm && (
        <div
          class"name"="product-form-modal"
          onClick={() => setShowProductForm(false)}
        >
          <div
            class"name"="product-form-container"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              class"name"="close-btn"
              onClick={() => setShowProductForm(false)}
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
