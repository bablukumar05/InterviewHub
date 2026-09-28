import { Filter, RotateCcw } from "lucide-react";

const JobFilters = ({ filters, onChange, onReset }) => {
  return (
    <div className="rounded-2xl border border-white/15 bg-slate-950/80 backdrop-blur-xl p-4 shadow-xl">
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-sky-400" />
          <h2 className="text-xs sm:text-sm font-semibold text-white">
            Filters
          </h2>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-300 transition hover:text-white cursor-pointer"
        >
          <RotateCcw size={13} />
          Reset
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <select
          value={filters.employmentType}
          onChange={(event) => onChange("employmentType", event.target.value)}
          className="rounded-xl border border-white/15 bg-slate-900/90 px-3.5 py-2.5 text-xs sm:text-sm text-white outline-none focus:border-sky-400/60"
        >
          <option value="">Employment Type</option>
          <option value="FULL_TIME">Full Time</option>
          <option value="PART_TIME">Part Time</option>
          <option value="INTERNSHIP">Internship</option>
          <option value="CONTRACT">Contract</option>
        </select>

        <select
          value={filters.workMode}
          onChange={(event) => onChange("workMode", event.target.value)}
          className="rounded-xl border border-white/15 bg-slate-900/90 px-3.5 py-2.5 text-xs sm:text-sm text-white outline-none focus:border-sky-400/60"
        >
          <option value="">Work Mode</option>
          <option value="REMOTE">Remote</option>
          <option value="HYBRID">Hybrid</option>
          <option value="ONSITE">Onsite</option>
        </select>

        <select
          value={filters.experienceLevel}
          onChange={(event) => onChange("experienceLevel", event.target.value)}
          className="rounded-xl border border-white/15 bg-slate-900/90 px-3.5 py-2.5 text-xs sm:text-sm text-white outline-none focus:border-sky-400/60"
        >
          <option value="">Experience Level</option>
          <option value="ENTRY_LEVEL">Entry Level</option>
          <option value="JUNIOR">Junior</option>
          <option value="MID_LEVEL">Mid Level</option>
          <option value="SENIOR">Senior</option>
          <option value="LEAD">Lead</option>
          <option value="EXECUTIVE">Executive</option>
        </select>

        <input
          value={filters.location}
          onChange={(event) => onChange("location", event.target.value)}
          placeholder="Location"
          className="rounded-xl border border-white/15 bg-slate-900/90 px-3.5 py-2.5 text-xs sm:text-sm text-white outline-none placeholder:text-slate-400 focus:border-sky-400/60"
        />
      </div>
    </div>
  );
};

export default JobFilters;
