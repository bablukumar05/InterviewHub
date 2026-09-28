const TYPE_LABELS = {
  TECHNICAL: "Technical",
  CODING: "Coding",
  SYSTEM_DESIGN: "System Design",
  BEHAVIORAL: "Behavioral",
  HR: "HR",
  SCENARIO: "Scenario",
  CONCEPTUAL: "Conceptual",
  CASE_STUDY: "Case Study",
};

const QuestionTypeBadge = ({ type }) => {
  const label =
    TYPE_LABELS[type] || type || "Question";

  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-slate-300">
      {label}
    </span>
  );
};

export default QuestionTypeBadge;
