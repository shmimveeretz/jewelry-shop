import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaClone,
  FaExternalLinkAlt,
  FaPlus,
  FaSearch,
  FaTrash,
} from "react-icons/fa";
import { useToast } from "../../../context/ToastContext";
import { getAllProducts } from "../../../services/productApi";
import {
  archiveProductPage,
  createProductPage,
  duplicateProductPage,
  listProductPages,
} from "../adminApi";
import "../../../styles/admin/DppBuilder.css";

const STATUS_LABELS = {
  draft: "טיוטה",
  published: "מפורסם",
  archived: "ארכיון",
};

const dateFormatter = new Intl.DateTimeFormat("he-IL", { dateStyle: "short" });

/** Turns a Hebrew product name into a usable ASCII-ish URL segment. */
const suggestSlug = (product) =>
  String(product?.id || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function ProductPageList() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [pages, setPages] = useState([]);
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [isCreating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ productSlug: "", slug: "", internalName: "" });

  const refresh = () =>
    listProductPages()
      .then(setPages)
      .catch((error) => showError(error.message));

  useEffect(() => {
    refresh();
    getAllProducts()
      .then((response) => setProducts(response.data || []))
      .catch(() => setProducts([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return pages;
    return pages.filter(
      (page) =>
        page.internalName.toLowerCase().includes(term) ||
        page.slug.includes(term),
    );
  }, [pages, query]);

  const pickProduct = (productSlug) => {
    const product = products.find((item) => item.id === productSlug);
    setDraft({
      productSlug,
      slug: suggestSlug(product),
      internalName: product?.name || "",
    });
  };

  const create = async () => {
    try {
      const page = await createProductPage(draft);
      showSuccess("העמוד נוצר");
      navigate(`/admin/pages/${page._id}`);
    } catch (error) {
      showError(error.message);
    }
  };

  const duplicate = async (page) => {
    try {
      const copy = await duplicateProductPage(page._id, `${page.slug}-b`);
      showSuccess("העמוד שוכפל");
      navigate(`/admin/pages/${copy._id}`);
    } catch (error) {
      showError(error.message);
    }
  };

  const archive = async (page) => {
    if (!window.confirm(`להעביר את "${page.internalName}" לארכיון?`)) return;
    try {
      await archiveProductPage(page._id);
      showSuccess("העמוד הועבר לארכיון");
      refresh();
    } catch (error) {
      showError(error.message);
    }
  };

  return (
    <div className="dpp-list">
      <header className="admin-dashboard__head">
        <div>
          <h1>עמודי מוצר</h1>
          <p className="admin-dashboard__sub">
            עמודי נחיתה לקמפיינים. כתובת שאין לה עמוד בנוי מוצגת עם תבנית
            ברירת המחדל, כך שקישורי מודעות קיימים ממשיכים לעבוד.
          </p>
        </div>

        <button
          type="button"
          className="dpp-builder__publish"
          onClick={() => setCreating((value) => !value)}
        >
          <FaPlus />
          עמוד חדש
        </button>
      </header>

      {isCreating ? (
        <section className="dpp-panel dpp-list__create">
          <p className="dpp-panel__title">יצירת עמוד</p>

          <label className="admin-field">
            <span className="admin-field__label">מוצר</span>
            <select
              value={draft.productSlug}
              onChange={(event) => pickProduct(event.target.value)}
            >
              <option value="">— בחרו מוצר —</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-field">
            <span className="admin-field__label">שם פנימי</span>
            <input
              type="text"
              value={draft.internalName}
              onChange={(event) =>
                setDraft({ ...draft, internalName: event.target.value })
              }
            />
          </label>

          <label className="admin-field">
            <span className="admin-field__label">כתובת</span>
            <div className="dpp-settings__slug">
              <span>/lp/</span>
              <input
                type="text"
                dir="ltr"
                value={draft.slug}
                onChange={(event) => setDraft({ ...draft, slug: event.target.value })}
              />
            </div>
          </label>

          <button
            type="button"
            className="dpp-builder__publish"
            disabled={!draft.productSlug || !draft.slug || !draft.internalName}
            onClick={create}
          >
            יצירה מתבנית ברירת המחדל
          </button>
        </section>
      ) : null}

      <div className="dpp-list__search">
        <FaSearch />
        <input
          type="search"
          placeholder="חיפוש לפי שם או כתובת"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="admin-widget__empty">אין עמודים להצגה.</p>
      ) : (
        <ul className="dpp-list__items">
          {filtered.map((page) => (
            <li key={page._id} className="dpp-list__item">
              <Link to={`/admin/pages/${page._id}`} className="dpp-list__link">
                <span className="dpp-list__name">{page.internalName}</span>
                <span className="dpp-list__slug">/lp/{page.slug}</span>
              </Link>

              <span className={`dpp-status dpp-status--${page.status}`}>
                {STATUS_LABELS[page.status]}
              </span>

              <span className="dpp-list__date">
                עודכן {dateFormatter.format(new Date(page.updatedAt))}
              </span>

              <div className="dpp-list__tools">
                <a
                  href={`/lp/${page.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="admin-shell__icon-btn"
                  title="פתיחת העמוד החי"
                >
                  <FaExternalLinkAlt />
                </a>
                <button
                  type="button"
                  className="admin-shell__icon-btn"
                  onClick={() => duplicate(page)}
                  title="שכפול (לבדיקת A/B)"
                >
                  <FaClone />
                </button>
                <button
                  type="button"
                  className="admin-shell__icon-btn"
                  onClick={() => archive(page)}
                  title="העברה לארכיון"
                >
                  <FaTrash />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ProductPageList;
