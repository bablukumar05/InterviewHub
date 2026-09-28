import {
  CheckCircle2,
  Circle,
  Clock3,
  FileText,
  XCircle,
} from "lucide-react";

import ApplicationStatusBadge from "./ApplicationStatusBadge";

import {
  formatDateTime,
  humanizeStatus,
  normalizeStatus,
} from "./applicationUtils";

const statusIcons = {
  APPLIED: FileText,
  SCREENING: Clock3,
  SHORTLISTED: CheckCircle2,
  INTERVIEW: Clock3,
  SELECTED: CheckCircle2,
  OFFER: FileText,
  HIRED: CheckCircle2,
  REJECTED: XCircle,
};

const getHistoryStatus = (entry) => {
  return normalizeStatus(
    entry?.status || entry?.stage
  );
};

const getHistoryDate = (entry) => {
  return (
    entry?.timestamp ||
    entry?.changedAt ||
    entry?.createdAt
  );
};

export default function ApplicationHistoryTimeline({
  history = [],
  currentStatus,
}) {
  const normalizedCurrentStatus =
    normalizeStatus(currentStatus);

  if (!Array.isArray(history) || history.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-5">
        <p className="text-sm text-slate-500">
          No status history is available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute bottom-3 left-[15px] top-3 w-px bg-slate-800" />

      <div className="space-y-7">
        {history.map((entry, index) => {
          const status = getHistoryStatus(entry);

          const Icon =
            statusIcons[status] || Circle;

          const isCurrent =
            status === normalizedCurrentStatus;

          const note = entry?.note || "";

          return (
            <div
              key={`${status}-${index}`}
              className="relative flex gap-4"
            >
              <div
                className={[
                  "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
                  isCurrent
                    ? "border-indigo-400/30 bg-indigo-500/15"
                    : status === "REJECTED"
                    ? "border-red-400/20 bg-red-400/10"
                    : "border-slate-700 bg-slate-900",
                ].join(" ")}
              >
                <Icon
                  size={15}
                  className={
                    status === "REJECTED"
                      ? "text-red-400"
                      : isCurrent
                      ? "text-indigo-300"
                      : "text-slate-500"
                  }
                />
              </div>

              <div className="min-w-0 flex-1 pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <ApplicationStatusBadge
                    status={status}
                    size="sm"
                  />

                  {isCurrent && (
                    <span className="text-[10px] font-medium uppercase tracking-wide text-indigo-400">
                      Current
                    </span>
                  )}
                </div>

                <p className="mt-2 text-sm font-medium text-white">
                  {humanizeStatus(status)}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {formatDateTime(
                    getHistoryDate(entry)
                  )}
                </p>

                {note && (
                  <div className="mt-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5">
                    <p className="text-xs leading-5 text-slate-400">
                      {note}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
