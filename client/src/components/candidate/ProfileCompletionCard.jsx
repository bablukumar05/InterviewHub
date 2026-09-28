import { CheckCircle2, Circle } from 'lucide-react';

const ProfileCompletionCard = ({ completion = 0 }) => {
  const normalizedCompletion = Math.min(
    Math.max(Number(completion) || 0, 0),
    100
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">
            Profile completion
          </p>

          <h2 className="mt-1 text-3xl font-bold text-white">
            {normalizedCompletion}%
          </h2>
        </div>

        {normalizedCompletion === 100 ? (
          <CheckCircle2 className="h-7 w-7 text-emerald-400" />
        ) : (
          <Circle className="h-7 w-7 text-slate-500" />
        )}
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all duration-500"
          style={{
            width: `${normalizedCompletion}%`,
          }}
        />
      </div>

      <p className="mt-3 text-sm text-slate-400">
        {normalizedCompletion === 100
          ? 'Your profile is complete.'
          : 'Complete your profile to improve your hiring profile.'}
      </p>
    </div>
  );
};

export default ProfileCompletionCard;
