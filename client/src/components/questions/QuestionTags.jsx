const QuestionTags = ({
  tags = [],
  maxVisible = 5,
}) => {
  if (!tags.length) {
    return null;
  }

  const visibleTags =
    tags.slice(0, maxVisible);

  const remaining =
    Math.max(tags.length - maxVisible, 0);

  return (
    <div className="flex flex-wrap gap-2">
      {visibleTags.map((tag) => (
        <span
          key={tag}
          className="rounded-md bg-white/[0.04] px-2 py-1 text-xs text-slate-500"
        >
          #{tag}
        </span>
      ))}

      {remaining > 0 && (
        <span className="rounded-md bg-white/[0.04] px-2 py-1 text-xs text-slate-600">
          +{remaining}
        </span>
      )}
    </div>
  );
};

export default QuestionTags;
