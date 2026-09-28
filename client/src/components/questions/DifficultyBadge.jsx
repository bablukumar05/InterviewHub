const DIFFICULTY_LABELS = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
  EXPERT: "Expert",
};

const DifficultyBadge = ({ difficulty }) => {
  const label =
    DIFFICULTY_LABELS[difficulty] ||
    difficulty ||
    "Unknown";

  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-slate-400">
      {label}
    </span>
  );
};

export default DifficultyBadge;
