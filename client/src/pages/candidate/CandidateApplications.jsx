import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";

import ApplicationCard from "../../components/applications/ApplicationCard";
import { getMyApplications } from "../../api/applicationApi";

const PAGE_SIZE = 5;

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "Applied", value: "APPLIED" },
  { label: "Screening", value: "SCREENING" },
  { label: "Shortlisted", value: "SHORTLISTED" },
  { label: "Interview", value: "INTERVIEW" },
  { label: "Selected", value: "SELECTED" },
  { label: "Offer", value: "OFFER" },
  { label: "Hired", value: "HIRED" },
  { label: "Rejected", value: "REJECTED" },
];

const extractApplications = (response) => {
  const candidates = [
    response?.data?.applications,
    response?.data?.items,
    response?.applications,
    response?.items,
    response?.data,
  ];

  return (
    candidates.find((value) => Array.isArray(value)) || []
  );
};

const extractPagination = (response, fallbackPage) => {
  const pagination =
    response?.data?.pagination ||
    response?.pagination ||
    {};

  return {
    page: Number(pagination.page || fallbackPage),
    totalPages: Number(
      pagination.totalPages ||
        pagination.pages ||
        1
    ),
    total: Number(
      pagination.total ||
        pagination.totalItems ||
        0
    ),
  };
};

const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    "Unable to load your applications."
  );
};

export default function CandidateApplications() {
  const [applications, setApplications] =
    useState([]);

  const [selectedStatus, setSelectedStatus] =
    useState("");

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState("");

  const loadApplications = useCallback(
    async ({ refresh = false } = {}) => {
      try {
        setError("");

        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response = await getMyApplications({
          page,
          limit: PAGE_SIZE,
          status: selectedStatus || undefined,
          search: search.trim() || undefined,
        });

        const nextApplications =
          extractApplications(response);

        const nextPagination =
          extractPagination(response, page);

        setApplications(nextApplications);
        setPagination(nextPagination);
      } catch (requestError) {
        setError(getErrorMessage(requestError));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, search, selectedStatus]
  );

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleStatusChange = (value) => {
    setSelectedStatus(value);
    setPage(1);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setPage(1);
  };

  const visibleCount = useMemo(
    () => applications.length,
    [applications]
  );

  return (
    <main className="min-h-full bg-slate-950 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            My Applications
          </h1>

          <button
            type="button"
            onClick={() =>
              loadApplications({ refresh: true })
            }
            disabled={loading || refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={
                refreshing ? "animate-spin" : ""
              }
            />
            Refresh
          </button>
        </div>

        <section className="mb-6 rounded-2xl border border-white/10 bg-slate-900 p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <form
              onSubmit={handleSearchSubmit}
              className="relative w-full lg:max-w-sm"
            >
              <Search
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
              />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search applications..."
                className="w-full rounded-lg border border-white/10 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400/40"
              />
            </form>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {STATUS_FILTERS.map((filter) => {
                const active =
                  selectedStatus === filter.value;

                return (
                  <button
                    key={filter.value || "ALL"}
                    type="button"
                    onClick={() =>
                      handleStatusChange(
                        filter.value
                      )
                    }
                    className={[
                      "whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-medium transition",
                      active
                        ? "border-indigo-400/20 bg-indigo-400/10 text-indigo-300"
                        : "border-white/10 text-slate-400 hover:bg-white/5 hover:text-white",
                    ].join(" ")}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-6 rounded-xl border border-red-400/20 bg-red-400/5 p-4">
            <div className="flex items-center gap-3">
              <AlertCircle
                className="shrink-0 text-red-400"
                size={19}
              />

              <p className="text-sm text-red-300">
                {error}
              </p>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex min-h-[360px] items-center justify-center">
            <div className="flex flex-col items-center text-center">
              <Loader2
                size={30}
                className="animate-spin text-indigo-400"
              />

              <p className="mt-4 text-sm text-slate-400">
                Loading your applications...
              </p>
            </div>
          </div>
        )}

        {!loading && !error && applications.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/60 px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
              <BriefcaseBusiness
                size={25}
                className="text-slate-500"
              />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-white">
              No applications found
            </h2>

            <Link
              to="/jobs"
              className="mt-5 inline-flex rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400"
            >
              Browse Jobs
            </Link>
          </div>
        )}

        {!loading && applications.length > 0 && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Showing{" "}
                <span className="text-slate-300">
                  {visibleCount}
                </span>{" "}
                application
                {visibleCount !== 1 ? "s" : ""}
                {pagination.total > 0 && (
                  <>
                    {" "}
                    of{" "}
                    <span className="text-slate-300">
                      {pagination.total}
                    </span>
                  </>
                )}
              </p>
            </div>

            <div className="space-y-5">
              {applications.map((application) => (
                <ApplicationCard
                  key={
                    application._id ||
                    application.id
                  }
                  application={application}
                />
              ))}
            </div>
          </>
        )}

        {!loading &&
          pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() =>
                  setPage((current) =>
                    Math.max(current - 1, 1)
                  )
                }
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <span className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-slate-400">
                Page{" "}
                <span className="font-medium text-white">
                  {pagination.page}
                </span>{" "}
                of{" "}
                <span className="font-medium text-white">
                  {pagination.totalPages}
                </span>
              </span>

              <button
                type="button"
                disabled={
                  page >= pagination.totalPages
                }
                onClick={() =>
                  setPage((current) =>
                    Math.min(
                      current + 1,
                      pagination.totalPages
                    )
                  )
                }
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          )}
      </div>
    </main>
  );
}
