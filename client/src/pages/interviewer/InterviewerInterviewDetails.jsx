import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Copy,
  FileText,
  Loader2,
  Play,
  Printer,
  UserRound,
  Video,
  XCircle,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getInterviewById,
  getInterviewCandidate,
  startInterview,
  completeInterview,
  markInterviewNoShow,
  downloadCandidateResume,
} from "../../api/interviewApi";

import {
  openResumeBlob,
} from "../../utils/resumeViewer";

import InterviewStatusBadge from "../../components/interviews/InterviewStatusBadge";

const getInterview = (response) =>
  response?.data?.interview ||
  response?.interview ||
  response?.data ||
  response;

const getCandidateData = (response) =>
  response?.data ||
  response;

const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function InterviewerInterviewDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [candidateLoading, setCandidateLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);

  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = async () => {
    if (!interview?.meetingUrl) return;
    try {
      await navigator.clipboard.writeText(interview.meetingUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      setCopiedLink(false);
    }
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getInterviewById(id);
      setInterview(getInterview(response));
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to load interview."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadCandidate = useCallback(async () => {
    try {
      setCandidateLoading(true);

      const response = await getInterviewCandidate(id);
      const data = getCandidateData(response);

      setCandidate(data?.candidate || null);
      setProfile(data?.profile || null);
    } catch (requestError) {

      setActionError(
        requestError?.response?.data?.message ||
          "Unable to load candidate information."
      );
    } finally {
      setCandidateLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
    loadCandidate();
  }, [loadData, loadCandidate]);

  const refresh = async () => {
    await loadData();
    await loadCandidate();
  };

  const handleStart = async () => {
    try {
      setActionLoading(true);
      setActionError("");

      await startInterview(id);
      await loadData();
    } catch (requestError) {
      setActionError(
        requestError?.response?.data?.message ||
          "Unable to start interview."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      setActionLoading(true);
      setActionError("");

      await completeInterview(id);
      await loadData();
    } catch (requestError) {
      setActionError(
        requestError?.response?.data?.message ||
          "Unable to complete interview."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleNoShow = async () => {
    try {
      setActionLoading(true);
      setActionError("");

      await markInterviewNoShow(id);
      await loadData();
    } catch (requestError) {
      setActionError(
        requestError?.response?.data?.message ||
          "Unable to mark no-show."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    try {
      setResumeLoading(true);
      setActionError("");

      const blob = await downloadCandidateResume(id);
      openResumeBlob(blob);
    } catch (requestError) {
      setActionError(
        requestError?.response?.data?.message ||
          "Unable to open candidate resume."
      );
    } finally {
      setResumeLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-full bg-slate-950">
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="text-center">
            <Loader2
              size={30}
              className="mx-auto animate-spin text-indigo-400"
            />
            <p className="mt-4 text-sm text-slate-500">
              Loading interview...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !interview) {
    return (
      <main className="min-h-full bg-slate-950 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <Link
            to="/interviewer/workspace"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white transition"
          >
            <ArrowLeft size={16} />
            Back to workspace
          </Link>

          <div className="mt-6 rounded-2xl border border-red-400/15 bg-red-400/5 p-6">
            <p className="text-sm text-red-300">
              {error || "Interview not found."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const status = interview.status;
  const job = interview.jobId || {};

  const canStart = status === "CONFIRMED";
  const canComplete = status === "IN_PROGRESS";
  const canNoShow = status === "SCHEDULED" || status === "CONFIRMED";

  return (
    <main className="min-h-full bg-slate-950 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">

        <div className="flex items-center justify-between">
          <Link
            to="/interviewer/workspace"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white transition"
          >
            <ArrowLeft size={16} />
            Back to workspace
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-400 hover:bg-white/5 hover:text-white transition"
            >
              <Printer size={14} />
              Print Summary
            </button>
            <button
              type="button"
              onClick={refresh}
              disabled={loading}
              className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-400 hover:bg-white/5 hover:text-white transition"
            >
              Refresh
            </button>
          </div>
        </div>

        <section className="rounded-2xl border border-white/10 bg-slate-900">
          <div className="p-5 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <InterviewStatusBadge status={status} size="md" />

                <h1 className="mt-3 text-2xl font-semibold text-white">
                  {interview.roundName || "Interview Round"}
                </h1>

                <p className="mt-1 text-sm text-slate-400">
                  {job.title || "Job"}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Round {interview.roundNumber || 1} · {interview.roundType}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
                <Meta
                  icon={CalendarDays}
                  label="Scheduled"
                  value={formatDateTime(interview.scheduledAt)}
                />

                <Meta
                  icon={Clock3}
                  label="Duration"
                  value={`${interview.durationMinutes || 60} min`}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 p-5 sm:p-6">
            {actionError && (
              <div className="mb-4 rounded-xl border border-red-400/15 bg-red-400/5 px-4 py-3 text-sm text-red-300">
                {actionError}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {interview.meetingUrl &&
                !["COMPLETED", "CANCELLED", "NO_SHOW"].includes(status) && (
                  <>
                    <a
                      href={interview.meetingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-400 transition"
                    >
                      <Video size={16} />
                      Join Meeting
                    </a>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-slate-950/60 px-3.5 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition"
                    >
                      {copiedLink ? (
                        <Check size={15} className="text-emerald-400" />
                      ) : (
                        <Copy size={15} />
                      )}
                      {copiedLink ? "Copied!" : "Copy Link"}
                    </button>
                  </>
                )}

              {canStart && (
                <button
                  type="button"
                  onClick={handleStart}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-500 transition disabled:opacity-50"
                >
                  <Play size={16} />
                  Start Interview
                </button>
              )}

              {canComplete && (
                <button
                  type="button"
                  onClick={handleComplete}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 transition disabled:opacity-50"
                >
                  <CheckCircle2 size={16} />
                  Complete Interview
                </button>
              )}

              {canNoShow && (
                <button
                  type="button"
                  onClick={handleNoShow}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 rounded-lg border border-amber-400/20 bg-amber-400/5 px-4 py-2.5 text-sm font-medium text-amber-300 hover:bg-amber-400/10 transition disabled:opacity-50"
                >
                  <XCircle size={16} />
                  Mark No-show
                </button>
              )}

              {["CONFIRMED", "IN_PROGRESS", "COMPLETED"].includes(
                interview.status
              ) && (
                <Link
                  to={`/interviewer/interviews/${interview._id}/evaluation`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10"
                >
                  <ClipboardCheck size={16} />
                  {interview.status === "COMPLETED"
                    ? "Evaluate Interview"
                    : "Open Evaluation"}
                </Link>
              )}
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-2xl border border-white/10 bg-slate-900">
            <div className="border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-2">
                <UserRound size={17} className="text-indigo-400" />
                <h2 className="text-sm font-semibold text-white">
                  Candidate Profile
                </h2>
              </div>
            </div>

            <div className="p-5">
              {candidateLoading ? (
                <div className="py-10 text-center">
                  <Loader2
                    size={23}
                    className="mx-auto animate-spin text-indigo-400"
                  />
                  <p className="mt-3 text-xs text-slate-500">
                    Loading candidate profile...
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-slate-800">
                      {candidate?.avatar ? (
                        <img
                          src={candidate.avatar}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <UserRound size={24} className="text-slate-600" />
                      )}
                    </div>

                    <div>
                      <h3 className="text-base font-semibold text-white">
                        {candidate?.name ||
                          [candidate?.firstName, candidate?.lastName]
                            .filter(Boolean)
                            .join(" ") ||
                          "Candidate"}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        {candidate?.title ||
                          profile?.headline ||
                          "Candidate"}
                      </p>
                    </div>
                  </div>

                  {profile?.bio && (
                    <div className="mt-6">
                      <p className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">
                        About
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        {profile.bio}
                      </p>
                    </div>
                  )}

                  {Array.isArray(profile?.skills) &&
                    profile.skills.length > 0 && (
                      <div className="mt-6">
                        <p className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">
                          Skills
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {profile.skills.map((skill, index) => (
                            <span
                              key={`${skill}-${index}`}
                              className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-slate-300"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  <div className="mt-6">
                    <p className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">
                      Resume
                    </p>

                    <div className="mt-3 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <FileText size={18} className="text-indigo-400" />
                          <p className="text-sm font-medium text-white">
                            {profile?.resumeOriginalName ||
                              "Candidate resume"}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={handleResume}
                          disabled={resumeLoading}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/5 hover:text-white transition disabled:opacity-50"
                        >
                          {resumeLoading ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              Opening...
                            </>
                          ) : (
                            <>
                              <FileText size={14} />
                              Open Resume
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-white/10 bg-slate-900 p-5">
              <h2 className="text-sm font-semibold text-white">
                Interview Details
              </h2>

              <div className="mt-5 space-y-4">
                <Detail
                  label="Type"
                  value={interview.roundType}
                />

                <Detail
                  label="Meeting"
                  value={interview.meetingType}
                />

                <Detail
                  label="Timezone"
                  value={interview.timezone}
                />

                <Detail
                  label="Scheduled"
                  value={formatDateTime(interview.scheduledAt)}
                />

                <Detail
                  label="Duration"
                  value={`${interview.durationMinutes || 60} minutes`}
                />
              </div>
            </section>

            {interview.instructions && (
              <section className="rounded-2xl border border-white/10 bg-slate-900 p-5">
                <h2 className="text-sm font-semibold text-white">
                  Instructions
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {interview.instructions}
                </p>
              </section>
            )}

            {interview.candidateNotes && (
              <section className="rounded-2xl border border-white/10 bg-slate-900 p-5">
                <h2 className="text-sm font-semibold text-white">
                  Candidate Notes
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {interview.candidateNotes}
                </p>
              </section>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}

function Meta({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 min-w-[130px]">
      <div className="flex items-center gap-2">
        <Icon size={14} className="text-slate-600" />
        <span className="text-[10px] uppercase tracking-wide text-slate-600 font-semibold">
          {label}
        </span>
      </div>

      <p className="mt-1.5 text-xs text-slate-300 font-medium">
        {value}
      </p>
    </div>
  );
}

function Detail({
  label,
  value,
}) {
  return (
    <div className="border-b border-white/5 pb-3 last:border-0 last:pb-0">
      <p className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">
        {label}
      </p>

      <p className="mt-1.5 text-sm capitalize text-slate-300">
        {String(value || "—").replace(/_/g, " ")}
      </p>
    </div>
  );
}
