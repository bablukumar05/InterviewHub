import FormField from "./FormField";

const FormTextarea = ({
  label,
  error,
  required = false,
  hint,
  rows = 5,
  className = "",
  ...props
}) => {
  return (
    <FormField
      label={label}
      required={required}
      hint={hint}
      error={error}
    >
      <textarea
        rows={rows}
        className={`w-full resize-y rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-sky-500/40 focus:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
        {...props}
      />
    </FormField>
  );
};

export default FormTextarea;
