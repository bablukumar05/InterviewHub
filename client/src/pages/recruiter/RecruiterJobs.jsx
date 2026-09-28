import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  Filter,
  Pause,
  Play,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  getMyJobs,
  createJob,
  updateJob,
  publishJob,
  pauseJob,
  closeJob,
} from "../../api/jobApi";

import JobForm from "../../components/recruiter/JobForm";
import JobStatusBadge from "../../components/recruiter/JobStatusBadge";

const RecruiterJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyJobs({
        page,
        limit: 10,
        search,
        status,
      });

      setJobs(response?.data?.jobs || []);
      setPagination(response?.data?.pagination || {});
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to load jobs."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [page, status]);

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
    loadJobs();
  };

  const stats = useMemo(() => {
    return {
      total: pagination.total || 0,
      draft: jobs.filter((job) => job.status === "DRAFT").length,
      published: jobs.filter((job) => job.status === "PUBLISHED").length,
      paused: jobs.filter((job) => job.status === "PAUSED").length,
      closed: jobs.filter((job) => job.status === "CLOSED").length,
    };
  }, [jobs, pagination.total]);

  const handleSaveJob = async (data) => {
    try {
      setSaving(true);
      setError("");

      if (editingJob) {
        await updateJob(editingJob._id, data);
      } else {
        await createJob(data);
      }

      setFormOpen(false);
      setEditingJob(null);

      await loadJobs();
    } catch (requestError) {
      const apiData = requestError.response?.data;
      const validationErrors = apiData?.data?.errors;

      if (Array.isArray(validationErrors)) {
        setError(
          validationErrors
            .map((item) => `${item.field}: ${item.message}`)
            .join(" • ")
        );
      } else {
        setError(apiData?.message || "Unable to save job.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (jobId) => {
    try {
      setError("");
      await publishJob(jobId);
      await loadJobs();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to publish job."
      );
    }
  };

  const handlePause = async (jobId) => {
    try {
      setError("");
      await pauseJob(jobId);
      await loadJobs();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to pause job."
      );
    }
  };

  const handleClose = async (jobId) => {
    const confirmed = window.confirm(
      "Are you sure you want to close this job?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      await closeJob(jobId);
      await loadJobs();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to close job."
      );
    }
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <span className="text-sm text-slate-300">Loading jobs...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Jobs</h1>

        <button
          type="button"
          onClick={() => {
            setEditingJob(null);
            setFormOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-300/40 bg-gradient-to-b from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-[0_0_20px_rgba(56,189,248,0.45)] transition-all cursor-pointer"
        >
          <Plus size={17} />
          Create Job
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Total Jobs"
          value={stats.total}
          icon={BriefcaseBusiness}
        />
        <StatCard title="Draft" value={stats.draft} icon={Edit3} />
        <StatCard title="Published" value={stats.published} icon={Play} />
        <StatCard title="Paused" value={stats.paused} icon={Pause} />
        <StatCard title="Closed" value={stats.closed} icon={Trash2} />
      </div>

      <div className="rounded-2xl border border-white/15 bg-slate-950/75 backdrop-blur-xl p-4 shadow-lg">
        <div className="flex flex-col gap-3 lg:flex-row">
          <form onSubmit={handleSearch} className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-300/80"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search jobs..."
                className="w-full rounded-xl border border-white/15 bg-slate-900/90 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white outline-none placeholder:text-slate-400 focus:border-sky-400/60"
              />
            </div>

            <button
              type="submit"
              className="rounded-xl border border-sky-300/40 bg-gradient-to-b from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 px-5 text-xs sm:text-sm font-semibold text-white shadow-[0_0_16px_rgba(56,189,248,0.35)] transition-all cursor-pointer"
            >
              Search
            </button>
          </form>

          <div className="relative">
            <Filter
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400"
            />
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-white/15 bg-slate-900/90 py-2.5 pl-9 pr-10 text-xs sm:text-sm text-white outline-none focus:border-sky-400/60"
            >
              <option value="">All statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="PAUSED">Paused</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/15 bg-slate-950/75 backdrop-blur-xl shadow-xl">
        <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_180px] gap-4 border-b border-white/10 bg-slate-900/80 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-200 lg:grid">
          <span>Job</span>
          <span>Type</span>
          <span>Openings</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>

        {jobs.length === 0 ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
            <BriefcaseBusiness className="h-10 w-10 text-sky-400/70" />
            <h3 className="mt-4 text-lg font-semibold text-white">
              No jobs found
            </h3>
            <button
              type="button"
              onClick={() => {
                setEditingJob(null);
                setFormOpen(true);
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-sky-300/40 bg-gradient-to-b from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 px-4 py-2.5 text-xs font-semibold text-white shadow-[0_0_18px_rgba(56,189,248,0.4)] transition-all cursor-pointer"
            >
              <Plus size={16} />
              Create Job
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="grid gap-4 px-6 py-5 transition hover:bg-white/[0.03] lg:grid-cols-[2fr_1fr_1fr_1fr_180px] lg:items-center"
              >
                <div className="min-w-0">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 rounded-xl border border-sky-400/30 bg-sky-500/20 p-2 shrink-0">
                      <BriefcaseBusiness
                        size={18}
                        className="text-sky-300"
                      />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-white">
                        {job.title}
                      </h3>
                      <div className="mt-1 text-xs text-slate-300">
                        {job.department || "Engineering"}
                        {job.location ? ` • ${job.location}` : ""}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {(job.skills || []).slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full border border-sky-400/25 bg-sky-500/15 px-2.5 py-0.5 text-[11px] font-medium text-sky-100"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-300 lg:hidden">Type</div>
                  <div className="text-sm text-white font-medium">
                    {formatEmploymentType(job.employmentType)}
                  </div>
                  <div className="text-xs text-sky-200/80">
                    {formatWorkMode(job.workMode)}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-300 lg:hidden">Openings</div>
                  <div className="flex items-center gap-2 text-sm text-white font-medium">
                    <Users size={15} className="text-sky-400" />
                    {job.openings}
                  </div>
                  <div className="mt-1 text-xs text-slate-300">
                    {job.applicantsCount || 0} applicants
                  </div>
                </div>

                <div>
                  <div className="mb-2 text-xs text-slate-300 lg:hidden">Status</div>
                  <JobStatusBadge status={job.status} />
                </div>

                <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
                  <Link
                    to={`/jobs/${job._id}`}
                    className="rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 p-2 text-slate-100 hover:text-white transition-all"
                    title="View"
                  >
                    <Eye size={16} />
                  </Link>

                  {job.status !== "CLOSED" && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingJob(job);
                        setFormOpen(true);
                      }}
                      className="rounded-lg border border-white/15 bg-slate-900/90 p-2 text-slate-300 hover:text-white cursor-pointer"
                      title="Edit"
                    >
                      <Edit3 size={16} />
                    </button>
                  )}

                  {job.status === "DRAFT" && (
                    <button
                      type="button"
                      onClick={() => handlePublish(job._id)}
                      className="rounded-lg border border-emerald-500/30 bg-emerald-500/15 p-2 text-emerald-400 hover:bg-emerald-500/25 cursor-pointer"
                      title="Publish"
                    >
                      <Play size={16} />
                    </button>
                  )}

                  {job.status === "PUBLISHED" && (
                    <button
                      type="button"
                      onClick={() => handlePause(job._id)}
                      className="rounded-lg border border-amber-500/30 bg-amber-500/15 p-2 text-amber-400 hover:bg-amber-500/25 cursor-pointer"
                      title="Pause"
                    >
                      <Pause size={16} />
                    </button>
                  )}

                  {job.status === "PAUSED" && (
                    <button
                      type="button"
                      onClick={() => handlePublish(job._id)}
                      className="rounded-lg border border-emerald-500/30 bg-emerald-500/15 p-2 text-emerald-400 hover:bg-emerald-500/25 cursor-pointer"
                      title="Re-publish"
                    >
                      <Play size={16} />
                    </button>
                  )}

                  {job.status !== "CLOSED" && (
                    <button
                      type="button"
                      onClick={() => handleClose(job._id)}
                      className="rounded-lg border border-red-500/30 bg-red-500/15 p-2 text-red-400 hover:bg-red-500/25 cursor-pointer"
                      title="Close"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between rounded-2xl border border-white/15 bg-slate-950/75 backdrop-blur-xl px-5 py-4">
          <span className="text-sm text-slate-300">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={!pagination.hasPreviousPage}
              onClick={() => setPage((current) => current - 1)}
              className="rounded-xl border border-white/15 bg-slate-900/90 p-2 text-slate-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              disabled={!pagination.hasNextPage}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-xl border border-white/15 bg-slate-900/90 p-2 text-slate-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {formOpen && (
        <JobForm
          initialData={editingJob}
          submitting={saving}
          onSubmit={handleSaveJob}
          onClose={() => {
            if (!saving) {
              setFormOpen(false);
              setEditingJob(null);
            }
          }}
        />
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon }) => {
  return (
    <div className="rounded-2xl border border-white/15 bg-slate-950/75 backdrop-blur-xl p-5 shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <span className="block text-xs font-medium text-slate-300">{title}</span>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-white">{value}</div>
        </div>

        <div className="rounded-xl border border-sky-400/25 bg-sky-500/15 p-3">
          <Icon size={20} className="text-sky-400" />
        </div>
      </div>
    </div>
  );
};

const formatEmploymentType = (value) => {
  const labels = {
    FULL_TIME: "Full Time",
    PART_TIME: "Part Time",
    INTERNSHIP: "Internship",
    CONTRACT: "Contract",
  };
  return labels[value] || value;
};

const formatWorkMode = (value) => {
  const labels = {
    REMOTE: "Remote",
    HYBRID: "Hybrid",
    ONSITE: "Onsite",
  };
  return labels[value] || value;
};

export default RecruiterJobs;
