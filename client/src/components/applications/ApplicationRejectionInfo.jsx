import { AlertCircle } from "lucide-react";

import {
  humanizeStatus,
  normalizeStatus,
} from "./applicationUtils";

export default function ApplicationRejectionInfo({
  application,
}) {
  const status = normalizeStatus(
    application?.status
  );

  if (status !== "REJECTED") {
    return null;
  }

  const reason =
    application?.rejectionReason ||
    application?.statusHistory
      ?.slice()
      ?.reverse()
      ?.find(
        (entry) =>
          normalizeStatus(entry?.status) ===
          "REJECTED"
      )?.note ||
    application?.stageHistory
      ?.slice()
      ?.reverse()
      ?.find(
        (entry) =>
          normalizeStatus(entry?.stage) ===
          "REJECTED"
      )?.note;

  return (
    <section className="rounded-2xl border border-red-400/15 bg-red-400/[0.03]">
      <div className="border-b border-red-400/10 px-5 py-4">
        <div className="flex items-center gap-2">
          <AlertCircle
            size={17}
            className="text-red-400"
          />

          <h2 className="text-sm font-semibold text-white">
            Application outcome
          </h2>
        </div>
      </div>

      <div className="p-5">
        <p className="text-sm font-medium text-red-300">
          Application rejected
        </p>

        <p className="mt-3 text-sm leading-6 text-slate-400">
          {reason ||
            "The recruiting team has closed this application."}
        </p>
      </div>
    </section>
  );
}
