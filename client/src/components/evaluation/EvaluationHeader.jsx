import {
  ClipboardCheck,
  UserRound,
} from "lucide-react";

import EvaluationStatusBadge from "./EvaluationStatusBadge";

const EvaluationHeader = ({
  candidateName,
  jobTitle,
  roundName,
  status,
}) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm text-sky-400">
            <ClipboardCheck size={17} />
            Interview Evaluation
          </div>

          <h1 className="mt-2 text-2xl font-bold text-white">
            {roundName || "Interview Evaluation"}
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            {jobTitle || "Technical Interview"}
          </p>
        </div>

        {status && (
          <EvaluationStatusBadge
            status={status}
          />
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-4 border-t border-white/10 pt-5 text-sm">
        {candidateName && (
          <div className="flex items-center gap-2 text-slate-400">
            <UserRound size={15} />
            <span>{candidateName}</span>
          </div>
        )}

        {jobTitle && (
          <div className="flex items-center gap-2 text-slate-400">
            <ClipboardCheck size={15} />
            <span>{jobTitle}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EvaluationHeader;
