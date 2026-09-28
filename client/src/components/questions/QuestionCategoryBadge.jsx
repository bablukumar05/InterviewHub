const formatCategory = (value) => {
  if (!value) return "General";

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
};

const QuestionCategoryBadge = ({
  category,
}) => {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-slate-400">
      {formatCategory(category)}
    </span>
  );
};

export default QuestionCategoryBadge;
