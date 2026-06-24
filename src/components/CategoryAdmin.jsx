import { useEffect, useState } from "react";
import { FaEdit, FaPlus, FaSave, FaTrash, FaTimes } from "react-icons/fa";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../contexts/LanguageContext";
import "../styles/components/AdminPanel.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const EMPTY_FORM = {
  slug: "",
  nameHe: "",
  nameEn: "",
  descriptionHe: "",
  descriptionEn: "",
  image: "",
  sortOrder: "",
};

export default function CategoryAdmin() {
  const { language } = useLanguage();
  const { showSuccess, showError } = useToast();
  const he = language === "he";

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);

  const token = () => localStorage.getItem("token");

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories?all=true`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (data.success) setCategories(data.data || []);
    } catch {
      showError(he ? "שגיאה בטעינת קטגוריות" : "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.slug.trim() || !form.nameHe.trim()) {
      showError(he ? "שם ומזהה קטגוריה נדרשים" : "Category name and ID are required");
      return;
    }

    try {
      const body = {
        ...form,
        sortOrder: form.sortOrder ? Number(form.sortOrder) : undefined,
      };
      const url = editingId
        ? `${API_BASE_URL}/api/categories/${editingId}`
        : `${API_BASE_URL}/api/categories`;
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        showSuccess(
          editingId
            ? he
              ? "הקטגוריה עודכנה"
              : "Category updated"
            : he
              ? "קטגוריה חדשה נוצרה"
              : "Category created",
        );
        setShowForm(false);
        setEditingId(null);
        setForm(EMPTY_FORM);
        fetchCategories();
      } else {
        showError(data.message);
      }
    } catch {
      showError(he ? "שגיאה בשמירה" : "Save failed");
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat._id);
    setForm({
      slug: cat.slug || "",
      nameHe: cat.nameHe || "",
      nameEn: cat.nameEn || "",
      descriptionHe: cat.descriptionHe || "",
      descriptionEn: cat.descriptionEn || "",
      image: cat.image || "",
      sortOrder: cat.sortOrder ?? "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        he
          ? "למחוק קטגוריה? מוצרים משויכים לא יימחקו."
          : "Delete category? Linked products won't be deleted.",
      )
    )
      return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (data.success) {
        showSuccess(he ? "הקטגוריה נמחקה" : "Category deleted");
        fetchCategories();
      } else {
        showError(data.message);
      }
    } catch {
      showError(he ? "שגיאה במחיקה" : "Delete failed");
    }
  };

  const toggleActive = async (cat) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories/${cat._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ active: !cat.active }),
      });
      const data = await res.json();
      if (data.success) fetchCategories();
    } catch {
      showError(he ? "שגיאה בעדכון" : "Update failed");
    }
  };

  return (
    <div className="ap-wrap" dir={he ? "rtl" : "ltr"}>
      <div className="ap-page-heading">
        <h1>{he ? "ניהול קטגוריות" : "Category Management"}</h1>
        <p>
          {he
            ? "הוסיפו, ערכו וסדרו את קטגוריות החנות. המזהה (slug) חייב להתאים לשם הקטגוריה במוצרים."
            : "Add, edit and organize shop categories. The slug must match product category values."}
        </p>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <button
          className="ap-btn-primary"
          onClick={() => {
            setEditingId(null);
            setForm(EMPTY_FORM);
            setShowForm(true);
          }}
        >
          <FaPlus /> {he ? "קטגוריה חדשה" : "New Category"}
        </button>
      </div>

      {showForm && (
        <div className="ap-card" style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ marginTop: 0 }}>
            {editingId
              ? he
                ? "עריכת קטגוריה"
                : "Edit Category"
              : he
                ? "קטגוריה חדשה"
                : "New Category"}
          </h2>
          <form onSubmit={handleSave}>
            <div className="ap-grid-2">
              <div className="ap-field">
                <label>{he ? "מזהה (עברית, לדוגמה: אותיות עבריות) *" : "Slug (Hebrew) *"}</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  disabled={!!editingId}
                  placeholder="אותיות עבריות"
                />
              </div>
              <div className="ap-field">
                <label>{he ? "שם תצוגה (עברית) *" : "Display Name (Hebrew) *"}</label>
                <input
                  value={form.nameHe}
                  onChange={(e) => setForm({ ...form, nameHe: e.target.value })}
                />
              </div>
              <div className="ap-field">
                <label>{he ? "שם (אנגלית)" : "Name (English)"}</label>
                <input
                  value={form.nameEn}
                  onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                />
              </div>
              <div className="ap-field">
                <label>{he ? "סדר תצוגה" : "Sort Order"}</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                />
              </div>
            </div>
            <div className="ap-field">
              <label>{he ? "תיאור (עברית)" : "Description (Hebrew)"}</label>
              <textarea
                rows={3}
                value={form.descriptionHe}
                onChange={(e) =>
                  setForm({ ...form, descriptionHe: e.target.value })
                }
              />
            </div>
            <div className="ap-field">
              <label>{he ? "קישור לתמונה" : "Image URL"}</label>
              <input
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button type="submit" className="ap-btn-primary">
                <FaSave /> {he ? "שמור" : "Save"}
              </button>
              <button
                type="button"
                className="ap-btn-outline-sm"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
              >
                <FaTimes /> {he ? "ביטול" : "Cancel"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p>{he ? "טוען..." : "Loading..."}</p>
      ) : (
        <div className="ap-table-wrap">
          <table className="ap-subscribers-table">
            <thead>
              <tr>
                <th>{he ? "מזהה" : "Slug"}</th>
                <th>{he ? "שם" : "Name"}</th>
                <th>{he ? "מוצרים" : "Products"}</th>
                <th>{he ? "פעיל" : "Active"}</th>
                <th>{he ? "פעולות" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat._id}>
                  <td>{cat.slug}</td>
                  <td>{cat.nameHe}</td>
                  <td>{cat.sortOrder}</td>
                  <td>
                    <button
                      type="button"
                      className={`ap-toggle ${cat.active !== false ? "ap-toggle--on" : "ap-toggle--off"}`}
                      onClick={() => toggleActive(cat)}
                      style={{ width: 44, height: 24 }}
                    >
                      <span className="ap-toggle__knob" />
                    </button>
                  </td>
                  <td>
                    <button
                      className="ap-btn-outline-sm"
                      onClick={() => handleEdit(cat)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="ap-del-btn"
                      onClick={() => handleDelete(cat._id)}
                      style={{ marginInlineStart: "0.5rem" }}
                    >
                      <FaTrash />
                    </button>
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
