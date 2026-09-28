const STATUS_CONFIG = {
  DRAFT: {
    label: "Draft",
    className:
      "border-slate-500/30 bg-slate-500/10 text-slate-300",
  },

  IN_PROGRESS: {
    label: "In Progress",
    className:
      "border-sky-500/30 bg-sky-500/10 text-sky-300",
  },

  SUBMITTED: {
    label: "Submitted",
    className:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  },

  REVIEWED: {
    label: "Reviewed",
    className:
      "border-violet-500/30 bg-violet-500/10 text-violet-300",
  },
};

const EvaluationStatusBadge = ({
  status,
}) => {
  const config =
    STATUS_CONFIG[status] || {
      label: status || "Unknown",
      className:
        "border-white/10 bg-white/[0.03] text-slate-400",
    };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${config.className}`}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  );
};

export default EvaluationStatusBadge;
