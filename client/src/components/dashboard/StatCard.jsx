import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

const StatCard = ({
  title,
  value = 0,
  icon: Icon,
  trend,
  to,
}) => {
  const content = (
    <>
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-sky-400/25 bg-sky-500/15 text-sky-400">
          {Icon && <Icon className="h-5 w-5" />}
        </div>

        {trend ? (
          <div className="flex items-center gap-1 text-xs font-medium text-emerald-400">
            <ArrowUpRight className="h-3.5 w-3.5" />
            {trend}
          </div>
        ) : to ? (
          <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-sky-400" />
        ) : null}
      </div>

      <div className="mt-4">
        <span className="block text-xs font-medium text-slate-300">{title}</span>
        <h3 className="mt-1 text-2xl sm:text-3xl font-bold text-white">{value}</h3>
      </div>
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        className="group block rounded-2xl border border-white/15 bg-slate-950/75 backdrop-blur-xl p-5 shadow-lg transition hover:border-sky-400/40 hover:bg-slate-950/90"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="rounded-2xl border border-white/15 bg-slate-950/75 backdrop-blur-xl p-5 shadow-lg">
      {content}
    </div>
  );
};

export default StatCard;
