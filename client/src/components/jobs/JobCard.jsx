import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  MapPin,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

const formatEmploymentType = (value) => {
  const labels = {
    FULL_TIME: "Full Time",
    PART_TIME: "Part Time",
    INTERNSHIP: "Internship",
    CONTRACT: "Contract",
  };

  return labels[value] || value;
};

const formatWorkMode = (value) => {
  const labels = {
    REMOTE: "Remote",
    HYBRID: "Hybrid",
    ONSITE: "Onsite",
  };

  return labels[value] || value;
};

const formatExperienceLevel = (value) => {
  const labels = {
    ENTRY_LEVEL: "Entry Level",
    JUNIOR: "Junior",
    MID_LEVEL: "Mid Level",
    SENIOR: "Senior",
    LEAD: "Lead",
    EXECUTIVE: "Executive",
  };

  return labels[value] || value;
};

const formatSalary = (salary) => {
  if (!salary) {
    return "Salary not disclosed";
  }

  const min = Number(salary.min || 0);
  const max = Number(salary.max || 0);
  const currency = salary.currency || "INR";

  if (!min && !max) {
    return "Salary not disclosed";
  }

  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });

  if (min && max) {
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  }

  return formatter.format(min || max);
};

const formatDeadline = (deadline) => {
  if (!deadline) {
    return "No deadline";
  }

  return new Date(deadline).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const JobCard = ({ job }) => {
  const organizationName =
    typeof job.organizationId === "object"
      ? job.organizationId?.name
      : "CodeCraft Labs";

  return (
    <article className="group flex flex-col justify-between rounded-2xl border border-white/15 bg-slate-950/85 backdrop-blur-xl p-5 shadow-xl transition duration-200 hover:-translate-y-0.5 hover:border-sky-400/45">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-sky-400/30 bg-sky-500/15">
              <BriefcaseBusiness size={20} className="text-sky-400" />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-base font-bold text-white">
                {job.title}
              </h2>

              <div className="mt-0.5 text-xs text-sky-200/80">
                {organizationName || "CodeCraft Labs"}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/15 bg-slate-900/90 px-2.5 py-1 text-[11px] font-medium text-slate-200">
            {formatEmploymentType(job.employmentType)}
          </span>

          <span className="rounded-full border border-white/15 bg-slate-900/90 px-2.5 py-1 text-[11px] font-medium text-slate-200">
            {formatWorkMode(job.workMode)}
          </span>

          <span className="rounded-full border border-white/15 bg-slate-900/90 px-2.5 py-1 text-[11px] font-medium text-slate-200">
            {formatExperienceLevel(job.experienceLevel)}
          </span>
        </div>

        <div className="mt-4 space-y-2 text-xs text-slate-200">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-sky-400" />
            <span>{job.location || "Remote"}</span>
          </div>

          <div className="flex items-center gap-2">
            <Users size={14} className="text-sky-400" />
            <span>
              {job.openings} opening{job.openings === 1 ? "" : "s"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <CalendarDays size={14} className="text-sky-400" />
            <span>Apply by {formatDeadline(job.deadline)}</span>
          </div>
        </div>

        <div className="mt-4">
          <span className="text-xs sm:text-sm font-bold text-emerald-400 font-mono">
            {formatSalary(job.salary)}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {(job.skills || []).slice(0, 6).map((skill) => (
            <span
              key={skill}
              className="rounded-lg border border-sky-400/20 bg-sky-500/10 px-2.5 py-1 text-[11px] text-sky-200"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 border-t border-white/15 pt-3.5">
        <Link
          to={`/jobs/${job._id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 transition group-hover:text-sky-300"
        >
          <span>View job</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
};

export default JobCard;
