const EvaluationSection = ({
  title,
  children,
  className = "",
}) => {
  return (
    <section
      className={`rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 ${className}`}
    >
      <h2 className="mb-5 text-lg font-semibold text-white">
        {title}
      </h2>

      {children}
    </section>
  );
};

export default EvaluationSection;
