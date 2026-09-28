import {
  CheckCircle2,
  FileText,
  GraduationCap,
  Layers3,
  UserRound,
} from "lucide-react";

import {
  formatCurrency,
  getEntityId,
} from "./applicationUtils";

export default function CandidateApplicationSnapshot({
  application,
}) {
  const profile =
    application?.candidateProfile || {};

  const resume =
    application?.resume || {};

  const skills = Array.isArray(
    application?.skills
  )
    ? application.skills
    : Array.isArray(profile?.skills)
    ? profile.skills
    : [];

  const experience =
    application?.experienceYears ??
    application?.candidate?.experienceYears ??
    profile?.experienceYears;

  const expectedSalary =
    application?.expectedSalary ??
    profile?.expectedSalary;

  const salaryCurrency =
    profile?.salaryExpectation?.currency ||
    "USD";

  const resumeUrl =
    application?.resumeUrl ||
    resume?.url;

  const candidateId =
    getEntityId(application?.candidateId) ||
    getEntityId(application?.candidate);

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900">
      <div className="border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-2">
          <UserRound
            size={16}
            className="text-indigo-400"
          />

          <h2 className="text-sm font-semibold text-white">
            Application snapshot
          </h2>
        </div>

        <p className="mt-1 text-xs text-slate-500">
          These are the details captured when you applied.
        </p>
      </div>

      <div className="p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <SnapshotItem
            icon={Layers3}
            label="Experience"
            value={
              experience !== undefined &&
              experience !== null
                ? `${experience} years`
                : "—"
            }
          />

          <SnapshotItem
            icon={GraduationCap}
            label="Expected salary"
            value={
              expectedSalary !== undefined &&
              expectedSalary !== null
                ? formatCurrency(
                    expectedSalary,
                    salaryCurrency
                  )
                : "—"
            }
          />
        </div>

        <div className="mt-5 rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="flex items-center gap-2">
            <Layers3
              size={15}
              className="text-slate-500"
            />

            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Skills submitted
            </p>
          </div>

          {skills.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-slate-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-600">
              No skills snapshot available.
            </p>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-400/10 p-2">
              <FileText
                size={17}
                className="text-indigo-400"
              />
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Resume submitted
              </p>

              <p className="mt-0.5 text-sm font-medium text-white">
                {resume?.originalName ||
                  profile?.resumeOriginalName ||
                  "Resume"}
              </p>
            </div>

            <CheckCircle2
              size={17}
              className="text-emerald-400"
            />
          </div>

          {resumeUrl && (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              Open Resume
            </a>
          )}
        </div>

        {candidateId && (
          <p className="mt-4 font-mono text-[10px] text-slate-700">
            Candidate ID: {candidateId}
          </p>
        )}
      </div>
    </section>
  );
}

function SnapshotItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <div className="flex items-center gap-2">
        <Icon
          size={15}
          className="text-slate-600"
        />

        <span className="text-[11px] uppercase tracking-wide text-slate-600">
          {label}
        </span>
      </div>

      <p className="mt-2 text-sm font-medium text-slate-300">
        {value}
      </p>
    </div>
  );
}
