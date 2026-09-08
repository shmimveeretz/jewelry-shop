import { AlertCircle } from "lucide-react";
import OptionGroup from "./OptionGroup";

/**
 * The full option picker, driven entirely by ctx. Shared by the hero panel and
 * the standalone optionSelector block so a page can repeat the picker next to
 * a lower CTA without the two ever disagreeing.
 *
 * `attachRef` marks the primary instance — the one validation scrolls to.
 */
function OptionGroups({ ctx, labels = {}, attachRef = false }) {
  const {
    optionModel,
    selected,
    handleSelect,
    showValidation,
    optionsRef,
  } = ctx;

  if (!optionModel?.hasAnyOptions) return null;

  const {
    jewelryTypeLabel = "סוג התכשיט",
    metalLabel = "סוג המתכת",
    lengthLabel = "אורך",
    lengthHint = "לא בטוחים? מדדו שרשרת שאתם אוהבים",
    validationMessage = "בחרו את כל האפשרויות כדי להמשיך לתשלום",
  } = labels;

  return (
    <div>
      <div ref={attachRef ? optionsRef : undefined} className="space-y-5">
        {optionModel.jewelryTypeChoices.length > 0 ? (
          <OptionGroup
            label={jewelryTypeLabel}
            choices={optionModel.jewelryTypeChoices}
            value={selected.jewelryType || ""}
            onChange={(value) => handleSelect("jewelryType", value)}
            invalid={showValidation}
          />
        ) : null}

        {optionModel.metalChoices.length > 0 ? (
          <OptionGroup
            label={metalLabel}
            choices={optionModel.metalChoices}
            value={selected.metalType || ""}
            onChange={(value) => handleSelect("metalType", value)}
            invalid={showValidation}
          />
        ) : null}

        {optionModel.showLength ? (
          <OptionGroup
            label={lengthLabel}
            hint={lengthHint}
            choices={optionModel.lengthChoices}
            value={selected.length || ""}
            onChange={(value) => handleSelect("length", value)}
            invalid={showValidation}
          />
        ) : null}

        {optionModel.extraGroups.map((group) => (
          <OptionGroup
            key={group.key}
            label={group.key}
            choices={group.choices}
            value={selected[group.key] || ""}
            onChange={(value) => handleSelect(group.key, value)}
            invalid={showValidation}
          />
        ))}
      </div>

      {showValidation && optionModel.missing.length > 0 ? (
        <p className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {validationMessage}
        </p>
      ) : null}
    </div>
  );
}

export default OptionGroups;
