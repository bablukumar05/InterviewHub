import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Gift,
  Building2,
  CalendarDays,
  CheckCircle2,
  DollarSign,
  FileCheck2,
  FileText,
  Loader2,
  MapPin,
  XCircle,
  ExternalLink,
  Inbox,
  AlertCircle,
} from 'lucide-react';
import { getMyApplications, respondToOffer } from '../../api/applicationApi';

const formatDate = (val) => {
  if (!val) return 'N/A';
  return new Date(val).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const Offers = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchOffers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getMyApplications({ limit: 100 });
      const allApps = res?.data?.applications || [];

      const offerApps = allApps.filter((a) =>
        ['OFFER_SENT', 'OFFER', 'OFFER_ACCEPTED', 'HIRED', 'OFFER_REJECTED'].includes(a.status) ||
        Boolean(a.offerDetails?.position)
      );
      setApplications(offerApps);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load offers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleResponse = async (appId, accept) => {
    try {
      setActionLoadingId(appId);
      await respondToOffer(appId, {
        accept,
        note: accept ? 'Accepted via offers portal' : 'Declined via offers portal',
      });
      setSuccessMessage(
        accept
          ? 'Congratulations! You have accepted the offer! Welcome to your new role!'
          : 'Offer declined.'
      );
      await fetchOffers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record response.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
        Job Offers
      </h1>

      {successMessage && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-400" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-xs text-emerald-400 hover:text-white">
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-sm text-slate-400">Loading your offers...</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center space-y-3">
          <AlertCircle className="mx-auto h-8 w-8 text-red-400" />
          <p className="text-sm text-red-300">{error}</p>
          <button
            onClick={fetchOffers}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500"
          >
            Try Again
          </button>
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-slate-900/30 p-12 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-slate-400">
            <Gift size={28} />
          </div>
          <h3 className="text-lg font-semibold text-white">No active job offers yet</h3>
          <Link
            to="/candidate/applications"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition"
          >
            View Active Applications
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const job = app.jobId || {};
            const org = job.organizationId || {};
            const offer = app.offerDetails || {};
            const isPending = app.status === 'OFFER_SENT' || app.status === 'OFFER';
            const isHired = app.status === 'HIRED' || app.status === 'OFFER_ACCEPTED';
            const isDeclined = app.status === 'OFFER_REJECTED';

            return (
              <div
                key={app._id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-6 space-y-5 transition hover:border-white/20"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-slate-950 text-emerald-400 font-bold">
                      <Gift size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {offer.position || job.title}
                      </h3>
                      <p className="text-sm text-slate-300">
                        {org.name || 'Company'} &bull;{' '}
                        <span className="text-slate-400">{job.location || 'Remote'}</span>
                      </p>
                    </div>
                  </div>

                  <div>
                    {isPending && (
                      <span className="inline-flex items-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                        Waiting for Response
                      </span>
                    )}
                    {isHired && (
                      <span className="inline-flex items-center rounded-lg border border-emerald-500/40 bg-emerald-600/20 px-3 py-1 text-xs font-bold text-emerald-300">
                        Accepted & Hired 🎉
                      </span>
                    )}
                    {isDeclined && (
                      <span className="inline-flex items-center rounded-lg border border-slate-500/30 bg-slate-500/10 px-3 py-1 text-xs font-semibold text-slate-400">
                        Declined
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 pt-2">
                  <div className="rounded-xl border border-white/5 bg-slate-950/40 p-3.5">
                    <p className="text-xs text-slate-400">Annual CTC</p>
                    <p className="mt-1 text-base font-bold text-white">
                      ₹{offer.salaryPackage ? Number(offer.salaryPackage).toLocaleString('en-IN') : 'Undisclosed'} / yr
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-slate-950/40 p-3.5">
                    <p className="text-xs text-slate-400">Joining Date</p>
                    <p className="mt-1 text-base font-bold text-white">
                      {formatDate(offer.joiningDate)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-slate-950/40 p-3.5">
                    <p className="text-xs text-slate-400">Offer Date</p>
                    <p className="mt-1 text-base font-bold text-white">
                      {formatDate(offer.sentAt || app.updatedAt)}
                    </p>
                  </div>
                </div>

                {offer.benefits && (
                  <div className="rounded-xl border border-white/5 bg-slate-950/30 p-3.5 text-xs text-slate-300">
                    <strong className="text-white">Benefits & Perks:</strong> {offer.benefits}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    {offer.offerLetterUrl && (
                      <a
                        href={offer.offerLetterUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                      >
                        <FileText size={14} />
                        View Official Offer Document
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>

                  {isPending && (
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={actionLoadingId === app._id}
                        onClick={() => handleResponse(app._id, true)}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 disabled:opacity-50 transition"
                      >
                        {actionLoadingId === app._id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={14} />
                        )}
                        Accept Offer
                      </button>

                      <button
                        type="button"
                        disabled={actionLoadingId === app._id}
                        onClick={() => {
                          if (confirm('Are you sure you want to decline this job offer?')) {
                            handleResponse(app._id, false);
                          }
                        }}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 disabled:opacity-50 transition"
                      >
                        <XCircle size={14} />
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Offers;
