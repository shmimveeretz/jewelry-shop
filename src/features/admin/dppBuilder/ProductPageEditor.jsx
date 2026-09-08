import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FaArrowRight,
  FaCloudUploadAlt,
  FaHistory,
  FaPause,
  FaSave,
} from "react-icons/fa";
import { useToast } from "../../../context/ToastContext";
import BlockPalette from "./BlockPalette";
import BlockCanvas from "./BlockCanvas";
import BlockInspector from "./BlockInspector";
import DppPreviewFrame from "./DppPreviewFrame";
import PageSettingsPanel from "./PageSettingsPanel";
import { createBlock, duplicateBlock } from "./blockDefaults";
import {
  getBlockTypes,
  getProductPage,
  publishProductPage,
  restoreRevision,
  saveProductPageBlocks,
  unpublishProductPage,
} from "../adminApi";
import "../../../styles/admin/DppBuilder.css";

const TABS = [
  { key: "build", label: "בנייה" },
  { key: "preview", label: "תצוגה מקדימה" },
  { key: "settings", label: "הגדרות" },
];

function ProductPageEditor() {
  const { id } = useParams();
  const { showSuccess, showError } = useToast();

  const [page, setPage] = useState(null);
  const [schemas, setSchemas] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [theme, setTheme] = useState({});
  const [selectedKey, setSelectedKey] = useState(null);
  const [isDirty, setDirty] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(0);
  const [tab, setTab] = useState("build");

  useEffect(() => {
    Promise.all([getProductPage(id), getBlockTypes()])
      .then(([pageData, blockTypes]) => {
        setPage(pageData);
        setSchemas(blockTypes);
        setBlocks(pageData.draft?.blocks || []);
        setTheme(pageData.draft?.theme || {});
        setSelectedKey(pageData.draft?.blocks?.[0]?.key || null);
      })
      .catch((error) => showError(error.message));
  }, [id, showError]);

  const schemaByType = useMemo(
    () => new Map(schemas.map((schema) => [schema.type, schema])),
    [schemas],
  );

  const selectedBlock =
    blocks.find((block) => block.key === selectedKey) || null;

  const mutate = useCallback((updater) => {
    setBlocks(updater);
    setDirty(true);
  }, []);

  const patchBlock = useCallback(
    (key, changes) =>
      mutate((current) =>
        current.map((block) =>
          block.key === key ? { ...block, ...changes } : block,
        ),
      ),
    [mutate],
  );

  const addBlock = (type) => {
    const block = createBlock(type);
    mutate((current) => [...current, block]);
    setSelectedKey(block.key);
  };

  const removeBlock = (key) => {
    mutate((current) => current.filter((block) => block.key !== key));
    setSelectedKey((current) => (current === key ? null : current));
  };

  const cloneBlock = (key) => {
    const source = blocks.find((block) => block.key === key);
    if (!source) return;

    const copy = duplicateBlock(source);
    mutate((current) => {
      const index = current.findIndex((block) => block.key === key);
      const next = [...current];
      next.splice(index + 1, 0, copy);
      return next;
    });
    setSelectedKey(copy.key);
  };

  const saveDraft = async () => {
    setSaving(true);
    try {
      await saveProductPageBlocks(id, blocks, theme);
      setDirty(false);
      // Bumping this reloads the preview iframe, so what it shows is always
      // what was actually stored.
      setSavedAt(Date.now());
      showSuccess("הטיוטה נשמרה");
    } catch (error) {
      showError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    setSaving(true);
    try {
      // Publishing an out-of-date draft is the most confusing failure this
      // editor could have, so the draft is always flushed first.
      await saveProductPageBlocks(id, blocks, theme);
      const updated = await publishProductPage(id);
      setPage(updated);
      setDirty(false);
      setSavedAt(Date.now());
      showSuccess("העמוד פורסם ועלה לאוויר");
    } catch (error) {
      showError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const unpublish = async () => {
    try {
      const updated = await unpublishProductPage(id);
      setPage(updated);
      showSuccess("פרסום העמוד הופסק");
    } catch (error) {
      showError(error.message);
    }
  };

  const revert = async (index) => {
    try {
      const data = await restoreRevision(id, index);
      setBlocks(data.draft?.blocks || []);
      setTheme(data.draft?.theme || {});
      setDirty(false);
      setSavedAt(Date.now());
      showSuccess("הגרסה הקודמת שוחזרה לטיוטה");
    } catch (error) {
      showError(error.message);
    }
  };

  if (!page) {
    return <p className="dpp-builder__loading">טוען את העמוד…</p>;
  }

  const isPublished = page.status === "published";

  return (
    <div className="dpp-builder">
      <header className="dpp-builder__head">
        <div className="dpp-builder__title">
          <Link to="/admin/pages" className="admin-shell__icon-btn">
            <FaArrowRight />
          </Link>
          <div>
            <h1>{page.internalName}</h1>
            <a
              href={`/lp/${page.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="dpp-builder__slug"
            >
              /lp/{page.slug}
            </a>
          </div>
          <span className={`dpp-status dpp-status--${page.status}`}>
            {isPublished
              ? "מפורסם"
              : page.status === "archived"
                ? "בארכיון"
                : "טיוטה"}
          </span>
        </div>

        <div className="dpp-builder__actions">
          {page.revisions?.length > 0 ? (
            <button
              type="button"
              className="admin-shell__ghost-btn"
              onClick={() => revert(0)}
              title="שחזור הגרסה שפורסמה לפני האחרונה"
            >
              <FaHistory />
              שחזור גרסה
            </button>
          ) : null}

          {isPublished ? (
            <button
              type="button"
              className="admin-shell__ghost-btn"
              onClick={unpublish}
            >
              <FaPause />
              הפסקת פרסום
            </button>
          ) : null}

          <button
            type="button"
            className="admin-shell__ghost-btn"
            onClick={saveDraft}
            disabled={!isDirty || isSaving}
          >
            <FaSave />
            {isDirty ? "שמירת טיוטה" : "נשמר"}
          </button>

          <button
            type="button"
            className="dpp-builder__publish"
            onClick={publish}
            disabled={isSaving || blocks.length === 0}
          >
            <FaCloudUploadAlt />
            {isPublished ? "עדכון העמוד החי" : "פרסום"}
          </button>
        </div>
      </header>

      <nav className="dpp-builder__tabs">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            className={tab === item.key ? "is-active" : ""}
            onClick={() => setTab(item.key)}
          >
            {item.label}
          </button>
        ))}
        {isDirty ? (
          <span className="dpp-builder__dirty">יש שינויים שלא נשמרו</span>
        ) : null}
      </nav>

      {tab === "build" ? (
        <div className="dpp-builder__grid">
          <BlockPalette blocks={blocks} onAdd={addBlock} />

          <div className="dpp-panel">
            <p className="dpp-panel__title">מבנה העמוד</p>
            <BlockCanvas
              blocks={blocks}
              selectedKey={selectedKey}
              onSelect={setSelectedKey}
              onReorder={(next) => mutate(() => next)}
              onPatch={patchBlock}
              onDuplicate={cloneBlock}
              onRemove={removeBlock}
            />
          </div>

          <BlockInspector
            block={selectedBlock}
            schema={selectedBlock ? schemaByType.get(selectedBlock.type) : null}
            onChange={(changes) => patchBlock(selectedKey, changes)}
          />
        </div>
      ) : null}

      {tab === "preview" ? (
        <DppPreviewFrame
          pageId={id}
          slug={page.slug}
          refreshKey={savedAt}
          onError={showError}
        />
      ) : null}

      {tab === "settings" ? (
        <PageSettingsPanel
          page={page}
          theme={theme}
          onThemeChange={(next) => {
            setTheme(next);
            setDirty(true);
          }}
          onSaved={setPage}
          onError={showError}
          onSuccess={showSuccess}
          onRevert={revert}
        />
      ) : null}
    </div>
  );
}

export default ProductPageEditor;
