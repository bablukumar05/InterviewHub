import {
  ArrowRight,
  Building2,
  CalendarDays,
  MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";

import ApplicationStatusBadge from "./ApplicationStatusBadge";
import ApplicationTimeline from "./ApplicationTimeline";

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getId = (value) => {
  if (!value) return null;

  if (typeof value === "string") {
    return value;
  }

  return value?._id || value?.id || null;
};

export default function ApplicationCard({
  application,
}) {
  if (!application) return null;

  const job =
    application.job ||
    application.jobId ||
    {};

  const jobId = getId(application.jobId) || getId(job);

  const title =
    job?.title ||
    "Job Application";

  const company =
    job?.organizationId?.name ||
    job?.organization?.name ||
    job?.companyName ||
    "Organization";

  const status = application.status || "APPLIED";

  const history =
    Array.isArray(application.statusHistory)
      ? application.statusHistory
      : Array.isArray(application.stageHistory)
      ? application.stageHistory
      : [];

  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-xl shadow-black/10">

      <div className="border-b border-white/10 p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <ApplicationStatusBadge status={status} />
            </div>

            <h2 className="mt-3 truncate text-lg font-semibold text-white sm:text-xl">
              {title}
            </h2>

            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Building2 size={14} />
                {company}
              </span>

              {job?.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={14} />
                  {job.location}
                </span>
              )}

              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={14} />
                Applied {formatDate(application.appliedAt)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start shrink-0">
            {application?._id && (
              <Link
                to={`/candidate/applications/${application._id}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500/10 px-3.5 py-2 text-xs font-medium text-sky-400 border border-sky-500/20 transition hover:bg-sky-500/20 hover:text-sky-300"
              >
                View Details
                <ArrowRight size={14} />
              </Link>
            )}

            {jobId && (
              <Link
                to={`/jobs/${jobId}`}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3.5 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                View Job
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="border-b border-white/10 p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">
            Application progress
          </h3>

          <span className="text-xs text-slate-500">
            Current:{" "}
            <span className="text-slate-300">
              {String(status).replace(/_/g, " ")}
            </span>
          </span>
        </div>

        <ApplicationTimeline
          status={status}
          history={history}
        />
      </div>

      <div className="grid gap-px bg-white/5 sm:grid-cols-3">
        <div className="bg-slate-900 p-4">
          <p className="text-[11px] uppercase tracking-wide text-slate-600">
            Applied
          </p>

          <p className="mt-1 text-sm font-medium text-slate-300">
            {formatDate(application.appliedAt)}
          </p>
        </div>

        <div className="bg-slate-900 p-4">
          <p className="text-[11px] uppercase tracking-wide text-slate-600">
            Current status
          </p>

          <p className="mt-1 text-sm font-medium text-slate-300">
            {String(status).replace(/_/g, " ")}
          </p>
        </div>

        <div className="bg-slate-900 p-4">
          <p className="text-[11px] uppercase tracking-wide text-slate-600">
            Application ID
          </p>

          <p className="mt-1 truncate font-mono text-xs text-slate-500">
            {application._id || "—"}
          </p>
        </div>
      </div>
    </article>
  );
}
