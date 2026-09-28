import {
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  MessageSquareText,
  XCircle,
} from "lucide-react";

const STATUS_CONFIG = {
  APPLIED: {
    label: "Applied",
    icon: FileText,
    className:
      "border-slate-500/20 bg-slate-500/10 text-slate-300",
  },

  SCREENING: {
    label: "Screening",
    icon: Clock3,
    className:
      "border-blue-400/20 bg-blue-400/10 text-blue-300",
  },

  SHORTLISTED: {
    label: "Shortlisted",
    icon: CheckCircle2,
    className:
      "border-indigo-400/20 bg-indigo-400/10 text-indigo-300",
  },

  INTERVIEW: {
    label: "Interview",
    icon: MessageSquareText,
    className:
      "border-violet-400/20 bg-violet-400/10 text-violet-300",
  },

  SELECTED: {
    label: "Selected",
    icon: CheckCircle2,
    className:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  },

  OFFER: {
    label: "Offer",
    icon: BriefcaseBusiness,
    className:
      "border-amber-400/20 bg-amber-400/10 text-amber-300",
  },

  HIRED: {
    label: "Hired",
    icon: CheckCircle2,
    className:
      "border-green-400/20 bg-green-400/10 text-green-300",
  },

  REJECTED: {
    label: "Rejected",
    icon: XCircle,
    className:
      "border-red-400/20 bg-red-400/10 text-red-300",
  },
};

const fallbackConfig = {
  label: "Unknown",
  icon: FileCheck2,
  className:
    "border-white/10 bg-white/5 text-slate-300",
};

export default function ApplicationStatusBadge({
  status,
  size = "default",
}) {
  const normalizedStatus = String(status || "")
    .trim()
    .toUpperCase();

  const config =
    STATUS_CONFIG[normalizedStatus] || fallbackConfig;

  const Icon = config.icon;

  const sizeClasses =
    size === "sm"
      ? "px-2.5 py-1 text-[11px]"
      : "px-3 py-1.5 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${sizeClasses} ${config.className}`}
    >
      <Icon size={13} />
      {config.label}
    </span>
  );
}
