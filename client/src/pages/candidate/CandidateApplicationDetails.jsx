import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  FileText,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  getApplicationById,
} from "../../api/applicationApi";

import ApplicationStatusBadge from "../../components/applications/ApplicationStatusBadge";
import ApplicationHistoryTimeline from "../../components/applications/ApplicationHistoryTimeline";
import ApplicationJobSnapshot from "../../components/applications/ApplicationJobSnapshot";
import CandidateApplicationSnapshot from "../../components/applications/CandidateApplicationSnapshot";
import ApplicationInterviewInfo from "../../components/applications/ApplicationInterviewInfo";
import ApplicationRejectionInfo from "../../components/applications/ApplicationRejectionInfo";
import ApplicationOfferInfo from "../../components/applications/ApplicationOfferInfo";

import {
  formatDateTime,
  humanizeStatus,
  normalizeStatus,
} from "../../components/applications/applicationUtils";

const extractApplication = (response) => {
  return (
    response?.data?.application ||
    response?.application ||
    response?.data ||
    response
  );
};

const buildHistory = (application) => {

  if (
    Array.isArray(application?.statusHistory) &&
    application.statusHistory.length > 0
  ) {
    return application.statusHistory;
  }

  if (
    Array.isArray(application?.stageHistory) &&
    application.stageHistory.length > 0
  ) {
    return application.stageHistory;
  }

  return [];
};

const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    "Unable to load this application."
  );
};

export default function CandidateApplicationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState("");

  const loadApplication = useCallback(
    async ({ refresh = false } = {}) => {
      if (!id) {
        setError("Application ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setError("");

        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response =
          await getApplicationById(id);

        setApplication(
          extractApplication(response)
        );
      } catch (requestError) {
        setError(getErrorMessage(requestError));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id]
  );

  useEffect(() => {
    loadApplication();
  }, [loadApplication]);

  const status = useMemo(
    () =>
      normalizeStatus(
        application?.status
      ),
    [application?.status]
  );

  const history = useMemo(
    () => buildHistory(application),
    [application]
  );

  if (loading) {
    return (
      <main className="min-h-full bg-slate-950 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[500px] max-w-6xl items-center justify-center">
          <div className="flex flex-col items-center text-center">
            <Loader2
              size={30}
              className="animate-spin text-indigo-400"
            />

            <p className="mt-4 text-sm text-slate-400">
              Loading application details...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-full bg-slate-950 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/candidate/applications"
              )
            }
            className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to applications
          </button>

          <div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-6">
            <div className="flex gap-3">
              <AlertCircle
                className="shrink-0 text-red-400"
                size={21}
              />

              <div>
                <h1 className="text-lg font-semibold text-white">
                  Unable to load application
                </h1>

                <p className="mt-2 text-sm leading-6 text-red-300">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    loadApplication({
                      refresh: true,
                    })
                  }
                  className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
                >
                  <RefreshCw size={15} />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!application) {
    return (
      <main className="min-h-full bg-slate-950 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900 p-8 text-center">
            <FileText
              size={30}
              className="mx-auto text-slate-600"
            />

            <h1 className="mt-4 text-lg font-semibold text-white">
              Application not found
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              This application may no longer be available.
            </p>

            <Link
              to="/candidate/applications"
              className="mt-6 inline-flex rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400"
            >
              Back to Applications
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-full bg-slate-950 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            to="/candidate/applications"
            className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to applications
          </Link>

          <button
            type="button"
            onClick={() =>
              loadApplication({
                refresh: true,
              })
            }
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3.5 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />
            Refresh
          </button>
        </div>

        <section className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
          <div className="border-b border-white/10 p-5 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <ApplicationStatusBadge
                    status={status}
                  />

                  <span className="text-xs text-slate-600">
                    Application
                  </span>
                </div>

                <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                  {application?.job?.title ||
                    application?.jobId?.title ||
                    "Application Details"}
                </h1>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
                <p className="text-[10px] uppercase tracking-wide text-slate-600">
                  Current status
                </p>

                <p className="mt-1 text-sm font-semibold text-white">
                  {humanizeStatus(status)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-px bg-white/5 sm:grid-cols-3">
            <HeroMeta
              icon={CalendarDays}
              label="Applied"
              value={formatDateTime(
                application.appliedAt
              )}
            />

            <HeroMeta
              icon={CalendarDays}
              label="Last updated"
              value={formatDateTime(
                application.updatedAt
              )}
            />

            <HeroMeta
              icon={FileText}
              label="Application ID"
              value={application._id || id}
              mono
            />
          </div>
        </section>

        <section className="mb-6 rounded-2xl border border-white/10 bg-slate-900 p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">
              Hiring Pipeline Progress
            </h2>
            <span className="font-mono text-xs text-sky-400">
              {humanizeStatus(status)}
            </span>
          </div>

          <StageProgressStepper currentStatus={status} />
        </section>

        <section className="mb-6 rounded-2xl border border-white/10 bg-slate-900 p-5 sm:p-6">
          <h2 className="mb-5 text-sm font-semibold text-white">
            Application timeline
          </h2>

          <ApplicationHistoryTimeline
            history={history}
            currentStatus={status}
          />
        </section>

        <div className="space-y-6">
          <ApplicationJobSnapshot
            application={application}
          />

          <CandidateApplicationSnapshot
            application={application}
          />

          <ApplicationInterviewInfo
            application={application}
          />

          <ApplicationRejectionInfo
            application={application}
          />

          <ApplicationOfferInfo
            application={application}
          />
        </div>
      </div>
    </main>
  );
}

function HeroMeta({
  icon: Icon,
  label,
  value,
  mono = false,
}) {
  return (
    <div className="bg-slate-900 p-4">
      <div className="flex items-center gap-2">
        <Icon
          size={14}
          className="text-slate-600"
        />

        <p className="text-[10px] uppercase tracking-wide text-slate-600">
          {label}
        </p>
      </div>

      <p
        className={[
          "mt-1.5 truncate text-sm text-slate-300",
          mono ? "font-mono text-[11px]" : "",
        ].join(" ")}
      >
        {value || "—"}
      </p>
    </div>
  );
}

const PIPELINE_STEPS = [
  { key: "APPLIED", label: "Applied" },
  { key: "SHORTLISTED", label: "Shortlisted" },
  { key: "INTERVIEW", label: "Technical Interview" },
  { key: "OFFER", label: "Offer Extended" },
  { key: "HIRED", label: "Hired" },
];

function getStepIndex(status = "") {
  const s = String(status).toUpperCase();
  if (s.includes("HIRED") || s.includes("ACCEPTED")) return 4;
  if (s.includes("OFFER")) return 3;
  if (s.includes("INTERVIEW") || s.includes("EVALUATED")) return 2;
  if (s.includes("SHORTLIST") || s.includes("SCREEN")) return 1;
  return 0;
}

function StageProgressStepper({ currentStatus }) {
  const isRejected = String(currentStatus).toUpperCase().includes("REJECT");
  const activeIdx = getStepIndex(currentStatus);

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
      {PIPELINE_STEPS.map((step, index) => {
        const isCompleted = !isRejected && index <= activeIdx;
        const isCurrent = !isRejected && index === activeIdx;

        return (
          <div
            key={step.key}
            className={`flex items-center gap-2.5 rounded-xl border p-3 transition ${
              isCurrent
                ? "border-sky-500/40 bg-sky-500/10 text-white"
                : isCompleted
                ? "border-emerald-500/25 bg-emerald-500/5 text-emerald-300"
                : "border-white/5 bg-slate-950/60 text-slate-500"
            }`}
          >
            <div
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                isCurrent
                  ? "bg-sky-500 text-slate-950"
                  : isCompleted
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-slate-800 text-slate-500"
              }`}
            >
              {isCompleted ? <CheckCircle2 size={13} /> : index + 1}
            </div>
            <span className="truncate text-xs font-semibold">
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
