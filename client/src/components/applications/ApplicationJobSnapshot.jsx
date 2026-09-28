import {
  Building2,
  CalendarDays,
  MapPin,
  BriefcaseBusiness,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  formatDate,
  getEntityId,
} from "./applicationUtils";

export default function ApplicationJobSnapshot({
  application,
}) {
  const job =
    application?.job ||
    application?.jobId ||
    {};

  const jobId =
    getEntityId(application?.jobId) ||
    getEntityId(job);

  const title =
    job?.title ||
    "Job position";

  const company =
    job?.organizationId?.name ||
    job?.organization?.name ||
    job?.companyName ||
    "Organization";

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900">
      <div className="border-b border-white/10 px-5 py-4">
        <h2 className="text-sm font-semibold text-white">
          Job snapshot
        </h2>
      </div>

      <div className="p-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.15em] text-slate-600">
              Position
            </p>

            <h3 className="mt-1 text-lg font-semibold text-white">
              {title}
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              {company}
            </p>
          </div>

          {jobId && (
            <Link
              to={`/jobs/${jobId}`}
              className="inline-flex shrink-0 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              View Job
            </Link>
          )}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem
            icon={BriefcaseBusiness}
            label="Employment"
            value={
              job?.employmentType ||
              job?.type ||
              "—"
            }
          />

          <InfoItem
            icon={MapPin}
            label="Location"
            value={job?.location || "—"}
          />

          <InfoItem
            icon={BriefcaseBusiness}
            label="Work mode"
            value={job?.workMode || "—"}
          />

          <InfoItem
            icon={CalendarDays}
            label="Deadline"
            value={formatDate(job?.deadline)}
          />
        </div>
      </div>
    </section>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
      <div className="flex items-center gap-2">
        <Icon
          size={15}
          className="text-slate-600"
        />

        <span className="text-[11px] uppercase tracking-wide text-slate-600">
          {label}
        </span>
      </div>

      <p className="mt-2 text-sm font-medium capitalize text-slate-300">
        {String(value).replace(/_/g, " ")}
      </p>
    </div>
  );
}
