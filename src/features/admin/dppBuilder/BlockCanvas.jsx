import {
  FaClone,
  FaDesktop,
  FaEye,
  FaEyeSlash,
  FaMobileAlt,
  FaThumbtack,
  FaTrash,
} from "react-icons/fa";
import SortableList from "../components/SortableList";
import { BLOCK_META } from "../../dpp/blockMeta";

/**
 * The page as an ordered list of blocks. Array order is the render order, so a
 * drag is a single arrayMove and the saved payload is just the new array.
 */
function BlockCanvas({
  blocks,
  selectedKey,
  onSelect,
  onReorder,
  onPatch,
  onDuplicate,
  onRemove,
}) {
  if (blocks.length === 0) {
    return (
      <p className="dpp-canvas__empty">
        העמוד ריק. הוסיפו בלוק מהרשימה משמאל כדי להתחיל.
      </p>
    );
  }

  return (
    <SortableList
      items={blocks}
      onReorder={onReorder}
      className="dpp-canvas"
      renderItem={(block, index, { ref, style, handleProps }) => {
        const meta = BLOCK_META[block.type] || { label: block.type };
        const isSelected = block.key === selectedKey;
        const { mobile = true, desktop = true } = block.visibility || {};

        return (
          <div
            ref={ref}
            style={style}
            className={`dpp-block ${isSelected ? "is-selected" : ""} ${
              block.enabled === false ? "is-off" : ""
            }`}
          >
            <button
              type="button"
              className="admin-shell__grip"
              aria-label={`שינוי מיקום: ${meta.label}`}
              {...handleProps}
            >
              ⠿
            </button>

            <button
              type="button"
              className="dpp-block__main"
              onClick={() => onSelect(block.key)}
            >
              <span className="dpp-block__label">
                {meta.label}
                {block.placement === "pinned" ? (
                  <FaThumbtack className="dpp-block__pin" title="נצמד למסך" />
                ) : null}
              </span>
              <small className="dpp-block__meta">
                {block.placement === "pinned" ? "מחוץ לזרימת העמוד" : `מקטע ${index + 1}`}
              </small>
            </button>

            <div className="dpp-block__tools">
              <button
                type="button"
                className={`admin-shell__icon-btn ${mobile ? "is-on" : ""}`}
                onClick={() =>
                  onPatch(block.key, {
                    visibility: { ...block.visibility, mobile: !mobile },
                  })
                }
                title={mobile ? "מוצג במובייל" : "מוסתר במובייל"}
              >
                <FaMobileAlt />
              </button>
              <button
                type="button"
                className={`admin-shell__icon-btn ${desktop ? "is-on" : ""}`}
                onClick={() =>
                  onPatch(block.key, {
                    visibility: { ...block.visibility, desktop: !desktop },
                  })
                }
                title={desktop ? "מוצג בדסקטופ" : "מוסתר בדסקטופ"}
              >
                <FaDesktop />
              </button>
              <button
                type="button"
                className="admin-shell__icon-btn"
                onClick={() =>
                  onPatch(block.key, { enabled: block.enabled === false })
                }
                title={block.enabled === false ? "הפעלה" : "כיבוי"}
              >
                {block.enabled === false ? <FaEyeSlash /> : <FaEye />}
              </button>
              <button
                type="button"
                className="admin-shell__icon-btn"
                onClick={() => onDuplicate(block.key)}
                title="שכפול"
              >
                <FaClone />
              </button>
              <button
                type="button"
                className="admin-shell__icon-btn"
                onClick={() => onRemove(block.key)}
                title="מחיקה"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        );
      }}
    />
  );
}

export default BlockCanvas;
