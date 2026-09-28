import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Users,
  Check,
  Loader2,
  AlertCircle,
  Search,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import {
  assignInterviewers,
  getAvailableInterviewers,
} from '../../api/interviewApi';

export default function AssignInterviewersModal({
  isOpen,
  onClose,
  interview,
  onSuccess,
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [interviewersList, setInterviewersList] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    if (!isOpen || !interview) return;

    const currentIds =
      Array.isArray(interview.interviewers) && interview.interviewers.length > 0
        ? interview.interviewers.map((i) => i.userId?._id || i.userId || i)
        : interview.interviewerId?._id
        ? [interview.interviewerId._id]
        : interview.interviewerId
        ? [interview.interviewerId]
        : [];

    setSelectedIds(currentIds);
    setError('');
    setSearch('');
    loadInterviewers();
  }, [isOpen, interview]);

  const loadInterviewers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getAvailableInterviewers();
      const rawList =
        response?.data?.users ||
        response?.data?.items ||
        response?.users ||
        response?.items ||
        response?.data ||
        [];
      setInterviewersList(Array.isArray(rawList) ? rawList : []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Failed to load organization interviewers'
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      return [...prev, id];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedIds.length === 0) {
      setError('Please select at least one interviewer');
      return;
    }

    try {
      setSaving(true);
      setError('');
      const res = await assignInterviewers(interview._id, selectedIds);
      const updated = res?.data || res;
      onSuccess?.(updated);
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to assign interviewers'
      );
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !interview) return null;

  const filtered = interviewersList.filter((user) => {
    const term = search.toLowerCase();
    const name = (user.name || `${user.firstName || ''} ${user.lastName || ''}`).toLowerCase();
    const email = (user.email || '').toLowerCase();
    const title = (user.title || user.role || '').toLowerCase();
    return name.includes(term) || email.includes(term) || title.includes(term);
  });

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
          className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl"
        >

          <div className="flex items-start justify-between border-b border-white/10 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-400">
                <Users size={22} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Assign Interviewers
                </h2>
                <p className="text-xs text-slate-400">
                  {interview.roundName || 'Interview'} • {interview.candidateId?.name || 'Candidate'}
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

            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search interviewers by name or email..."
                className="w-full rounded-xl border border-white/10 bg-slate-950 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:outline-none"
              />
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Loader2 size={24} className="animate-spin text-indigo-400" />
                  <span className="text-xs">Loading organization interviewers...</span>
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-500">
                  No interviewers found.
                </div>
              ) : (
                filtered.map((user) => {
                  const isSelected = selectedIds.includes(user._id);
                  const selectedIndex = selectedIds.indexOf(user._id);
                  const isPrimary = selectedIndex === 0;

                  return (
                    <div
                      key={user._id}
                      onClick={() => toggleSelect(user._id)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                        isSelected
                          ? 'border-indigo-500/40 bg-indigo-500/5'
                          : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-300 border border-white/10">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            user.name?.charAt(0)?.toUpperCase() || 'U'
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white">
                              {user.name}
                            </span>
                            {isSelected && (
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                  isPrimary
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                }`}
                              >
                                {isPrimary ? 'PRIMARY' : 'PANEL'}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </div>

                      <div
                        className={`h-5 w-5 rounded-md border flex items-center justify-center transition ${
                          isSelected
                            ? 'bg-indigo-500 border-indigo-500 text-white'
                            : 'border-white/20 bg-white/5'
                        }`}
                      >
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-[11px] text-slate-400 flex items-center gap-2">
              <ShieldCheck size={16} className="text-indigo-400 shrink-0" />
              <span>
                First selected interviewer acts as <strong>PRIMARY</strong> lead; additional interviewers join as <strong>PANEL</strong>.
              </span>
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
                disabled={saving || selectedIds.length === 0}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <UserCheck size={14} />
                    Confirm Assignment ({selectedIds.length})
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
