import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  Clock,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { rescheduleInterview } from '../../api/interviewApi';

export default function RescheduleInterviewModal({
  isOpen,
  onClose,
  interview,
  onSuccess,
}) {
  const [scheduledAt, setScheduledAt] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(
    interview?.durationMinutes || 60
  );
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !interview) return null;

  const currentFormatted = interview.scheduledAt
    ? new Date(interview.scheduledAt).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '—';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!scheduledAt) {
      setError('Please choose a new date and time');
      return;
    }
    if (!reason.trim()) {
      setError('Please provide a reason for rescheduling');
      return;
    }

    const selectedTime = new Date(scheduledAt).getTime();
    if (selectedTime <= Date.now()) {
      setError('Interview must be rescheduled for a future date/time');
      return;
    }

    try {
      setSaving(true);
      setError('');
      const res = await rescheduleInterview(interview._id, {
        scheduledAt: new Date(scheduledAt).toISOString(),
        durationMinutes: Number(durationMinutes),
        reason: reason.trim(),
        timezone: interview.timezone || 'Asia/Kolkata',
      });
      const updated = res?.data || res;
      onSuccess?.(updated);
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to reschedule interview'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget && !saving) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl"
        >

          <div className="flex items-start justify-between border-b border-white/10 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-400">
                <RefreshCw size={22} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Reschedule Interview
                </h2>
                <p className="text-xs text-slate-400">
                  {interview.roundName || 'Round'} • Current: {currentFormatted}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={saving}
              className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-300 flex items-start gap-2.5">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs text-slate-400">
              Current slot: <strong className="text-slate-200">{currentFormatted}</strong> ({interview.durationMinutes || 60} mins)
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                New Date & Time *
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                min={new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16)}
                required
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-indigo-500/50 focus:outline-none [color-scheme:dark]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Duration
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-indigo-500/50 focus:outline-none"
              >
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes (Standard)</option>
                <option value={90}>90 Minutes</option>
                <option value={120}>120 Minutes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Reason for Rescheduling *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                required
                placeholder="e.g. Candidate requested reschedule due to conflict or interviewer unavailable..."
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="rounded-lg border border-white/10 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-2 text-xs font-semibold text-white hover:bg-amber-500 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Rescheduling...
                  </>
                ) : (
                  <>
                    <RefreshCw size={14} />
                    Confirm Reschedule
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
