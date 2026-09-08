import { FaPlus } from "react-icons/fa";
import { BLOCK_META, BLOCK_TYPES } from "../../dpp/blockMeta";

/**
 * The palette lists every block the runtime can render. Singletons already on
 * the canvas are disabled rather than hidden, so it stays obvious why a second
 * hero can't be added.
 */
function BlockPalette({ blocks, onAdd }) {
  const usedTypes = new Set(blocks.map((block) => block.type));

  return (
    <div className="dpp-palette">
      <p className="dpp-panel__title">הוספת בלוק</p>

      <div className="dpp-palette__grid">
        {BLOCK_TYPES.map((type) => {
          const meta = BLOCK_META[type];
          const isBlocked = meta.singleton && usedTypes.has(type);

          return (
            <button
              key={type}
              type="button"
              className="dpp-palette__item"
              disabled={isBlocked}
              onClick={() => onAdd(type)}
              title={isBlocked ? "כבר קיים בעמוד" : meta.description}
            >
              <span className="dpp-palette__item-label">
                <FaPlus />
                {meta.label}
              </span>
              <small>{meta.description}</small>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default BlockPalette;
