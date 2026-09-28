const STAGE_COLORS = {
  Applications: "bg-blue-500",
  Screening: "bg-indigo-500",
  Shortlisted: "bg-sky-500",
  Interviews: "bg-emerald-500",
  Selected: "bg-amber-500",
  Offers: "bg-orange-500",
  Hired: "bg-teal-400",
};

const HiringFunnelChart = ({ data = [] }) => {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="rounded-2xl border border-white/15 bg-slate-950/75 backdrop-blur-xl p-5 shadow-lg">
      <h2 className="mb-5 font-semibold text-white">
        Hiring Stages
      </h2>

      <div className="space-y-3.5">
        {data.map((item, index) => {
          const percentage = Math.round((item.count / maxCount) * 100);
          const colorClass = STAGE_COLORS[item.stage] || "bg-blue-500";

          return (
            <div key={item.stage} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-300">
                  {index + 1}. {item.stage}
                </span>
                <span className="font-semibold text-white">
                  {item.count}{" "}
                  <span className="font-normal text-slate-500">
                    ({percentage}%)
                  </span>
                </span>
              </div>

              <div className="h-3 w-full overflow-hidden rounded-full border border-slate-800 bg-slate-950">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                  style={{
                    width: `${Math.max(percentage, item.count > 0 ? 6 : 0)}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HiringFunnelChart;
