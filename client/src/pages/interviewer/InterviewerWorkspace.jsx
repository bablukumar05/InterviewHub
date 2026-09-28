import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  ExternalLink,
  Loader2,
  RefreshCw,
  Search,
  Video,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  getAssignedInterviews,
} from "../../api/interviewApi";
import { getInterviewerAnalytics } from "../../api/analyticsApi";

import InterviewStatusBadge from "../../components/interviews/InterviewStatusBadge";
import StatCard from "../../components/dashboard/StatCard";

const FILTERS = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "Upcoming",
    value: "upcoming",
  },
  {
    label: "Today",
    value: "today",
  },
  {
    label: "Completed",
    value: "COMPLETED",
  },
];

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const startOfTomorrow = () => {
  const date = startOfToday();
  date.setDate(date.getDate() + 1);
  return date;
};

const buildParams = (filter) => {
  const now = new Date();

  if (filter === "today") {
    return {
      from: startOfToday().toISOString(),
      to: startOfTomorrow().toISOString(),
    };
  }

  if (filter === "upcoming") {
    return {
      from: now.toISOString(),
    };
  }

  if (filter === "COMPLETED") {
    return {
      status: "COMPLETED",
    };
  }

  return {};
};

const extractItems = (response) => {
  const raw =
    response?.data?.items ||
    response?.data?.interviews ||
    response?.items ||
    response?.data ||
    [];
  return Array.isArray(raw) ? raw : [];
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const getCandidateName = (candidate) => {
  if (!candidate) {
    return "Candidate";
  }

  return (
    candidate.name ||
    [candidate.firstName, candidate.lastName]
      .filter(Boolean)
      .join(" ") ||
    "Candidate"
  );
};

export default function InterviewerWorkspace() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [interviews, setInterviews] = useState([]);
  const [stats, setStats] = useState({
    totalInterviews: 0,
    upcomingInterviews: 0,
    completedInterviews: 0,
    completedEvaluations: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadInterviews = useCallback(
    async ({ refresh = false } = {}) => {
      try {
        setError("");

        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const params = buildParams(filter);

        const [response, analyticsRes] = await Promise.all([
          getAssignedInterviews({
            page: 1,
            limit: 50,
            ...params,
          }),
          getInterviewerAnalytics().catch(() => null),
        ]);

        const items = extractItems(response);
        setInterviews(items);

        if (analyticsRes?.success && analyticsRes?.data?.stats) {
          setStats(analyticsRes.data.stats);
        } else if (filter === "all") {
          setStats((prev) => ({
            ...prev,
            totalInterviews: items.length,
            upcomingInterviews: items.filter((i) =>
              ["SCHEDULED", "CONFIRMED"].includes(i.status)
            ).length,
            completedInterviews: items.filter((i) => i.status === "COMPLETED")
              .length,
          }));
        }
      } catch (requestError) {
        setError(
          requestError?.response?.data?.message ||
            "Unable to load assigned interviews."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [filter]
  );

  useEffect(() => {
    loadInterviews();
  }, [loadInterviews]);

  const filteredInterviews = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return interviews;
    }

    return interviews.filter((interview) => {
      const candidate = interview?.candidateId || {};
      const job = interview?.jobId || {};

      const text = [
        interview?.roundName,
        interview?.roundType,
        candidate?.name,
        candidate?.firstName,
        candidate?.lastName,
        job?.title,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(query);
    });
  }, [interviews, search]);

  return (
    <main className="min-h-full bg-slate-950 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-400/10 bg-indigo-400/5 px-3 py-1 text-xs font-medium text-indigo-300">
              <Video size={14} />
              Interviewer Workspace
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              My Interviews
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/interviewer/questions"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-500 transition shadow-sm"
            >
              <BookOpen size={15} />
              Question Bank
            </Link>

            <button
              type="button"
              onClick={() =>
                loadInterviews({
                  refresh: true,
                })
              }
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-white/5 hover:text-white transition disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Assigned Interviews"
            value={loading ? "..." : stats.totalInterviews || interviews.length}
            icon={CalendarDays}
            to="/interviewer/interviews"
          />
          <StatCard
            title="Upcoming Rounds"
            value={loading ? "..." : stats.upcomingInterviews}
            icon={Video}
            to="/interviewer/interviews"
          />
          <StatCard
            title="Completed Rounds"
            value={loading ? "..." : stats.completedInterviews}
            icon={CheckCircle2}
            to="/interviewer/interviews"
          />
          <StatCard
            title="Scorecards Submitted"
            value={loading ? "..." : stats.completedEvaluations}
            icon={ClipboardCheck}
            to="/interviewer/questions"
          />
        </div>

        <section className="rounded-2xl border border-white/10 bg-slate-900 p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {FILTERS.map((item) => {
                const active = filter === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setFilter(item.value)}
                    className={[
                      "shrink-0 rounded-lg border px-3.5 py-2 text-xs font-medium transition",
                      active
                        ? "border-indigo-400/20 bg-indigo-400/10 text-indigo-300"
                        : "border-white/10 text-slate-400 hover:bg-white/5 hover:text-white",
                    ].join(" ")}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full lg:w-72">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search candidate or job..."
                className="w-full rounded-lg border border-white/10 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-600 focus:border-indigo-400/40"
              />
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-xl border border-red-400/15 bg-red-400/5 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <Loader2
              size={30}
              className="mx-auto animate-spin text-indigo-400"
            />
          </div>
        ) : filteredInterviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900 px-6 py-16 text-center">
            <CalendarDays
              size={30}
              className="mx-auto text-slate-600"
            />

            <h2 className="mt-4 text-lg font-semibold text-white">
              No interviews found
            </h2>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInterviews.map((interview) => {
              const candidate = interview?.candidateId || {};
              const job = interview?.jobId || {};

              return (
                <InterviewCard
                  key={interview._id}
                  interview={interview}
                  candidate={candidate}
                  job={job}
                />
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

function InterviewCard({
  interview,
  candidate,
  job,
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-slate-900 p-5 transition hover:border-white/15">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <InterviewStatusBadge
              status={interview.status}
              size="sm"
            />

            <span className="text-xs text-slate-500">
              Round {interview.roundNumber || 1}
            </span>
          </div>

          <h2 className="mt-2.5 text-base font-semibold text-white">
            {interview.roundName || "Interview Round"}
          </h2>

          <div className="mt-1 text-xs font-medium text-slate-400">
            {job?.title || "Job"}
          </div>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-200">
              <UserRoundIcon />
              {getCandidateName(candidate)}
            </span>

            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={14} />
              {formatDate(interview.scheduledAt)}
            </span>

            <span className="inline-flex items-center gap-1.5">
              <Clock3 size={14} />
              {formatTime(interview.scheduledAt)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {interview.meetingUrl && (
            <a
              href={interview.meetingUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-2.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition"
            >
              <Video size={14} />
              Join Call
              <ExternalLink size={12} />
            </a>
          )}

          <Link
            to={`/interviewer/interviews/${interview._id}/evaluation`}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-sky-500 px-4 py-2.5 text-xs font-semibold text-slate-950 hover:bg-sky-400 transition"
          >
            <ClipboardCheck size={14} />
            Evaluate
          </Link>

          <Link
            to={`/interviewer/interviews/${interview._id}`}
            className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-slate-950 px-4 py-2.5 text-xs font-medium text-white hover:bg-white/5 transition"
          >
            Open Interview
          </Link>
        </div>
      </div>
    </article>
  );
}

function UserRoundIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-slate-400"
    >
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
