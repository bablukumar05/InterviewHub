import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  BriefcaseBusiness,
  CalendarDays,
  ScrollText,
  ClipboardCheck,
  FileText,
  ArrowRight,
  Shield,
  Clock,
} from "lucide-react";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatCard from "../../components/dashboard/StatCard";
import ApplicationStatusChart from "../../components/dashboard/ApplicationStatusChart";
import ApplicationsByMonthChart from "../../components/dashboard/ApplicationsByMonthChart";
import JobsByStatusChart from "../../components/dashboard/JobsByStatusChart";
import InterviewTrendsChart from "../../components/dashboard/InterviewTrendsChart";
import HiringFunnelChart from "../../components/dashboard/HiringFunnelChart";

import { getAdminAnalytics } from "../../api/analyticsApi";
import api from "../../api/axios";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrganizations: 0,
    totalJobs: 0,
    totalApplications: 0,
    totalInterviews: 0,
    totalEvaluations: 0,
    totalOffers: 0,
  });

  const [charts, setCharts] = useState({
    applicationStatus: [],
    applicationsByMonth: [],
    jobsByStatus: [],
    interviewTrends: [],
    hiringFunnel: [],
  });

  const [recentLogs, setRecentLogs] = useState([]);
  const [roleCounts, setRoleCounts] = useState({
    admins: 0,
    recruiters: 0,
    interviewers: 0,
    candidates: 0,
    active: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const [response, logsRes, usersRes] = await Promise.all([
        getAdminAnalytics(),
        api.get("/audit-logs", { params: { limit: 5 } }).catch(() => null),
        api.get("/users", { params: { limit: 100 } }).catch(() => null),
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

      const rawLogs =
        logsRes?.data?.data?.logs ||
        logsRes?.data?.logs ||
        logsRes?.data?.data ||
        [];
      if (Array.isArray(rawLogs)) {
        setRecentLogs(rawLogs.slice(0, 5));
      }

      const rawUsers =
        usersRes?.data?.data?.users ||
        usersRes?.data?.users ||
        [];
      if (Array.isArray(rawUsers)) {
        setRoleCounts({
          admins: rawUsers.filter((u) => u.role === "ADMIN").length,
          recruiters: rawUsers.filter((u) => u.role === "RECRUITER").length,
          interviewers: rawUsers.filter((u) => u.role === "INTERVIEWER").length,
          candidates: rawUsers.filter((u) => u.role === "CANDIDATE").length,
          active: rawUsers.filter((u) => u.isActive !== false).length,
        });
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load dashboard analytics."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <DashboardHeader
        title="Admin Dashboard"
        actions={
          <div className="flex items-center gap-2">
            <Link
              to="/admin/users"
              className="inline-flex items-center gap-2 rounded-xl border border-sky-300/40 bg-gradient-to-b from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 px-4 py-2.5 text-xs font-semibold text-white transition-all shadow-[0_0_20px_rgba(56,189,248,0.4)]"
            >
              <Users size={15} />
              <span>Team & Users</span>
            </Link>
            <Link
              to="/admin/audit-logs"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2.5 text-xs font-semibold text-white transition-all"
            >
              <ScrollText size={15} />
              <span>Activity Logs</span>
            </Link>
          </div>
        }
      />

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Total Users"
          value={loading ? "..." : stats.totalUsers}
          icon={Users}
          to="/admin/users"
        />

        <StatCard
          title="Total Jobs"
          value={loading ? "..." : stats.totalJobs}
          icon={BriefcaseBusiness}
          to="/admin/jobs"
        />

        <StatCard
          title="Applications"
          value={loading ? "..." : stats.totalApplications}
          icon={FileText}
        />

        <StatCard
          title="Interviews"
          value={loading ? "..." : stats.totalInterviews}
          icon={CalendarDays}
          to="/admin/interviews"
        />

        <StatCard
          title="Scorecards"
          value={loading ? "..." : stats.totalEvaluations}
          icon={ClipboardCheck}
          to="/admin/interviews"
        />

        <StatCard
          title="Offers Sent"
          value={loading ? "..." : stats.totalOffers}
          icon={FileText}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5 rounded-2xl border border-white/15 bg-slate-950/75 backdrop-blur-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">Users by Role</h2>
            <Link
              to="/admin/users"
              className="inline-flex items-center gap-1 text-xs font-medium text-sky-300 hover:text-sky-200"
            >
              <span>Manage</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/15 bg-slate-900/85 p-3.5">
              <span className="text-xs text-slate-200">Recruiters</span>
              <div className="mt-1 text-xl font-bold text-indigo-300 font-mono">
                {roleCounts.recruiters}
              </div>
            </div>
            <div className="rounded-xl border border-white/15 bg-slate-900/85 p-3.5">
              <span className="text-xs text-slate-200">Interviewers</span>
              <div className="mt-1 text-xl font-bold text-sky-300 font-mono">
                {roleCounts.interviewers}
              </div>
            </div>
            <div className="rounded-xl border border-white/15 bg-slate-900/85 p-3.5">
              <span className="text-xs text-slate-200">Candidates</span>
              <div className="mt-1 text-xl font-bold text-emerald-300 font-mono">
                {roleCounts.candidates}
              </div>
            </div>
            <div className="rounded-xl border border-white/15 bg-slate-900/85 p-3.5">
              <span className="text-xs text-slate-200">Admins</span>
              <div className="mt-1 text-xl font-bold text-amber-300 font-mono">
                {roleCounts.admins}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-4 py-2.5 text-xs">
            <span className="text-slate-100 font-medium">Active Accounts</span>
            <span className="font-mono font-bold text-emerald-300">
              {roleCounts.active} / {stats.totalUsers}
            </span>
          </div>
        </div>

        <div className="lg:col-span-7 rounded-2xl border border-white/15 bg-slate-950/75 backdrop-blur-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">Recent Activity</h2>
            <Link
              to="/admin/audit-logs"
              className="inline-flex items-center gap-1 text-xs font-medium text-sky-300 hover:text-sky-200"
            >
              <span>All Logs</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {recentLogs.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-300">
              No recent logs found.
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentLogs.map((log) => {
                const actor = log.user || log.userId || {};
                return (
                  <div
                    key={log._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-white/15 bg-slate-900/85 px-3.5 py-2.5 text-xs"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded border border-sky-400/30 bg-sky-500/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-sky-200">
                          <Shield size={10} />
                          {log.action}
                        </span>
                        <span className="text-slate-100 font-medium truncate">
                          {log.description}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300">
                        By <strong className="text-white">{actor.name || "System"}</strong>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[11px] text-sky-200/80 shrink-0">
                      <Clock size={11} />
                      {log.createdAt
                        ? new Date(log.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : ""}
                    </span>
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

export default AdminDashboard;
