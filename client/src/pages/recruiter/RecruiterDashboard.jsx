import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BriefcaseBusiness,
  Users,
  CalendarDays,
  FileText,
  ArrowRight,
  Video,
  ExternalLink,
  MapPin,
} from "lucide-react";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatCard from "../../components/dashboard/StatCard";
import ApplicationStatusChart from "../../components/dashboard/ApplicationStatusChart";
import ApplicationsByMonthChart from "../../components/dashboard/ApplicationsByMonthChart";
import JobsByStatusChart from "../../components/dashboard/JobsByStatusChart";
import InterviewTrendsChart from "../../components/dashboard/InterviewTrendsChart";
import HiringFunnelChart from "../../components/dashboard/HiringFunnelChart";
import InterviewStatusBadge from "../../components/interviews/InterviewStatusBadge";

import { getRecruiterAnalytics } from "../../api/analyticsApi";
import { getRecruiterInterviews } from "../../api/interviewApi";
import { getMyJobs } from "../../api/jobApi";

const RecruiterDashboard = () => {
  const [stats, setStats] = useState({
    totalJobs: 0,
    publishedJobs: 0,
    totalApplications: 0,
    shortlistedApplications: 0,
    totalInterviews: 0,
    upcomingInterviews: 0,
    totalOffers: 0,
  });

  const [charts, setCharts] = useState({
    applicationStatus: [],
    applicationsByMonth: [],
    jobsByStatus: [],
    interviewTrends: [],
    hiringFunnel: [],
  });

  const [interviews, setInterviews] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        const [response, interviewsRes, jobsRes] = await Promise.all([
          getRecruiterAnalytics(),
          getRecruiterInterviews({ limit: 5 }).catch(() => null),
          getMyJobs({ limit: 5 }).catch(() => null),
        ]);

        if (response.success) {
          setStats(response.data.stats);
          setCharts(
            response.data.charts || {
              applicationStatus: [],
              applicationsByMonth: [],
              jobsByStatus: [],
              interviewTrends: [],
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
        if (Array.isArray(rawInterviews)) {
          setInterviews(rawInterviews.slice(0, 4));
        }

        const rawJobs =
          jobsRes?.data?.jobs ||
          jobsRes?.jobs ||
          jobsRes?.data ||
          [];
        if (Array.isArray(rawJobs)) {
          setJobs(rawJobs.slice(0, 4));
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load recruiter analytics."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <DashboardHeader
        title="Recruiter Dashboard"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/recruiter/jobs"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-500"
            >
              <BriefcaseBusiness className="h-4 w-4" />
              Manage Jobs
            </Link>
            <Link
              to="/recruiter/applications"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-white/5"
            >
              <Users className="h-4 w-4" />
              Applications
            </Link>
            <Link
              to="/recruiter/interviews"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-white/5"
            >
              <CalendarDays className="h-4 w-4" />
              Interviews
            </Link>
          </div>
        }
      />

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Active Jobs"
          value={loading ? "..." : stats.publishedJobs}
          icon={BriefcaseBusiness}
          to="/recruiter/jobs"
        />

        <StatCard
          title="Applications"
          value={loading ? "..." : stats.totalApplications}
          icon={Users}
          to="/recruiter/applications"
        />

        <StatCard
          title="Upcoming Interviews"
          value={loading ? "..." : stats.upcomingInterviews}
          icon={CalendarDays}
          to="/recruiter/interviews"
        />

        <StatCard
          title="Offers Sent"
          value={loading ? "..." : stats.totalOffers}
          icon={FileText}
          to="/recruiter/applications"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">Recent Interviews</h2>
            <Link
              to="/recruiter/interviews"
              className="inline-flex items-center gap-1 text-xs font-medium text-sky-400 hover:text-sky-300"
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {interviews.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500">
              No interviews scheduled yet.
            </div>
          ) : (
            <div className="space-y-3">
              {interviews.map((item) => {
                const candidate = item.candidateId || {};
                const job = item.jobId || {};
                return (
                  <div
                    key={item._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-white/5 bg-slate-950/60 p-3.5 text-xs"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-white">
                          {candidate.name || "Candidate"}
                        </span>
                        <InterviewStatusBadge status={item.status} size="sm" />
                      </div>
                      <div className="text-slate-400 truncate">
                        {item.roundName || `Round ${item.roundNumber || 1}`} • {job.title || "Role"}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {item.scheduledAt
                          ? new Date(item.scheduledAt).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })
                          : ""}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.meetingUrl && (
                        <a
                          href={item.meetingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-sky-500/25 bg-sky-500/10 px-2.5 py-1.5 font-semibold text-sky-300 hover:bg-sky-500/20"
                        >
                          <Video size={12} />
                          <span>Join</span>
                          <ExternalLink size={10} />
                        </a>
                      )}
                      <Link
                        to={`/recruiter/interviews/${item._id}`}
                        className="rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 font-medium text-slate-200 hover:bg-white/5"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">My Job Posts</h2>
            <Link
              to="/recruiter/jobs"
              className="inline-flex items-center gap-1 text-xs font-medium text-sky-400 hover:text-sky-300"
            >
              <span>All Jobs</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {jobs.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500">
              No job posts created yet.
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-white/5 bg-slate-950/60 p-3.5 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white truncate">
                        {job.title}
                      </span>
                      <span className="rounded border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                        {job.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={11} />
                        {job.location || "Remote"}
                      </span>
                      <span>•</span>
                      <span>{job.openings || 1} openings</span>
                    </div>
                  </div>

                  <Link
                    to={`/recruiter/applications?jobId=${job._id}`}
                    className="inline-flex items-center gap-1 self-start sm:self-center rounded-lg border border-indigo-500/25 bg-indigo-500/10 px-3 py-1.5 font-semibold text-indigo-300 hover:bg-indigo-500/20 shrink-0"
                  >
                    <span>Applicants</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              ))}
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

        <JobsByStatusChart
          data={charts.jobsByStatus}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <HiringFunnelChart
          data={charts.hiringFunnel}
        />

        <InterviewTrendsChart
          data={charts.interviewTrends}
        />
      </div>
    </div>
  );
};

export default RecruiterDashboard;
