import { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Building2,
  ExternalLink,
  AlertCircle,
  Loader2,
  RefreshCw,
  Sparkles,
  Info,
  Copy,
  Check,
} from 'lucide-react';
import { getMyCandidateInterviews } from '../../api/interviewApi';
import InterviewStatusBadge from '../../components/interviews/InterviewStatusBadge';

export default function CandidateInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('UPCOMING');
  const [copiedId, setCopiedId] = useState('');

  const handleCopyLink = async (id, url) => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(''), 2000);
    } catch {
      setCopiedId('');
    }
  };

  const fetchInterviews = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError('');

      const res = await getMyCandidateInterviews();
      const rawList =
        res?.data?.items ||
        res?.data?.interviews ||
        res?.items ||
        res?.data ||
        [];
      setInterviews(Array.isArray(rawList) ? rawList : []);
    } catch (err) {
      setError(
        err?.response?.data?.message || 'Failed to load your interviews'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  const now = Date.now();
  const upcomingInterviews = interviews.filter(
    (i) =>
      ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'].includes(i.status) &&
      new Date(i.scheduledAt).getTime() + (i.durationMinutes || 60) * 60 * 1000 >= now
  );

  const pastInterviews = interviews.filter(
    (i) =>
      ['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(i.status) ||
      new Date(i.scheduledAt).getTime() + (i.durationMinutes || 60) * 60 * 1000 < now
  );

  const currentList =
    tab === 'UPCOMING'
      ? upcomingInterviews
      : tab === 'PAST'
      ? pastInterviews
      : interviews;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          My Interviews
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

      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setTab('UPCOMING')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
            tab === 'UPCOMING'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Upcoming ({upcomingInterviews.length})
        </button>
        <button
          onClick={() => setTab('PAST')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
            tab === 'PAST'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Past Rounds ({pastInterviews.length})
        </button>
        <button
          onClick={() => setTab('ALL')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
            tab === 'ALL'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          All ({interviews.length})
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 size={32} className="animate-spin text-indigo-400" />
          <span className="text-sm">Loading your interview schedule...</span>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-sm text-rose-300 flex items-start gap-3">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      ) : currentList.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-12 text-center">
          <Calendar size={36} className="mx-auto text-slate-600 mb-3" />
          <h3 className="text-base font-medium text-white">
            {tab === 'UPCOMING' ? 'No upcoming interviews' : 'No past interviews'}
          </h3>
        </div>
      ) : (
        <div className="space-y-4">
          {currentList.map((item) => {
            const scheduledDate = new Date(item.scheduledAt);
            const dateStr = scheduledDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            });
            const timeStr = scheduledDate.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            });

            const company =
              item.jobId?.organizationId?.name ||
              item.jobId?.companyName ||
              'Company';

            const canJoin =
              item.meetingUrl &&
              ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'].includes(item.status);

            return (
              <div
                key={item._id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900 p-5 sm:p-6 transition hover:border-white/20"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <InterviewStatusBadge status={item.status} />
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/10">
                        {item.roundName || `Round ${item.roundNumber || 1}`}
                      </span>
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-white">
                        {item.jobId?.title || 'Job Position'}
                      </h2>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <span className="inline-flex items-center gap-1 text-slate-300 font-medium">
                          <Building2 size={13} className="text-indigo-400" />
                          {company}
                        </span>
                        {item.jobId?.location && (
                          <span>• {item.jobId.location}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        <Calendar size={14} className="text-indigo-400" />
                        {dateStr}
                      </span>
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        <Clock size={14} className="text-amber-400" />
                        {timeStr} ({item.durationMinutes || 60} mins, {item.timezone || 'Asia/Kolkata'})
                      </span>
                      {item.location && (
                        <span className="inline-flex items-center gap-1.5 text-slate-400">
                          <MapPin size={14} />
                          {item.location}
                        </span>
                      )}
                    </div>

                    {item.instructions && (
                      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs text-slate-300 flex items-start gap-2">
                        <Info size={15} className="text-sky-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white">Preparation Instructions:</strong>{' '}
                          {item.instructions}
                        </div>
                      </div>
                    )}

                    {item.rescheduleReason && (
                      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-300 flex items-center gap-2">
                        <Clock size={14} className="shrink-0" />
                        <span>
                          <strong>Schedule updated:</strong> {item.rescheduleReason}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 lg:self-center flex flex-col sm:flex-row lg:flex-col gap-2">
                    {canJoin ? (
                      <>
                        <a
                          href={item.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-sky-500/20 transition hover:scale-[1.02]"
                        >
                          <Video size={16} />
                          Join Video Interview
                          <ExternalLink size={13} />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleCopyLink(item._id, item.meetingUrl)}
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-white/5 hover:text-white transition"
                        >
                          {copiedId === item._id ? (
                            <Check size={13} className="text-emerald-400" />
                          ) : (
                            <Copy size={13} />
                          )}
                          {copiedId === item._id ? 'Copied!' : 'Copy Meeting Link'}
                        </button>
                      </>
                    ) : item.meetingUrl ? (
                      <span className="text-xs text-slate-500 italic">
                        Call link available in details
                      </span>
                    ) : null}
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
