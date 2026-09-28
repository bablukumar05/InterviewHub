import FormField from "../forms/FormField";

const OPTIONS = [
  {
    value: "STRONG_HIRE",
    label: "Strong Hire",
  },
  {
    value: "HIRE",
    label: "Hire",
  },
  {
    value: "NEXT_ROUND",
    label: "Next Round",
  },
  {
    value: "HOLD",
    label: "Hold",
  },
  {
    value: "NO_HIRE",
    label: "No Hire",
  },
];

const RecommendationSelector = ({
  value = "",
  onChange,
  error,
}) => {
  return (
    <FormField
      label="Recommendation"
      required
      error={error}
    >
      <select
        value={value}
        onChange={(event) =>
          onChange?.(event.target.value)
        }
        className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-sky-500/40"
      >
        <option value="">
          Select recommendation
        </option>

        {OPTIONS.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  );
};

export default RecommendationSelector;
