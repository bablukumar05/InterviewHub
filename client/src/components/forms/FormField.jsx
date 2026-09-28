const FormField = ({
  label,
  required = false,
  hint,
  error,
  children,
  className = "",
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-200">
          {label}

          {required && (
            <span className="ml-1 text-rose-400">
              *
            </span>
          )}
        </label>
      )}

      {children}

      {error && (
        <p className="text-xs text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
