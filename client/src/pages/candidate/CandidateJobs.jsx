import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

import JobCard from "../../components/jobs/JobCard";
import JobFilters from "../../components/jobs/JobFilters";
import { getJobs } from "../../api/jobApi";

const initialFilters = {
  search: "",
  location: "",
  employmentType: "",
  workMode: "",
  experienceLevel: "",
};

const CandidateJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getJobs({
        page,
        limit: 10,
        search: filters.search,
        location: filters.location,
        employmentType: filters.employmentType,
        workMode: filters.workMode,
        experienceLevel: filters.experienceLevel,
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
  }, [
    page,
    filters.search,
    filters.location,
    filters.employmentType,
    filters.workMode,
    filters.experienceLevel,
  ]);

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setFilters((current) => ({
      ...current,
      search: searchInput.trim(),
    }));
  };

  const handleFilterChange = (field, value) => {
    setPage(1);
    setFilters((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleReset = () => {
    setPage(1);
    setSearchInput("");
    setFilters(initialFilters);
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat scale-105 blur-[4px]"
        style={{ backgroundImage: "url('/office-bg.jpg')" }}
      />
      <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-slate-950/60 via-slate-900/45 to-slate-950/75" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="rounded-3xl border border-sky-300/25 bg-slate-900/50 backdrop-blur-2xl p-6 sm:p-10 shadow-[0_32px_90px_rgba(2,6,23,0.85)] ring-1 ring-white/10 space-y-6">
          <h1 className="text-2xl font-extrabold text-white sm:text-3xl tracking-tight">
            Browse Jobs
          </h1>

          <form
            onSubmit={handleSearch}
            className="rounded-2xl border border-white/15 bg-slate-950/80 backdrop-blur-xl p-3.5 shadow-xl"
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-400"
                />

                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search by job title, skill, department..."
                  className="w-full rounded-xl border border-white/15 bg-slate-900/90 py-2.5 pl-11 pr-4 text-xs sm:text-sm text-white outline-none placeholder:text-slate-400 focus:border-sky-400/60"
                />
              </div>

              <button
                type="submit"
                className="rounded-xl border border-sky-300/40 bg-gradient-to-b from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>

          <JobFilters
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleReset}
          />

          <div className="flex items-center justify-between px-1">
            <span className="text-xs sm:text-sm font-semibold text-sky-100">
              {pagination.total || 0}{" "}
              {pagination.total === 1 ? "job" : "jobs"} found
            </span>

            {loading && (
              <span className="text-xs text-sky-300">Updating...</span>
            )}
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {loading && jobs.length === 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[360px] animate-pulse rounded-2xl border border-white/15 bg-slate-950/75"
                />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="rounded-2xl border border-white/15 bg-slate-950/80 px-6 py-16 text-center">
              <h2 className="text-xl font-semibold text-white">
                No jobs found
              </h2>

              <button
                type="button"
                onClick={handleReset}
                className="mt-5 rounded-xl border border-white/25 bg-white/10 hover:bg-white/20 backdrop-blur-md px-5 py-2.5 text-xs font-semibold text-white cursor-pointer"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/15 bg-slate-950/80 px-5 py-4 sm:flex-row">
              <span className="text-xs sm:text-sm text-slate-200">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!pagination.hasPreviousPage}
                  onClick={() => setPage((current) => current - 1)}
                  className="rounded-xl border border-white/20 bg-white/10 p-2.5 text-slate-200 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronLeft size={18} />
                </button>

                <button
                  type="button"
                  disabled={!pagination.hasNextPage}
                  onClick={() => setPage((current) => current + 1)}
                  className="rounded-xl border border-white/20 bg-white/10 p-2.5 text-slate-200 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateJobs;
