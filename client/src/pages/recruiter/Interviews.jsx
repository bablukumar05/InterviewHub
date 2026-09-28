import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Search,
  Filter,
  Users,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  XCircle,
  UserCheck,
  Loader2,
} from "lucide-react";
import {
  getRecruiterInterviews,
  cancelInterview,
} from "../../api/interviewApi";
import InterviewStatusBadge from "../../components/interviews/InterviewStatusBadge";
import AssignInterviewersModal from "../../components/interviews/AssignInterviewersModal";
import RescheduleInterviewModal from "../../components/interviews/RescheduleInterviewModal";

export default function RecruiterInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [assignModalInterview, setAssignModalInterview] = useState(null);
  const [rescheduleModalInterview, setRescheduleModalInterview] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchInterviews = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError("");

      const params = {};
      if (statusFilter !== "ALL") {
        params.status = statusFilter;
      }

      const res = await getRecruiterInterviews(params);
      const rawList =
        res?.data?.items ||
        res?.data?.interviews ||
        res?.items ||
        res?.data ||
        [];
      setInterviews(Array.isArray(rawList) ? rawList : []);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to load interviews list"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  const handleCancel = async (interview) => {
    const reason = window.prompt(
      `Please provide a reason to cancel the interview for ${
        interview.candidateId?.name || "candidate"
      }:`
    );
    if (!reason || !reason.trim()) return;

    try {
      setCancellingId(interview._id);
      await cancelInterview(interview._id, { reason: reason.trim() });
      await fetchInterviews(true);
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to cancel interview"
      );
    } finally {
      setCancellingId(null);
    }
  };

  const filtered = interviews.filter((item) => {
    const term = search.toLowerCase();
    const candidateName = (item.candidateId?.name || "").toLowerCase();
    const jobTitle = (item.jobId?.title || "").toLowerCase();
    const roundName = (item.roundName || "").toLowerCase();
    return (
      candidateName.includes(term) ||
      jobTitle.includes(term) ||
      roundName.includes(term)
    );
  });

  const stats = {
    total: interviews.length,
    scheduled: interviews.filter((i) =>
      ["SCHEDULED", "CONFIRMED"].includes(i.status)
    ).length,
    inProgress: interviews.filter((i) => i.status === "IN_PROGRESS").length,
    completed: interviews.filter((i) => i.status === "COMPLETED").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Interviews
        </h1>

        <button
          type="button"
          onClick={() => fetchInterviews(true)}
          disabled={refreshing || loading}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-white/25 bg-white/10 hover:bg-white/20 backdrop-blur-xl px-4 py-2 text-xs font-semibold text-white transition-all disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin text-sky-400" : "text-sky-300"} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/15 bg-slate-950/75 backdrop-blur-xl p-4 shadow-lg">
          <span className="block text-xs text-slate-200 font-medium">Total Interviews</span>
          <div className="mt-1 text-2xl font-bold text-white">{stats.total}</div>
        </div>
        <div className="rounded-2xl border border-white/15 bg-slate-950/75 backdrop-blur-xl p-4 shadow-lg">
          <span className="block text-xs text-sky-300 font-medium">Upcoming / Confirmed</span>
          <div className="mt-1 text-2xl font-bold text-sky-300">{stats.scheduled}</div>
        </div>
        <div className="rounded-2xl border border-white/15 bg-slate-950/75 backdrop-blur-xl p-4 shadow-lg">
          <span className="block text-xs text-amber-300 font-medium">In Progress</span>
          <div className="mt-1 text-2xl font-bold text-amber-300">{stats.inProgress}</div>
        </div>
        <div className="rounded-2xl border border-white/15 bg-slate-950/75 backdrop-blur-xl p-4 shadow-lg">
          <span className="block text-xs text-emerald-300 font-medium">Completed</span>
          <div className="mt-1 text-2xl font-bold text-emerald-300">{stats.completed}</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-white/15 bg-slate-950/75 backdrop-blur-xl p-4 shadow-lg">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-300/80" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate, job, or round name..."
            className="w-full rounded-xl border border-white/15 bg-slate-900/90 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-400 focus:border-sky-400/60 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-sky-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-white/15 bg-slate-900/90 px-3 py-2.5 text-xs text-slate-100 focus:border-sky-400/60 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="NO_SHOW">No Show</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-200 gap-3">
          <Loader2 size={32} className="animate-spin text-sky-400" />
          <span className="text-sm">Loading interviews...</span>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-sm text-rose-300 flex items-start gap-3">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/15 bg-slate-950/75 backdrop-blur-xl p-12 text-center">
          <Calendar size={36} className="mx-auto text-sky-400/70 mb-3" />
          <h3 className="text-base font-medium text-white">No interviews found</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => {
            const scheduledDate = new Date(item.scheduledAt);
            const dateStr = scheduledDate.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            const timeStr = scheduledDate.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            });

            const assignedInterviewers =
              Array.isArray(item.interviewers) && item.interviewers.length > 0
                ? item.interviewers
                : item.interviewerId
                ? [{ userId: item.interviewerId, role: "PRIMARY" }]
                : [];

            const isTerminal = ["COMPLETED", "CANCELLED", "NO_SHOW"].includes(
              item.status
            );

            return (
              <div
                key={item._id}
                className="overflow-hidden rounded-2xl border border-white/15 bg-slate-950/75 backdrop-blur-xl p-5 sm:p-6 shadow-xl transition hover:border-sky-400/35"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <InterviewStatusBadge status={item.status} />
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-900/90 text-slate-100 border border-white/15">
                        {item.roundName || `Round ${item.roundNumber || 1}`}
                      </span>
                      {item.roundType && (
                        <span className="text-[11px] text-sky-200/80 font-mono">
                          [{item.roundType}]
                        </span>
                      )}
                    </div>

                    <div>
                      <h2 className="text-base font-semibold text-white">
                        {item.candidateId?.name || "Candidate"}
                      </h2>
                      <div className="text-xs text-slate-300">
                        Role:{" "}
                        <strong className="text-white">
                          {item.jobId?.title || "Job Position"}
                        </strong>{" "}
                        • {item.candidateId?.email || ""}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                      <span className="inline-flex items-center gap-1.5 text-slate-100">
                        <Calendar size={13} className="text-sky-400" />
                        {dateStr} at {timeStr} ({item.durationMinutes || 60}m)
                      </span>

                      {item.meetingUrl && (
                        <a
                          href={item.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sky-300 hover:text-sky-200 underline"
                        >
                          <Video size={13} />
                          Join Meeting Call
                          <ExternalLink size={11} />
                        </a>
                      )}

                      {item.location && (
                        <span className="inline-flex items-center gap-1 text-slate-200">
                          <MapPin size={13} />
                          {item.location}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:self-center">
                    <div className="text-xs space-y-1 min-w-[180px]">
                      <span className="text-[11px] uppercase tracking-wider text-sky-200/80 font-semibold block">
                        Assigned Panel ({assignedInterviewers.length})
                      </span>
                      {assignedInterviewers.length === 0 ? (
                        <span className="text-amber-300 text-xs">
                          No interviewers assigned
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {assignedInterviewers.map((panel, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 rounded-lg bg-slate-900/90 border border-white/15 px-2 py-0.5 text-[11px] text-slate-100"
                            >
                              <UserCheck size={11} className="text-sky-400" />
                              {panel.userId?.name || "Interviewer"}
                              <span className="text-[9px] text-sky-300 font-mono">
                                ({panel.role || "PANEL"})
                              </span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/recruiter/interviews/${item._id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-sky-300/40 bg-gradient-to-b from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 px-3 py-1.5 text-xs font-semibold text-white transition-all shadow-[0_0_16px_rgba(56,189,248,0.4)]"
                      >
                        Manage Interview
                      </Link>

                      {!isTerminal && (
                        <>
                          <button
                            type="button"
                            onClick={() => setAssignModalInterview(item)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-500/15 px-3 py-1.5 text-xs font-medium text-sky-300 hover:bg-sky-500/25 cursor-pointer"
                          >
                            <Users size={13} />
                            Assign
                          </button>

                          <button
                            type="button"
                            onClick={() => setRescheduleModalInterview(item)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/15 px-3 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-500/25 cursor-pointer"
                          >
                            <Clock size={13} />
                            Reschedule
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCancel(item)}
                            disabled={cancellingId === item._id}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/15 px-3 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/25 disabled:opacity-50 cursor-pointer"
                          >
                            <XCircle size={13} />
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {item.rescheduleReason && (
                  <div className="mt-4 pt-3 border-t border-white/10 text-xs text-amber-300/90 flex items-center gap-2">
                    <Clock size={13} className="shrink-0" />
                    <span>
                      <strong>Rescheduled:</strong> {item.rescheduleReason} (previously {new Date(item.rescheduledFrom).toLocaleString()})
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {assignModalInterview && (
        <AssignInterviewersModal
          isOpen={Boolean(assignModalInterview)}
          onClose={() => setAssignModalInterview(null)}
          interview={assignModalInterview}
          onSuccess={() => {
            fetchInterviews(true);
            setAssignModalInterview(null);
          }}
        />
      )}

      {rescheduleModalInterview && (
        <RescheduleInterviewModal
          isOpen={Boolean(rescheduleModalInterview)}
          onClose={() => setRescheduleModalInterview(null)}
          interview={rescheduleModalInterview}
          onSuccess={() => {
            fetchInterviews(true);
            setRescheduleModalInterview(null);
          }}
        />
      )}
    </div>
  );
}
