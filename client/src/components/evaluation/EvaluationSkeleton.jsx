const EvaluationSkeleton = () => {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-32 rounded-2xl bg-white/[0.03]" />

      <div className="grid gap-5 md:grid-cols-2">
        <div className="h-48 rounded-2xl bg-white/[0.03]" />
        <div className="h-48 rounded-2xl bg-white/[0.03]" />
      </div>

      <div className="h-64 rounded-2xl bg-white/[0.03]" />
    </div>
  );
};

export default EvaluationSkeleton;
