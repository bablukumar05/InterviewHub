import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  FileText,
  Filter,
  Gift,
  Inbox,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldAlert,
  Sparkles,
  UserCheck,
  UserRound,
  Users,
  X,
  XCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { getMyJobs } from '../../api/jobApi';
import {
  getJobApplications,
  updateApplicationStatus,
  generateOffer,
} from '../../api/applicationApi';
import ScheduleInterviewModal from '../../components/interviews/ScheduleInterviewModal';

const STATUS_CONFIGS = {
  APPLIED: {
    label: 'Applied',
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    nextOptions: ['SCREENING', 'SHORTLISTED', 'REJECTED'],
  },
  SCREENING: {
    label: 'Screening',
    badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    nextOptions: ['SHORTLISTED', 'UNDER_REVIEW', 'REJECTED'],
  },
  SHORTLISTED: {
    label: 'Shortlisted',
    badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    nextOptions: ['INTERVIEW_SCHEDULED', 'SELECTED', 'UNDER_REVIEW', 'REJECTED'],
  },
  INTERVIEW_SCHEDULED: {
    label: 'Interview Scheduled',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    nextOptions: ['INTERVIEW_COMPLETED', 'REJECTED'],
  },
  INTERVIEW: {
    label: 'Interviewing',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    nextOptions: ['INTERVIEW_COMPLETED', 'SELECTED', 'REJECTED'],
  },
  INTERVIEW_COMPLETED: {
    label: 'Interview Completed',
    badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    nextOptions: ['UNDER_REVIEW', 'SELECTED', 'SHORTLISTED', 'REJECTED'],
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    nextOptions: ['SELECTED', 'SHORTLISTED', 'REJECTED'],
  },
  SELECTED: {
    label: 'Selected for Offer',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    nextOptions: ['OFFER_SENT', 'REJECTED'],
  },
  OFFER_SENT: {
    label: 'Offer Sent',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    nextOptions: ['HIRED', 'REJECTED'],
  },
  OFFER: {
    label: 'Offer Sent',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    nextOptions: ['HIRED', 'REJECTED'],
  },
  OFFER_ACCEPTED: {
    label: 'Offer Accepted',
    badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    nextOptions: ['HIRED', 'REJECTED'],
  },
  HIRED: {
    label: 'Hired 🎉',
    badge: 'bg-emerald-600/30 text-emerald-300 border-emerald-500/40',
    nextOptions: [],
  },
  OFFER_REJECTED: {
    label: 'Offer Declined',
    badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    nextOptions: [],
  },
  REJECTED: {
    label: 'Rejected',
    badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    nextOptions: [],
  },
};

const formatDate = (val) => {
  if (!val) return 'N/A';
  return new Date(val).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const Applications = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlJobId = searchParams.get('jobId') || '';

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(urlJobId);
  const [applications, setApplications] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApps, setLoadingApps] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [rejectModalApp, setRejectModalApp] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [offerModalApp, setOfferModalApp] = useState(null);
  const [offerFormData, setOfferFormData] = useState({
    position: '',
    salaryPackage: '',
    joiningDate: '',
    benefits: '',
    offerLetterUrl: '',
  });
  const [scheduleModalApp, setScheduleModalApp] = useState(null);
  const [statusModalApp, setStatusModalApp] = useState(null);
  const [nextTargetStatus, setNextTargetStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');
  const [successToast, setSuccessToast] = useState('');
  const [expandedDetails, setExpandedDetails] = useState({});

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoadingJobs(true);
        const res = await getMyJobs({ limit: 100 });
        const jobList = res?.data?.jobs || res?.data || [];
        setJobs(jobList);

        if (!urlJobId && jobList.length > 0) {
          setSelectedJobId(jobList[0]._id);
        }
      } catch (err) {
        setError('Failed to load recruiter jobs.');
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchJobs();
  }, [urlJobId]);

  const fetchApplicationsForJob = async (jobId) => {
    if (!jobId) {
      setApplications([]);
      return;
    }
    try {
      setLoadingApps(true);
      setError('');
      const res = await getJobApplications(jobId, { limit: 100 });
      setApplications(res?.data?.applications || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch applicants for this job.');
      setApplications([]);
    } finally {
      setLoadingApps(false);
    }
  };

  useEffect(() => {
    if (selectedJobId) {
      fetchApplicationsForJob(selectedJobId);
      setSearchParams({ jobId: selectedJobId });
    }
  }, [selectedJobId]);

  const handleUpdateStatus = async (appId, newStatus, note = '') => {
    try {
      setActionSubmitting(true);
      setActionError('');
      await updateApplicationStatus(appId, {
        status: newStatus,
        note,
      });
      setSuccessToast(`Application moved to ${STATUS_CONFIGS[newStatus]?.label || newStatus}`);
      setStatusModalApp(null);
      await fetchApplicationsForJob(selectedJobId);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Status transition failed.');
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim() || !rejectModalApp) return;

    try {
      setActionSubmitting(true);
      setActionError('');
      await updateApplicationStatus(rejectModalApp._id, {
        status: 'REJECTED',
        rejectionReason: rejectionReason.trim(),
        note: `Candidate rejected: ${rejectionReason.trim()}`,
      });
      setSuccessToast('Application rejected with feedback logged.');
      setRejectModalApp(null);
      setRejectionReason('');
      await fetchApplicationsForJob(selectedJobId);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to reject application.');
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    if (!offerModalApp) return;

    try {
      setActionSubmitting(true);
      setActionError('');
      await generateOffer(offerModalApp._id, {
        position: offerFormData.position.trim(),
        salaryPackage: Number(offerFormData.salaryPackage),
        joiningDate: new Date(offerFormData.joiningDate).toISOString(),
        benefits: offerFormData.benefits.trim(),
        offerLetterUrl: offerFormData.offerLetterUrl.trim(),
      });
      setSuccessToast('Formal offer extended to candidate successfully!');
      setOfferModalApp(null);
      await fetchApplicationsForJob(selectedJobId);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to generate offer.');
    } finally {
      setActionSubmitting(false);
    }
  };

  const filteredApplicants = useMemo(() => {
    return applications.filter((app) => {
      const candidate = app.candidateId || {};
      const candidateProfile = app.candidateProfile || {};
      const name = candidate.name?.toLowerCase() || '';
      const email = candidate.email?.toLowerCase() || '';
      const headline = candidateProfile.headline?.toLowerCase() || '';
      const skills = (app.skills || []).join(' ').toLowerCase();

      const matchesSearch =
        name.includes(search.toLowerCase()) ||
        email.includes(search.toLowerCase()) ||
        headline.includes(search.toLowerCase()) ||
        skills.includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === 'ALL') return true;
      if (statusFilter === 'ACTIVE') {
        return ['APPLIED', 'SCREENING', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW', 'UNDER_REVIEW'].includes(
          app.status
        );
      }
      if (statusFilter === 'OFFERS') {
        return ['SELECTED', 'OFFER_SENT', 'OFFER', 'OFFER_ACCEPTED', 'HIRED'].includes(app.status);
      }
      if (statusFilter === 'REJECTED') {
        return ['REJECTED', 'OFFER_REJECTED'].includes(app.status);
      }
      return app.status === statusFilter;
    });
  }, [applications, search, statusFilter]);

  const currentJob = jobs.find((j) => j._id === selectedJobId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Applications
        </h1>

        <div className="flex items-center gap-2">
          <BriefcaseBusiness size={18} className="text-indigo-400 shrink-0" />
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            disabled={loadingJobs}
            className="rounded-xl border border-white/10 bg-slate-900 py-2.5 px-3.5 text-sm font-semibold text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {jobs.length === 0 ? (
              <option value="">No jobs created yet</option>
            ) : (
              jobs.map((j) => (
                <option key={j._id} value={j._id}>
                  {j.title} ({j.status})
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {successToast && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast('')} className="text-xs text-emerald-400 hover:text-white">
            Dismiss
          </button>
        </div>
      )}

      {currentJob && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
            <p className="text-xs text-slate-400">Total Applicants</p>
            <p className="mt-2 text-2xl font-bold text-white">{applications.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
            <p className="text-xs text-slate-400">In Screening & Interviews</p>
            <p className="mt-2 text-2xl font-bold text-indigo-400">
              {
                applications.filter((a) =>
                  ['APPLIED', 'SCREENING', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW'].includes(a.status)
                ).length
              }
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
            <p className="text-xs text-slate-400">Selected / Offers</p>
            <p className="mt-2 text-2xl font-bold text-emerald-400">
              {
                applications.filter((a) =>
                  ['SELECTED', 'OFFER_SENT', 'OFFER', 'OFFER_ACCEPTED'].includes(a.status)
                ).length
              }
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
            <p className="text-xs text-slate-400">Openings Available</p>
            <p className="mt-2 text-2xl font-bold text-amber-400">{currentJob.openings || 1}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search candidates by name, email, or skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-900/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/60 p-1">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'ACTIVE', label: 'In Progress' },
            { id: 'OFFERS', label: 'Offers & Hired' },
            { id: 'REJECTED', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition ${
                statusFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loadingApps ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-sm text-slate-400">Loading applicants...</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center space-y-3">
          <AlertCircle className="mx-auto h-8 w-8 text-red-400" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      ) : filteredApplicants.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-slate-900/30 p-12 text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-slate-400">
            <Users size={28} />
          </div>
          <h3 className="text-lg font-semibold text-white">No applicants found</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplicants.map((app) => {
            const candidate = app.candidateId || {};
            const profile = app.candidateProfile || {};
            const statusConfig = STATUS_CONFIGS[app.status] || {
              label: app.status,
              badge: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
              nextOptions: [],
            };
            const isTerminal = ['HIRED', 'OFFER_REJECTED', 'REJECTED'].includes(app.status);
            const isExpanded = Boolean(expandedDetails?.[app._id]);

            return (
              <div
                key={app._id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-5 sm:p-6 transition hover:border-white/20"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold text-lg">
                      {candidate.name?.charAt(0)?.toUpperCase() || 'C'}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="text-lg font-bold text-white">{candidate.name}</h3>
                        <span
                          className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold ${statusConfig.badge}`}
                        >
                          {statusConfig.label}
                        </span>
                        {profile.profileCompletion && (
                          <span className="text-xs text-emerald-400 font-mono">
                            {profile.profileCompletion}% Profile
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 font-medium">
                        {profile.headline || candidate.title || 'Applicant'}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 pt-1">
                        <span className="inline-flex items-center gap-1.5">
                          <Mail size={13} className="text-slate-500" />
                          {candidate.email}
                        </span>
                        {candidate.phone && (
                          <span className="inline-flex items-center gap-1.5">
                            <Phone size={13} className="text-slate-500" />
                            {candidate.phone}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays size={13} className="text-slate-500" />
                          Applied {formatDate(app.appliedAt || app.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {app.resumeUrl && (
                      <a
                        href={app.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-indigo-400 hover:bg-indigo-500/10 transition"
                      >
                        <FileText size={13} />
                        Resume
                        <ExternalLink size={12} />
                      </a>
                    )}

                    {[
                      'INTERVIEW_SCHEDULED',
                      'INTERVIEW',
                      'INTERVIEW_COMPLETED',
                      'UNDER_REVIEW',
                      'SELECTED',
                      'OFFER_SENT',
                      'OFFER',
                      'OFFER_ACCEPTED',
                      'HIRED',
                    ].includes(app.status) && (
                      <Link
                        to="/recruiter/interviews"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-sky-500/20 bg-sky-500/10 px-3.5 py-2 text-xs font-semibold text-sky-300 hover:bg-sky-500/20 transition"
                      >
                        <CalendarDays size={13} />
                        Interviews
                      </Link>
                    )}

                    {!isTerminal && (
                      <div className="flex items-center gap-1.5">
                        {statusConfig.nextOptions.map((opt) => {
                          if (opt === 'REJECTED') return null;
                          if (opt === 'OFFER_SENT' || opt === 'OFFER') {
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => {
                                  setOfferModalApp(app);
                                  setOfferFormData({
                                    position: currentJob?.title || '',
                                    salaryPackage:
                                      currentJob?.salary?.max || currentJob?.salary?.min || 1200000,
                                    joiningDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
                                      .toISOString()
                                      .split('T')[0],
                                    benefits:
                                      'Health insurance, MacBook, Flexible leaves',
                                    offerLetterUrl: '',
                                  });
                                }}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500 transition"
                              >
                                <Gift size={13} />
                                Send Offer
                              </button>
                            );
                          }

                          if (opt === 'INTERVIEW' || opt === 'INTERVIEW_SCHEDULED') {
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => setScheduleModalApp(app)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-sky-600/20 hover:bg-sky-500 transition"
                              >
                                <CalendarDays size={13} />
                                Schedule Interview
                              </button>
                            );
                          }

                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setStatusModalApp(app);
                                setNextTargetStatus(opt);
                                setStatusNote('');
                              }}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-indigo-600/20 px-3.5 py-2 text-xs font-semibold text-indigo-300 hover:bg-indigo-600 hover:text-white transition"
                            >
                              Move to {STATUS_CONFIGS[opt]?.label || opt}
                            </button>
                          );
                        })}

                        <button
                          type="button"
                          onClick={() => {
                            setRejectModalApp(app);
                            setRejectionReason('');
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2 text-xs font-semibold text-red-400 hover:bg-red-500 hover:text-white transition"
                        >
                          <XCircle size={13} />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {app.skills?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {app.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg border border-white/5 bg-slate-950/60 px-2.5 py-1 text-xs text-slate-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedDetails((prev) => ({
                        ...(prev || {}),
                        [app._id]: !prev?.[app._id],
                      }))
                    }
                    className="flex items-center gap-1.5 font-medium hover:text-white transition"
                  >
                    <Sparkles size={12} className="text-indigo-400" />
                    <span>{isExpanded ? 'Hide Application Details' : 'View Cover Letter & History'}</span>
                    {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>

                  {app.offerDetails?.salaryPackage > 0 && (
                    <span className="text-emerald-400 font-semibold">
                      Offer Sent: ₹{Number(app.offerDetails.salaryPackage).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                {isExpanded && (
                  <div className="mt-3 space-y-4 rounded-xl border border-white/5 bg-slate-950/40 p-4 text-xs text-slate-300">
                    {app.coverLetter ? (
                      <div>
                        <p className="font-semibold text-white mb-1">Submitted Cover Letter:</p>
                        <p className="whitespace-pre-line leading-relaxed text-slate-300">
                          {app.coverLetter}
                        </p>
                      </div>
                    ) : (
                      <p className="italic text-slate-500">No cover letter submitted.</p>
                    )}

                    {app.stageHistory?.length > 0 && (
                      <div className="pt-2 border-t border-white/5">
                        <p className="font-semibold text-white mb-2">Stage Timeline & Notes:</p>
                        <div className="space-y-1.5">
                          {app.stageHistory.map((hist, hIdx) => (
                            <div key={hIdx} className="flex items-start gap-2 text-slate-400">
                              <span className="text-indigo-400 font-mono">
                                {formatDate(hist.changedAt || hist.timestamp)}:
                              </span>
                              <span className="font-semibold text-slate-200">[{hist.stage}]</span>
                              <span>{hist.note || 'Status updated'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {rejectModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <XCircle className="text-rose-400" size={20} />
                Reject Application
              </h3>
              <button
                onClick={() => setRejectModalApp(null)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {actionError && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
                {actionError}
              </div>
            )}

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Rejection Reason (Required)
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Needs more hands-on experience with Node.js and MongoDB..."
                  className="w-full rounded-xl border border-white/10 bg-slate-950/60 p-3 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalApp(null)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white hover:bg-rose-500 disabled:opacity-50"
                >
                  {actionSubmitting && <Loader2 size={13} className="animate-spin" />}
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {offerModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Gift className="text-emerald-400" size={20} />
                Send Job Offer
              </h3>
              <button
                onClick={() => setOfferModalApp(null)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {actionError && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
                {actionError}
              </div>
            )}

            <form onSubmit={handleOfferSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Position Title</label>
                <input
                  type="text"
                  required
                  value={offerFormData.position}
                  onChange={(e) => setOfferFormData({ ...offerFormData, position: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/60 p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Annual CTC (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={offerFormData.salaryPackage}
                    onChange={(e) =>
                      setOfferFormData({ ...offerFormData, salaryPackage: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-950/60 p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Joining Date</label>
                  <input
                    type="date"
                    required
                    value={offerFormData.joiningDate}
                    onChange={(e) =>
                      setOfferFormData({ ...offerFormData, joiningDate: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-950/60 p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Benefits & Perks</label>
                <textarea
                  rows={2}
                  value={offerFormData.benefits}
                  onChange={(e) => setOfferFormData({ ...offerFormData, benefits: e.target.value })}
                  placeholder="Health insurance, MacBook, Flexible leaves..."
                  className="w-full rounded-xl border border-white/10 bg-slate-950/60 p-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOfferModalApp(null)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50"
                >
                  {actionSubmitting && <Loader2 size={13} className="animate-spin" />}
                  Send Job Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {statusModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white">
                Update Status: {STATUS_CONFIGS[nextTargetStatus]?.label || nextTargetStatus}
              </h3>
              <button
                onClick={() => setStatusModalApp(null)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {actionError && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
                {actionError}
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Add a Note (Optional)
              </label>
              <textarea
                rows={2}
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="e.g. Cleared round 1, moving to next stage..."
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 p-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStatusModalApp(null)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionSubmitting}
                onClick={() => handleUpdateStatus(statusModalApp._id, nextTargetStatus, statusNote)}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                {actionSubmitting && <Loader2 size={13} className="animate-spin" />}
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {scheduleModalApp && (
        <ScheduleInterviewModal
          isOpen={Boolean(scheduleModalApp)}
          onClose={() => setScheduleModalApp(null)}
          application={scheduleModalApp}
          job={currentJob}
          onSuccess={() => {
            setSuccessToast('Interview scheduled successfully!');
            fetchApplicationsForJob(selectedJobId);
            setScheduleModalApp(null);
          }}
        />
      )}
    </div>
  );
};

export default Applications;
