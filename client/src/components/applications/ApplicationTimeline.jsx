import {
  CheckCircle2,
  Circle,
  Clock3,
  XCircle,
} from "lucide-react";

const FLOW = [
  "APPLIED",
  "SCREENING",
  "SHORTLISTED",
  "INTERVIEW",
  "SELECTED",
  "OFFER",
  "HIRED",
];

const LABELS = {
  APPLIED: "Applied",
  SCREENING: "Screening",
  SHORTLISTED: "Shortlisted",
  INTERVIEW: "Interview",
  SELECTED: "Selected",
  OFFER: "Offer",
  HIRED: "Hired",
  REJECTED: "Rejected",
};

const formatDate = (date) => {
  if (!date) return null;

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function ApplicationTimeline({
  status,
  history = [],
}) {
  const normalizedStatus = String(status || "")
    .trim()
    .toUpperCase();

  const isRejected = normalizedStatus === "REJECTED";

  const currentIndex = FLOW.indexOf(normalizedStatus);

  const historyMap = new Map();

  history.forEach((item) => {
    const itemStatus = String(
      item?.status || item?.stage || ""
    )
      .trim()
      .toUpperCase();

    if (!itemStatus) return;

    historyMap.set(itemStatus, item);
  });

  if (isRejected) {
    const rejectedEntry =
      historyMap.get("REJECTED") || history[history.length - 1];

    return (
      <div className="rounded-xl border border-red-400/10 bg-red-400/[0.03] p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-400/10">
            <XCircle
              size={19}
              className="text-red-400"
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-white">
              Application rejected
            </p>

            {rejectedEntry?.timestamp && (
              <p className="mt-1 text-xs text-slate-500">
                {formatDate(rejectedEntry.timestamp)}
              </p>
            )}

            {rejectedEntry?.changedAt && (
              <p className="mt-1 text-xs text-slate-500">
                {formatDate(rejectedEntry.changedAt)}
              </p>
            )}

            {rejectedEntry?.note && (
              <p className="mt-3 text-sm leading-6 text-slate-400">
                {rejectedEntry.note}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-x-auto pb-2">
      <div className="min-w-[700px] px-2">
        <div className="relative">

          <div className="absolute left-0 right-0 top-5 h-px bg-slate-800" />

          {currentIndex >= 0 && (
            <div
              className="absolute left-0 top-5 h-px bg-indigo-500 transition-all"
              style={{
                width:
                  FLOW.length === 1
                    ? "0%"
                    : `${Math.min(
                        (currentIndex / (FLOW.length - 1)) *
                          100,
                        100
                      )}%`,
              }}
            />
          )}

          <div className="relative flex justify-between">
            {FLOW.map((item, index) => {
              const completed =
                currentIndex >= 0 &&
                index <= currentIndex;

              const isCurrent =
                normalizedStatus === item;

              const historyEntry = historyMap.get(item);

              return (
                <div
                  key={item}
                  className="flex w-[90px] flex-col items-center"
                >
                  <div
                    className={[
                      "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border transition",
                      completed
                        ? "border-indigo-400 bg-indigo-500/15"
                        : "border-slate-700 bg-slate-900",
                    ].join(" ")}
                  >
                    {completed ? (
                      <CheckCircle2
                        size={18}
                        className={
                          isCurrent
                            ? "text-indigo-300"
                            : "text-indigo-400"
                        }
                      />
                    ) : (
                      <Circle
                        size={17}
                        className="text-slate-600"
                      />
                    )}
                  </div>

                  <p
                    className={[
                      "mt-3 text-center text-[11px] font-medium",
                      isCurrent
                        ? "text-white"
                        : completed
                        ? "text-slate-300"
                        : "text-slate-600",
                    ].join(" ")}
                  >
                    {LABELS[item]}
                  </p>

                  {historyEntry && (
                    <p className="mt-1 text-center text-[10px] text-slate-600">
                      {formatDate(
                        historyEntry.timestamp ||
                          historyEntry.changedAt
                      )}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
