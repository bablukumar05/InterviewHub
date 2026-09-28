import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Video,
  FileText,
  User,
  ExternalLink,
  CheckCircle2,
  PlayCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Search,
  Filter,
  UserX,
  Sparkles,
  ClipboardCheck,
} from 'lucide-react';
import {
  getMyInterviewerInterviews,
  updateInterviewStatus,
} from '../../api/interviewApi';
import InterviewStatusBadge from '../../components/interviews/InterviewStatusBadge';

export default function InterviewerInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchInterviews = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError('');

      const params = {};
      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }

      const res = await getMyInterviewerInterviews(params);
      const rawList =
        res?.data?.items ||
        res?.data?.interviews ||
        res?.items ||
        res?.data ||
        [];
      setInterviews(Array.isArray(rawList) ? rawList : []);
    } catch (err) {
      setError(
        err?.response?.data?.message || 'Failed to load assigned interviews'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  const handleStatusChange = async (interviewId, nextStatus, promptForNote = false) => {
    let note = '';
    if (promptForNote) {
      const input = window.prompt(
        nextStatus === 'COMPLETED'
          ? 'Enter completion summary / feedback notes:'
          : 'Enter notes:'
      );
      if (input === null) return;
      note = input;
    }

    try {
      setActionLoadingId(interviewId);
      await updateInterviewStatus(interviewId, {
        status: nextStatus,
        note,
      });
      await fetchInterviews(true);
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to update interview status'
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const filtered = interviews.filter((item) => {
    const term = search.toLowerCase();
    const candidateName = (item.candidateId?.name || '').toLowerCase();
    const jobTitle = (item.jobId?.title || '').toLowerCase();
    const roundName = (item.roundName || '').toLowerCase();
    return (
      candidateName.includes(term) ||
      jobTitle.includes(term) ||
      roundName.includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Assigned Interviews
        </h1>

        <button
          onClick={() => fetchInterviews(true)}
          disabled={refreshing || loading}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-white/10 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900 p-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate name, job title, or round..."
            className="w-full rounded-xl border border-white/10 bg-slate-950 pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-slate-300 focus:border-indigo-500/50 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="NO_SHOW">No Show</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 size={32} className="animate-spin text-indigo-400" />
          <span className="text-sm">Loading your interview agenda...</span>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-sm text-rose-300 flex items-start gap-3">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-12 text-center">
          <Calendar size={36} className="mx-auto text-slate-600 mb-3" />
          <h3 className="text-base font-medium text-white">No assigned interviews</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => {
            const scheduledDate = new Date(item.scheduledAt);
            const dateStr = scheduledDate.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const timeStr = scheduledDate.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            });

            const candidateProfile = item.candidateProfileId || {};
            const resumeUrl =
              candidateProfile.resumeUrl || item.applicationId?.resumeUrl || '';

            const isActionLoading = actionLoadingId === item._id;

            return (
              <div
                key={item._id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900 p-5 sm:p-6 transition hover:border-white/20"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <InterviewStatusBadge status={item.status} />
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/10">
                        {item.roundName || `Round ${item.roundNumber || 1}`}
                      </span>
                      {item.roundType && (
                        <span className="text-[11px] text-slate-400 font-mono">
                          [{item.roundType}]
                        </span>
                      )}
                    </div>

                    <div>
                      <h2 className="text-lg font-semibold text-white">
                        {item.candidateId?.name || 'Candidate'}
                      </h2>
                      <p className="text-xs text-slate-400">
                        Position:{' '}
                        <strong className="text-slate-200">
                          {item.jobId?.title || 'Job Position'}
                        </strong>{' '}
                        • {item.candidateId?.email || ''}
                      </p>
                      {candidateProfile.headline && (
                        <p className="text-xs text-slate-400 mt-1 italic">
                          "{candidateProfile.headline}"
                        </p>
                      )}
                    </div>

                    {candidateProfile.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {candidateProfile.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="rounded-md border border-white/5 bg-slate-950 px-2 py-0.5 text-[11px] text-slate-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                      <span className="inline-flex items-center gap-1.5 text-slate-200 font-medium">
                        <Calendar size={13} className="text-indigo-400" />
                        {dateStr} at {timeStr} ({item.durationMinutes || 60}m)
                      </span>

                      {item.meetingUrl && (
                        <a
                          href={item.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 px-3 py-1 text-xs font-semibold text-sky-300 hover:bg-sky-500/20"
                        >
                          <Video size={13} />
                          Join Call
                          <ExternalLink size={11} />
                        </a>
                      )}

                      {resumeUrl && (
                        <a
                          href={resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-slate-400 hover:text-white underline"
                        >
                          <FileText size={13} />
                          View Candidate Resume
                          <ExternalLink size={11} />
                        </a>
                      )}
                    </div>

                    {item.instructions && (
                      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs text-slate-400">
                        <span className="font-semibold text-slate-300">Instructions:</span>{' '}
                        {item.instructions}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap sm:flex-col items-stretch gap-2 shrink-0 sm:min-w-[180px]">
                    <Link
                      to={`/interviewer/interviews/${item._id}/evaluation`}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-sky-400"
                    >
                      <ClipboardCheck size={13} />
                      Evaluate Candidate
                    </Link>

                    <Link
                      to={`/interviewer/interviews/${item._id}`}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-slate-950 px-4 py-2 text-xs font-medium text-slate-200 transition hover:border-white/20 hover:text-white"
                    >
                      <FileText size={13} />
                      Interview Details
                    </Link>

                    {item.status === 'SCHEDULED' && (
                      <button
                        onClick={() => handleStatusChange(item._id, 'CONFIRMED')}
                        disabled={isActionLoading}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                      >
                        <CheckCircle2 size={13} />
                        Confirm Attendance
                      </button>
                    )}

                    {item.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleStatusChange(item._id, 'IN_PROGRESS')}
                        disabled={isActionLoading}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-500 disabled:opacity-50"
                      >
                        <PlayCircle size={13} />
                        Start Interview
                      </button>
                    )}

                    {item.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => handleStatusChange(item._id, 'COMPLETED', true)}
                        disabled={isActionLoading}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                      >
                        <CheckCircle2 size={13} />
                        Complete Interview
                      </button>
                    )}

                    {['SCHEDULED', 'CONFIRMED'].includes(item.status) && (
                      <button
                        onClick={() => handleStatusChange(item._id, 'NO_SHOW')}
                        disabled={isActionLoading}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:bg-white/10 hover:text-slate-200 disabled:opacity-50"
                      >
                        <UserX size={12} />
                        Mark No-Show
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
