import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  Clock,
  Video,
  MapPin,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Phone,
  UserCheck,
} from 'lucide-react';
import {
  createInterview,
  getAvailableInterviewers,
  assignInterviewers,
} from '../../api/interviewApi';

export default function ScheduleInterviewModal({
  isOpen,
  onClose,
  application,
  job,
  onSuccess,
}) {
  const [roundNumber, setRoundNumber] = useState(1);
  const [scheduledAt, setScheduledAt] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [meetingType, setMeetingType] = useState('VIDEO');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [location, setLocation] = useState('');
  const [instructions, setInstructions] = useState('');
  const [candidateNotes, setCandidateNotes] = useState('');
  const [selectedInterviewerId, setSelectedInterviewerId] = useState('');
  const [interviewers, setInterviewers] = useState([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const jobRounds = Array.isArray(job?.interviewRounds) && job.interviewRounds.length > 0
    ? job.interviewRounds
    : [
        { order: 1, name: 'Round 1: Technical Assessment', type: 'TECHNICAL' },
        { order: 2, name: 'Round 2: System Design', type: 'SYSTEM_DESIGN' },
        { order: 3, name: 'Round 3: Behavioral / HR', type: 'BEHAVIORAL' },
      ];

  useEffect(() => {
    if (isOpen) {
      setError('');
      setScheduledAt('');
      setDurationMinutes(60);
      setMeetingType('VIDEO');
      setMeetingUrl('');
      setLocation('');
      setInstructions('');
      setCandidateNotes('');
      setSelectedInterviewerId('');

      const currentAppRound = Number(application?.currentRound) || 0;
      setRoundNumber(currentAppRound + 1);

      getAvailableInterviewers({ limit: 50 })
        .then((res) => {
          const list =
            res?.data?.users ||
            res?.users ||
            res?.data?.items ||
            res?.data ||
            [];
          if (Array.isArray(list) && list.length > 0) {
            setInterviewers(list);
            setSelectedInterviewerId(list[0]._id || '');
          }
        })
        .catch(() => {});
    }
  }, [isOpen, application]);

  if (!isOpen || !application) return null;

  const candidateName =
    application.candidateId?.name ||
    application.candidate?.name ||
    'Candidate';

  const jobTitle = job?.title || application.jobId?.title || 'Job Position';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!scheduledAt) {
      setError('Please choose a valid date and time');
      return;
    }

    const selectedTime = new Date(scheduledAt).getTime();
    if (selectedTime <= Date.now()) {
      setError('Interview must be scheduled for a future time');
      return;
    }

    if (meetingType === 'VIDEO' && !meetingUrl.trim()) {
      setError('Please provide a meeting URL (Google Meet, Zoom, etc.)');
      return;
    }

    if (meetingType === 'ONSITE' && !location.trim()) {
      setError('Please provide an interview location/office address');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const res = await createInterview({
        applicationId: application._id,
        roundNumber: Number(roundNumber),
        scheduledAt: new Date(scheduledAt).toISOString(),
        durationMinutes: Number(durationMinutes),
        timezone,
        meetingType,
        meetingUrl: meetingType === 'VIDEO' ? meetingUrl.trim() : '',
        location: meetingType === 'ONSITE' ? location.trim() : '',
        instructions: instructions.trim(),
        candidateNotes: candidateNotes.trim(),
      });

      const created =
        res?.data?.interview || res?.interview || res?.data || res;

      if (selectedInterviewerId && created?._id) {
        try {
          await assignInterviewers(created._id, [selectedInterviewerId]);
        } catch {}
      }

      onSuccess?.(created);
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to schedule interview'
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
          className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-slate-900 shadow-2xl"
        >

          <div className="flex items-start justify-between border-b border-white/10 px-6 py-5 sticky top-0 bg-slate-900 z-10">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-sky-500/10 p-2.5 text-sky-400">
                <Calendar size={22} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Schedule Interview
                </h2>
                <span className="text-xs text-slate-400">
                  {candidateName} • {jobTitle}
                </span>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Interview Round *
                </label>
                <select
                  value={roundNumber}
                  onChange={(e) => setRoundNumber(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-sky-500/50 focus:outline-none"
                >
                  {jobRounds.map((r) => (
                    <option key={r.order} value={r.order}>
                      Round {r.order}: {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Assign Interviewer
                </label>
                <select
                  value={selectedInterviewerId}
                  onChange={(e) => setSelectedInterviewerId(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-sky-500/50 focus:outline-none"
                >
                  <option value="">Assign later</option>
                  {interviewers.map((intr) => (
                    <option key={intr._id} value={intr._id}>
                      {intr.name} ({intr.title || intr.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  min={new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-sky-500/50 focus:outline-none [color-scheme:dark]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Duration
                </label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-sky-500/50 focus:outline-none"
                >
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes (Standard)</option>
                  <option value={90}>90 Minutes</option>
                  <option value={120}>120 Minutes</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Interview Mode *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'VIDEO', label: 'Video Call', icon: Video },
                  { id: 'PHONE', label: 'Phone Call', icon: Phone },
                  { id: 'ONSITE', label: 'Office Visit', icon: MapPin },
                ].map((type) => {
                  const Icon = type.icon;
                  const isSelected = meetingType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setMeetingType(type.id)}
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition ${
                        isSelected
                          ? 'border-sky-500 bg-sky-500/10 text-sky-300'
                          : 'border-white/10 bg-white/[0.02] text-slate-400 hover:bg-white/[0.05]'
                      }`}
                    >
                      <Icon size={14} />
                      <span>{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {meetingType === 'VIDEO' ? (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Meeting Link (Google Meet / Zoom) *
                </label>
                <input
                  type="url"
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  placeholder="https://meet.google.com/abc-defg-hij"
                  required
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-sky-500/50 focus:outline-none"
                />
              </div>
            ) : meetingType === 'ONSITE' ? (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Office Address / Room *
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Room 302, 3rd Floor, Bengaluru Office"
                  required
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-sky-500/50 focus:outline-none"
                />
              </div>
            ) : null}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Candidate Instructions
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={2}
                placeholder="e.g. Join 5 mins early with laptop and working mic..."
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2 text-xs text-white placeholder:text-slate-600 focus:border-sky-500/50 focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Notes for Interviewer
              </label>
              <textarea
                value={candidateNotes}
                onChange={(e) => setCandidateNotes(e.target.value)}
                rows={2}
                placeholder="e.g. Check React hooks, REST APIs, and MongoDB queries..."
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2 text-xs text-white placeholder:text-slate-600 focus:border-sky-500/50 focus:outline-none resize-none"
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
                className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-5 py-2 text-xs font-semibold text-white hover:bg-sky-500 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    Confirm Schedule
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
