import FormField from "../forms/FormField";

const SkillScoreInput = ({
  skill,
  value = "",
  onChange,
  max = 5,
  error,
}) => {
  return (
    <FormField
      label={skill}
      error={error}
    >
      <div className="flex items-center gap-3">
        <select
          value={value}
          onChange={(event) =>
            onChange?.(
              Number(event.target.value)
            )
          }
          className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-sky-500/40"
        >
          <option value="">
            Select score
          </option>

          {Array.from(
            { length: max },
            (_, index) => index + 1
          ).map((score) => (
            <option
              key={score}
              value={score}
            >
              {score} / {max}
            </option>
          ))}
        </select>
      </div>
    </FormField>
  );
};

export default SkillScoreInput;
