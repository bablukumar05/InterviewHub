import {
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  Video,
} from "lucide-react";

import { formatDateTime } from "./applicationUtils";

export default function ApplicationInterviewInfo({
  application,
}) {
  const scheduledAt =
    application?.interviewScheduledAt;

  const completedAt =
    application?.interviewCompletedAt;

  const interview =
    application?.interview ||
    application?.interviewDetails ||
    null;

  const hasInterview =
    Boolean(
      scheduledAt ||
        completedAt ||
        interview?.scheduledAt
    );

  if (!hasInterview) {
    return (
      <section className="rounded-2xl border border-white/10 bg-slate-900">
        <div className="border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2">
            <CalendarCheck2
              size={16}
              className="text-indigo-400"
            />

            <h2 className="text-sm font-semibold text-white">
              Interview
            </h2>
          </div>
        </div>

        <div className="p-5">
          <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-5">
            <p className="text-sm font-medium text-slate-300">
              No interview scheduled yet
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Interview details will appear here when
              the recruiting team schedules an interview.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900">
      <div className="border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-2">
          <CalendarCheck2
            size={16}
            className="text-indigo-400"
          />

          <h2 className="text-sm font-semibold text-white">
            Interview information
          </h2>
        </div>
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-2">
        <InterviewItem
          icon={Clock3}
          label="Scheduled"
          value={formatDateTime(
            interview?.scheduledAt ||
              scheduledAt
          )}
        />

        <InterviewItem
          icon={CheckCircle2}
          label="Completed"
          value={
            completedAt
              ? formatDateTime(completedAt)
              : "Not completed"
          }
        />

        {interview?.type && (
          <InterviewItem
            icon={Video}
            label="Interview type"
            value={String(
              interview.type
            ).replace(/_/g, " ")}
          />
        )}

        {interview?.meetingUrl && (
          <div className="flex items-end">
            <a
              href={interview.meetingUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400"
            >
              <Video size={16} />
              Join Interview
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

function InterviewItem({
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

      <p className="mt-2 text-sm font-medium capitalize text-slate-300">
        {value}
      </p>
    </div>
  );
}
