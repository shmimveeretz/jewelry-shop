function OptionGroup({ label, hint, choices, value, onChange, invalid }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold text-navy">{label}</span>
        {hint ? <span className="text-xs text-gray-600">{hint}</span> : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {choices.map((choice) => {
          const isSelected = value === choice.value;
          return (
            <button
              key={choice.value}
              type="button"
              onClick={() => onChange(choice.value)}
              aria-pressed={isSelected}
              className={`min-h-11 rounded-lg border px-4 py-2 text-sm transition-colors ${
                isSelected
                  ? "border-navy bg-navy text-white"
                  : "border-gray-300 bg-white text-navy hover:border-navy"
              } ${invalid && !value ? "border-red-300" : ""}`}
            >
              {choice.label}
              {choice.note ? (
                <span
                  className={`ms-1 text-xs ${
                    isSelected ? "text-white/70" : "text-gray-600"
                  }`}
                >
                  {choice.note}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default OptionGroup;
