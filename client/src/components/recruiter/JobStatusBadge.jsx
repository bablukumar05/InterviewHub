const statusStyles = {
  DRAFT: 'border-slate-500/20 bg-slate-500/10 text-slate-300',
  PUBLISHED: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
  PAUSED: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
  CLOSED: 'border-red-500/20 bg-red-500/10 text-red-400',
  ACTIVE: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
};

const labels = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  PAUSED: 'Paused',
  CLOSED: 'Closed',
  ACTIVE: 'Active',
};

const JobStatusBadge = ({ status }) => {
  const className = statusStyles[status] || statusStyles.DRAFT;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${className}`}
    >
      {labels[status] || status}
    </span>
  );
};

export default JobStatusBadge;
