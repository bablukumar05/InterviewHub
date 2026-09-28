import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Copy,
  ExternalLink,
  Loader2,
  Printer,
  RefreshCw,
  Video,
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
} from "../../api/interviewApi";
import {
  getInterviewEvaluations,
  reviewEvaluation,
} from "../../api/evaluationApi";

import InterviewerSelector from "../../components/interviews/InterviewerSelector";
import AssignedInterviewerCards from "../../components/interviews/AssignedInterviewerCards";
import InterviewStatusBadge from "../../components/interviews/InterviewStatusBadge";

const formatDateTime = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const getData = (response) =>
  response?.data?.interview ||
  response?.interview ||
  response?.data ||
  response;

const getRecommendationBadge = (rec) => {
  switch (rec) {
    case "STRONG_HIRE":
      return "border-emerald-500/30 bg-emerald-500/15 text-emerald-300";
    case "HIRE":
      return "border-sky-500/30 bg-sky-500/15 text-sky-300";
    case "MAYBE":
    case "HOLD":
      return "border-amber-500/30 bg-amber-500/15 text-amber-300";
    case "NO_HIRE":
    case "REJECT":
      return "border-rose-500/30 bg-rose-500/15 text-rose-300";
    default:
      return "border-white/10 bg-slate-800 text-slate-300";
  }
};

const toTextPoints = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  if (typeof val === "string") {
    return val
      .split(/\n|•/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
};

export default function RecruiterInterviewDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reviewingId, setReviewingId] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [error, setError] = useState("");

  const loadInterview = useCallback(
    async ({ refresh = false } = {}) => {
      try {
        setError("");

        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const [interviewRes, evalsRes] = await Promise.all([
          getInterviewById(id),
          getInterviewEvaluations(id).catch(() => null),
        ]);

        setInterview(getData(interviewRes));

        const rawEvals =
          evalsRes?.data?.evaluations ||
          evalsRes?.data?.items ||
          evalsRes?.evaluations ||
          evalsRes?.data ||
          [];
        setEvaluations(Array.isArray(rawEvals) ? rawEvals : []);
      } catch (requestError) {
        setError(
          requestError?.response?.data?.message ||
            "Unable to load interview."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id]
  );

  useEffect(() => {
    loadInterview();
  }, [loadInterview]);

  const handleReviewEvaluation = async (evaluationId) => {
    try {
      setReviewingId(evaluationId);
      const res = await reviewEvaluation(evaluationId);
      const updated =
        res?.data?.evaluation || res?.evaluation || res?.data;

      if (updated && updated._id) {
        setEvaluations((prev) =>
          prev.map((item) =>
            item._id === evaluationId ? updated : item
          )
        );
      } else {
        await loadInterview({ refresh: true });
      }
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          "Failed to mark evaluation as reviewed."
      );
    } finally {
      setReviewingId(null);
    }
  };

  const handleCopyMeetingLink = async (url) => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
    }
  };

  if (loading) {
    return (
      <main className="min-h-full bg-slate-950">
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="text-center">
            <Loader2
              size={32}
              className="mx-auto animate-spin text-indigo-400"
            />
            <p className="mt-4 text-sm text-slate-500">
              Loading interview details...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-full bg-slate-950 px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-red-400/15 bg-red-400/5 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={20}
                className="mt-0.5 text-red-300"
              />

              <div>
                <h1 className="text-base font-semibold text-white">
                  Could not load interview
                </h1>

                <p className="mt-1 text-sm text-red-200/80">
                  {error}
                </p>

                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-white/5"
                  >
                    <ArrowLeft size={15} />
                    Go back
                  </button>

                  <button
                    type="button"
                    onClick={() => loadInterview()}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-400"
                  >
                    <RefreshCw size={15} />
                    Try again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!interview) {
    return null;
  }

  const application =
    interview.applicationId ||
    interview.application ||
    {};

  const job =
    interview.jobId ||
    interview.job ||
    {};

  const meetingUrl = interview.meetingUrl || interview.meetingLink || "";

  const averagePanelScore =
    evaluations.length > 0
      ? Math.round(
          evaluations.reduce(
            (sum, item) => sum + (Number(item.overallScore) || 0),
            0
          ) / evaluations.length
        )
      : null;

  return (
    <main className="min-h-full bg-slate-950 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/recruiter/interviews"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
          >
            <ArrowLeft size={16} />
            Back to interviews
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/5 hover:text-white transition"
            >
              <Printer size={14} />
              Print Scorecard
            </button>

            <button
              type="button"
              onClick={() =>
                loadInterview({
                  refresh: true,
                })
              }
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/5 hover:text-white transition disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        <section className="rounded-2xl border border-white/10 bg-slate-900 p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <InterviewStatusBadge
                status={interview.status}
                size="md"
              />

              <h1 className="mt-3 text-2xl font-semibold text-white">
                {interview.roundName || "Interview Round"}
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                {job.title || "Job"}
                {" · "}
                {job.location || "Location not specified"}
              </p>

              {meetingUrl && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <a
                    href={meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/25 bg-sky-500/10 px-3 py-1.5 text-xs font-semibold text-sky-300 hover:bg-sky-500/20"
                  >
                    <Video size={13} />
                    Join Meeting Room
                    <ExternalLink size={11} />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleCopyMeetingLink(meetingUrl)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white"
                  >
                    {copiedLink ? (
                      <>
                        <Check size={13} className="text-emerald-400" />
                        <span className="text-emerald-300">Copied Link</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Copy Meeting Link</span>
                      </>
                    )}
                  </button>
                </div>
              )}
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
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-900 p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-white">
            Candidate Information
          </h2>

          <div className="mt-4 flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-800">
              <span className="text-sm font-semibold text-slate-300">
                {(
                  application?.candidateId?.name ||
                  interview?.candidateId?.name ||
                  "C"
                )
                  .charAt(0)
                  .toUpperCase()}
              </span>
            </div>

            <div>
              <p className="text-sm font-medium text-white">
                {application?.candidateId?.name ||
                  interview?.candidateId?.name ||
                  "Candidate"}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Round Type: {interview.roundType || "Interview"} · Round #{interview.roundNumber || 1}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-900 p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <ClipboardCheck size={16} className="text-sky-400" />
              <h2 className="text-sm font-semibold text-white">
                Submitted Evaluations ({evaluations.length})
              </h2>
            </div>

            {averagePanelScore !== null && (
              <div className="inline-flex items-center gap-2.5 self-start rounded-xl border border-sky-500/25 bg-sky-500/10 px-3.5 py-2">
                <span className="text-xs text-slate-300">
                  Panel Avg Score:
                </span>
                <span className="font-mono text-sm font-bold text-sky-300">
                  {averagePanelScore} / 100
                </span>
              </div>
            )}
          </div>

          {evaluations.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-white/10 bg-slate-950/60 p-8 text-center">
              <p className="text-xs font-medium text-slate-300">
                No evaluations submitted yet
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {evaluations.map((evalItem) => {
                const interviewer = evalItem.interviewerId || {};
                const isReviewed = evalItem.status === "REVIEWED";
                const isReviewing = reviewingId === evalItem._id;
                const strengthsList = toTextPoints(evalItem.strengths);
                const weaknessesList = toTextPoints(evalItem.weaknesses);
                const feedbackText =
                  evalItem.feedback || evalItem.detailedFeedback || "";

                return (
                  <div
                    key={evalItem._id}
                    className="rounded-2xl border border-white/10 bg-slate-950 p-5 space-y-4"
                  >
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-500/25 bg-sky-500/10 text-xs font-bold text-sky-300">
                          {(interviewer.name || "I")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {interviewer.name || "Interviewer"}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {interviewer.email || "Panel Member"} •{" "}
                            {formatDateTime(
                              evalItem.submittedAt || evalItem.updatedAt
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-lg border border-white/10 bg-slate-900 px-3 py-1 font-mono text-xs font-bold text-white">
                          Score: {evalItem.overallScore ?? 0}/100
                        </span>

                        {evalItem.recommendation && (
                          <span
                            className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold ${getRecommendationBadge(
                              evalItem.recommendation
                            )}`}
                          >
                            {evalItem.recommendation}
                          </span>
                        )}

                        {isReviewed ? (
                          <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                            <CheckCircle2 size={12} />
                            REVIEWED
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={isReviewing}
                            onClick={() =>
                              handleReviewEvaluation(evalItem._id)
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500 px-3 py-1 text-xs font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-50"
                          >
                            {isReviewing ? (
                              <Loader2
                                size={12}
                                className="animate-spin"
                              />
                            ) : (
                              <CheckCircle2 size={12} />
                            )}
                            Mark as Reviewed
                          </button>
                        )}
                      </div>
                    </div>

                    {Array.isArray(evalItem.skillScores) &&
                      evalItem.skillScores.length > 0 && (
                        <div>
                          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Skill Scores
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {evalItem.skillScores.map((s, idx) => (
                              <span
                                key={idx}
                                className="rounded-lg border border-white/10 bg-slate-900 px-2.5 py-1 text-xs text-slate-200"
                              >
                                {s.skill}:{" "}
                                <strong className="text-sky-300">
                                  {s.score}/{s.maxScore || 5}
                                </strong>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    {(strengthsList.length > 0 ||
                      weaknessesList.length > 0) && (
                      <div className="grid gap-3 md:grid-cols-2">
                        {strengthsList.length > 0 && (
                          <div className="rounded-xl border border-white/5 bg-slate-900/70 p-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                              Strengths
                            </p>
                            <ul className="mt-1.5 space-y-1 text-xs text-slate-300">
                              {strengthsList.map((str, i) => (
                                <li key={i}>• {str}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {weaknessesList.length > 0 && (
                          <div className="rounded-xl border border-white/5 bg-slate-900/70 p-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                              Areas of Improvement
                            </p>
                            <ul className="mt-1.5 space-y-1 text-xs text-slate-300">
                              {weaknessesList.map((w, i) => (
                                <li key={i}>• {w}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {feedbackText && (
                      <div className="rounded-xl border border-white/5 bg-slate-900/50 p-3 text-xs leading-relaxed text-slate-300">
                        <span className="font-semibold text-white">
                          Feedback:{" "}
                        </span>
                        {feedbackText}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-900 p-5 sm:p-6">
          <h2 className="mb-4 text-sm font-semibold text-white">
            Assigned Interviewers
          </h2>

          <AssignedInterviewerCards
            interviewers={interview.interviewers}
          />
        </section>

        {![
          "COMPLETED",
          "CANCELLED",
          "NO_SHOW",
        ].includes(interview.status) && (
          <InterviewerSelector
            interviewId={interview._id}
            initialAssigned={interview.interviewers}
            onAssigned={(updated) => {
              setInterview(updated);
            }}
          />
        )}
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
        <Icon
          size={14}
          className="text-slate-500"
        />
        <p className="text-[10px] uppercase tracking-wide text-slate-500">
          {label}
        </p>
      </div>

      <p className="mt-1.5 text-xs text-slate-200 font-medium">
        {value}
      </p>
    </div>
  );
}
