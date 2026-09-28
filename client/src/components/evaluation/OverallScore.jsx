const OverallScore = ({
  score = 0,
  max = 100,
  label = "Overall Score",
}) => {
  const normalized = Math.min(
    Math.max(Number(score) || 0, 0),
    max
  );

  const percentage =
    (normalized / max) * 100;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">
            {label}
          </p>

          <p className="mt-1 text-3xl font-bold text-white">
            {normalized}
            <span className="ml-1 text-base font-normal text-slate-500">
              / {max}
            </span>
          </p>
        </div>

        <p className="text-sm font-semibold text-sky-400">
          {Math.round(percentage)}%
        </p>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-current text-sky-400 transition-all"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
};

export default OverallScore;
