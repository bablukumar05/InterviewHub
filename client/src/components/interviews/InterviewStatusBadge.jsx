import React from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  PlayCircle,
  XCircle,
  UserX,
} from 'lucide-react';

const STATUS_CONFIGS = {
  SCHEDULED: {
    label: 'Scheduled',
    bg: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    icon: Calendar,
  },
  CONFIRMED: {
    label: 'Confirmed',
    bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    icon: CheckCircle2,
  },
  IN_PROGRESS: {
    label: 'In Progress',
    bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    icon: PlayCircle,
  },
  COMPLETED: {
    label: 'Completed',
    bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: 'Cancelled',
    bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    icon: XCircle,
  },
  NO_SHOW: {
    label: 'No Show',
    bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    icon: UserX,
  },
  RESCHEDULED: {
    label: 'Rescheduled',
    bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    icon: Clock,
  },
};

export default function InterviewStatusBadge({ status, size = 'sm' }) {
  const normalized = String(status || 'SCHEDULED').toUpperCase();
  const config = STATUS_CONFIGS[normalized] || STATUS_CONFIGS.SCHEDULED;
  const Icon = config.icon;

  const isSmall = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${
        config.bg
      } ${isSmall ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}
    >
      <Icon size={isSmall ? 12 : 14} className="shrink-0" />
      <span>{config.label}</span>
    </span>
  );
}
