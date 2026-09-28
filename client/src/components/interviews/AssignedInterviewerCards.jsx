import {
  Crown,
  UserRound,
  Users,
} from "lucide-react";

const getName = (user) => {
  if (!user) {
    return "Unknown interviewer";
  }

  return (
    user.name ||
    [user.firstName, user.lastName]
      .filter(Boolean)
      .join(" ") ||
    "Interviewer"
  );
};

export default function AssignedInterviewerCards({
  interviewers = [],
}) {
  if (
    !Array.isArray(interviewers) ||
    interviewers.length === 0
  ) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-5">
        <div className="flex items-center gap-2">
          <Users
            size={17}
            className="text-slate-600"
          />

          <p className="text-sm text-slate-500">
            No interviewers assigned yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {interviewers.map(
        (participant, index) => {
          const user =
            participant?.userId || {};

          const primary =
            participant?.role ===
              "PRIMARY" ||
            index === 0;

          return (
            <div
              key={
                user?._id ||
                participant?.userId ||
                index
              }
              className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-slate-800">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserRound
                      size={18}
                      className="text-slate-500"
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {getName(user)}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {user?.title ||
                      user?.department ||
                      "Interviewer"}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <span
                  className={[
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium",
                    primary
                      ? "border-indigo-400/20 bg-indigo-400/10 text-indigo-300"
                      : "border-white/10 bg-white/5 text-slate-400",
                  ].join(" ")}
                >
                  {primary && (
                    <Crown size={12} />
                  )}

                  {primary
                    ? "Primary interviewer"
                    : "Panel interviewer"}
                </span>
              </div>
            </div>
          );
        }
      )}
    </div>
  );
}
