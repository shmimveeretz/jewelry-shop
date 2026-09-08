import FieldControl from "../components/FieldControl";
import { BLOCK_META } from "../../dpp/blockMeta";
import { labelFor } from "./fieldLabels";

/**
 * Per-block property form, generated from the field descriptors the server
 * publishes at GET /api/admin/block-types.
 *
 * Nothing here is hand-written per block type, which is what keeps the editor
 * and the server allowlist from drifting apart: a prop the server would reject
 * is a prop this form never offers.
 */
function BlockInspector({ block, schema, onChange }) {
  if (!block) {
    return (
      <div className="dpp-panel">
        <p className="dpp-panel__title">מאפייני בלוק</p>
        <p className="admin-field__hint">בחרו בלוק מהעמוד כדי לערוך אותו.</p>
      </div>
    );
  }

  const meta = BLOCK_META[block.type] || { label: block.type };
  const fields = schema?.fields || [];

  const setProp = (key, value) => {
    const props = { ...block.props };
    if (value === undefined || value === "") {
      delete props[key];
    } else {
      props[key] = value;
    }
    onChange({ props });
  };

  return (
    <div className="dpp-panel">
      <p className="dpp-panel__title">{meta.label}</p>
      <p className="admin-field__hint">{meta.description}</p>

      {fields.length === 0 ? (
        <p className="admin-field__hint">לבלוק הזה אין הגדרות.</p>
      ) : (
        <div className="dpp-panel__fields">
          {fields.map((field) => (
            <FieldControl
              key={field.key}
              field={field}
              label={labelFor(field.key)}
              value={block.props?.[field.key]}
              onChange={(value) => setProp(field.key, value)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default BlockInspector;
