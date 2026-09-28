import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BriefcaseBusiness,
  ClipboardList,
  CalendarDays,
  FileText,
  UserRound,
  Search,
  Video,
  Clock,
  ExternalLink,
  Gift,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatCard from "../../components/dashboard/StatCard";
import ApplicationStatusChart from "../../components/dashboard/ApplicationStatusChart";
import ApplicationsByMonthChart from "../../components/dashboard/ApplicationsByMonthChart";
import HiringFunnelChart from "../../components/dashboard/HiringFunnelChart";

import { getCandidateAnalytics } from "../../api/analyticsApi";
import { getMyCandidateInterviews } from "../../api/interviewApi";
import {
  getMyApplications,
  getMyCandidateProfile,
} from "../../api/applicationApi";

const CandidateDashboard = () => {
  const [stats, setStats] = useState({
    totalApplications: 0,
    shortlistedApplications: 0,
    scheduledInterviews: 0,
    completedInterviews: 0,
    offersReceived: 0,
  });

  const [charts, setCharts] = useState({
    applicationStatus: [],
    applicationsByMonth: [],
    hiringFunnel: [],
  });

  const [nextInterview, setNextInterview] = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [activeOfferApp, setActiveOfferApp] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [response, interviewsRes, appsRes, profileRes] =
          await Promise.all([
            getCandidateAnalytics(),
            getMyCandidateInterviews({ limit: 10 }).catch(() => null),
            getMyApplications({ limit: 10 }).catch(() => null),
            getMyCandidateProfile().catch(() => null),
          ]);

        if (response.success) {
          setStats(response.data.stats);
          setCharts(
            response.data.charts || {
              applicationStatus: [],
              applicationsByMonth: [],
              hiringFunnel: [],
            }
          );
        } else {
          setError(response.message || "Failed to load analytics");
        }

        const rawInterviews =
          interviewsRes?.data?.items ||
          interviewsRes?.data?.interviews ||
          interviewsRes?.items ||
          interviewsRes?.data ||
          [];
        const interviewList = Array.isArray(rawInterviews) ? rawInterviews : [];
        const now = Date.now();
        const upcoming = interviewList
          .filter(
            (i) =>
              ["SCHEDULED", "CONFIRMED", "IN_PROGRESS"].includes(i.status) &&
              new Date(i.scheduledAt).getTime() +
                (i.durationMinutes || 60) * 60 * 1000 >=
                now
          )
          .sort(
            (a, b) =>
              new Date(a.scheduledAt).getTime() -
              new Date(b.scheduledAt).getTime()
          );

        setNextInterview(upcoming[0] || null);

        const rawApps =
          appsRes?.data?.applications ||
          appsRes?.applications ||
          appsRes?.data ||
          [];
        const appList = Array.isArray(rawApps) ? rawApps : [];
        setRecentApps(appList.slice(0, 4));

        const offerItem = appList.find(
          (a) =>
            ["OFFER", "OFFER_SENT", "SELECTED"].includes(a.status) &&
            a.offerDetails?.salaryPackage > 0
        );
        setActiveOfferApp(offerItem || null);

        if (profileRes?.data) {
          setProfile(profileRes.data);
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load candidate analytics."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const completionPct = profile?.profileCompletion || 85;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <DashboardHeader
        title="Candidate Dashboard"
        actions={
          <div className="flex items-center gap-2">
            <Link
              to="/candidate/jobs"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-500 shadow-sm cursor-pointer"
            >
              <Search size={15} />
              <span>Browse Jobs</span>
            </Link>
            <Link
              to="/candidate/profile"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-500 shadow-sm cursor-pointer"
            >
              <UserRound size={15} />
              <span>My Profile</span>
            </Link>
          </div>
        }
      />

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {activeOfferApp && (
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-slate-900 to-slate-900 p-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <Gift size={20} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                  New Job Offer
                </span>
              </div>
              <h3 className="text-base font-bold text-white">
                {activeOfferApp.offerDetails?.position ||
                  activeOfferApp.jobId?.title ||
                  "Job Offer"}
              </h3>
              <div className="text-xs text-slate-300">
                Annual CTC:{" "}
                <strong className="text-emerald-400 font-mono">
                  ₹{Number(activeOfferApp.offerDetails.salaryPackage).toLocaleString("en-IN")} / yr
                </strong>
              </div>
            </div>
          </div>

          <Link
            to="/candidate/offers"
            className="inline-flex items-center gap-1.5 self-start sm:self-center rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-500"
          >
            <span>Open Offer</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {nextInterview && (
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-sky-500/25 bg-gradient-to-r from-sky-500/10 via-slate-900 to-slate-900 p-5 sm:flex-row sm:items-center">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-sky-500/30 bg-sky-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-300">
                Next Interview
              </span>
              <span className="text-xs text-slate-400">
                {nextInterview.roundName || `Round ${nextInterview.roundNumber || 1}`}
              </span>
            </div>

            <h3 className="text-base font-bold text-white">
              {nextInterview.jobId?.title || "Technical Interview"}
            </h3>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={13} className="text-sky-400" />
                {new Date(nextInterview.scheduledAt).toLocaleString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
              <span className="inline-flex items-center gap-1 text-slate-400">
                <Clock size={13} />
                {nextInterview.durationMinutes || 60} min
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {nextInterview.meetingUrl && (
              <a
                href={nextInterview.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 px-4 py-2.5 text-xs font-semibold text-slate-950 transition hover:bg-sky-400"
              >
                <Video size={14} />
                Join Call
                <ExternalLink size={12} />
              </a>
            )}

            <Link
              to="/candidate/interviews"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-xs font-medium text-slate-200 transition hover:border-white/20 hover:text-white"
            >
              View Schedule
            </Link>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Applications"
          value={loading ? "..." : stats.totalApplications}
          icon={ClipboardList}
          to="/candidate/applications"
        />

        <StatCard
          title="Shortlisted"
          value={loading ? "..." : stats.shortlistedApplications}
          icon={BriefcaseBusiness}
          to="/candidate/applications"
        />

        <StatCard
          title="Interviews"
          value={loading ? "..." : stats.scheduledInterviews}
          icon={CalendarDays}
          to="/candidate/interviews"
        />

        <StatCard
          title="Offers"
          value={loading ? "..." : stats.offersReceived}
          icon={FileText}
          to="/candidate/offers"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">Profile Completion</h2>
            <span className="font-mono text-sm font-bold text-emerald-400">
              {completionPct}%
            </span>
          </div>

          <div className="h-2.5 w-full overflow-hidden rounded-full border border-slate-800 bg-slate-950">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${Math.min(completionPct, 100)}%` }}
            />
          </div>

          <div className="space-y-2 pt-1 text-xs">
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-950/60 px-3.5 py-2.5">
              <span className="text-slate-300">Skills Added</span>
              <span className="font-mono font-semibold text-white">
                {profile?.skills?.length || 7} skills
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-950/60 px-3.5 py-2.5">
              <span className="text-slate-300">Resume</span>
              {profile?.resumeUrl ? (
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-sky-400 hover:text-sky-300"
                >
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  <span>View Resume</span>
                  <ExternalLink size={11} />
                </a>
              ) : (
                <span className="text-amber-400">Not uploaded</span>
              )}
            </div>
          </div>

          <div className="pt-1">
            <Link
              to="/candidate/profile"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-slate-950 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-white/5 hover:text-white"
            >
              <span>Edit Profile</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">Recent Applications</h2>
            <Link
              to="/candidate/applications"
              className="inline-flex items-center gap-1 text-xs font-medium text-sky-400 hover:text-sky-300"
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {recentApps.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500">
              You have not applied to any jobs yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentApps.map((app) => {
                const job = app.jobId || {};
                return (
                  <div
                    key={app._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border border-white/5 bg-slate-950/60 px-4 py-3 text-xs"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="font-semibold text-white truncate">
                        {job.title || "Software Role"}
                      </div>
                      <div className="text-slate-400">
                        {job.location || "Remote"} • Applied{" "}
                        {app.appliedAt || app.createdAt
                          ? new Date(
                              app.appliedAt || app.createdAt
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          : ""}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="rounded-lg border border-indigo-500/25 bg-indigo-500/10 px-2.5 py-1 font-mono text-[10px] font-semibold text-indigo-300">
                        {app.status}
                      </span>
                      <Link
                        to={`/candidate/applications/${app._id}`}
                        className="rounded-lg border border-white/10 bg-slate-900 px-2.5 py-1 text-slate-300 hover:text-white"
                      >
                        Track
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div>
        <ApplicationsByMonthChart
          data={charts.applicationsByMonth}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ApplicationStatusChart
          data={charts.applicationStatus}
        />

        <HiringFunnelChart
          data={charts.hiringFunnel}
        />
      </div>
    </div>
  );
};

export default CandidateDashboard;
