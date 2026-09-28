import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  ClipboardCheck,
  Printer,
  RefreshCw,
  Save,
  Send,
} from "lucide-react";

import {
  getInterviewById,
} from "../../api/interviewApi";

import {
  getQuestions,
  getQuestionFilters,
} from "../../api/questionApi";

import {
  createEvaluation,
  getInterviewEvaluations,
  updateEvaluation,
  submitEvaluation,
} from "../../api/evaluationApi";

import {
  QuestionLibrary,
  QuestionScore,
  QuestionNotes,
} from "../../components/questions";

import {
  EvaluationHeader,
  EvaluationSection,
  SkillScoreList,
  OverallScore,
  RecommendationSelector,
  StrengthsInput,
  WeaknessesInput,
  FeedbackTextarea,
  EvaluationStatusBadge,
  EvaluationSkeleton,
} from "../../components/evaluation";

const extractData = (response) => {
  return response?.data || response;
};

const extractQuestionItems = (response) => {
  const data = extractData(response);

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.questions)) {
    return data.questions;
  }

  return [];
};

const extractEvaluation = (response) => {
  const data = extractData(response);

  if (Array.isArray(data?.evaluations)) {
    return data.evaluations[0] || null;
  }

  if (data?.evaluation) {
    return data.evaluation;
  }

  if (data && data._id) {
    return data;
  }

  return null;
};

const extractInterview = (response) => {
  const data = extractData(response);

  return (
    data?.interview ||
    data
  );
};

const calculatePreviewScore = (
  skillScores = []
) => {
  if (!skillScores.length) {
    return 0;
  }

  const total =
    skillScores.reduce(
      (sum, item) => {
        const score =
          Number(item.score) || 0;

        const maxScore =
          Number(item.maxScore) || 5;

        return (
          sum +
          score / maxScore
        );
      },
      0
    );

  return Number(
    (
      (total /
        skillScores.length) *
      100
    ).toFixed(2)
  );
};

const InterviewerEvaluation = () => {
  const { id: interviewId } =
    useParams();

  const navigate = useNavigate();

  const [interview, setInterview] =
    useState(null);

  const [evaluation, setEvaluation] =
    useState(null);

  const [questions, setQuestions] =
    useState([]);

  const [filterOptions, setFilterOptions] =
    useState({
      fields: [],
      roles: [],
      categories: [],
      skills: [],
      tags: [],
    });

  const [selectedQuestionIds, setSelectedQuestionIds] =
    useState([]);

  const [questionScores, setQuestionScores] =
    useState({});

  const [questionNotes, setQuestionNotes] =
    useState({});

  const [skillScores, setSkillScores] =
    useState({});

  const [recommendation, setRecommendation] =
    useState("HOLD");

  const [strengths, setStrengths] =
    useState("");

  const [weaknesses, setWeaknesses] =
    useState("");

  const [feedback, setFeedback] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [filters, setFilters] =
    useState({});

  const [loading, setLoading] =
    useState(true);

  const [questionsLoading, setQuestionsLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const loadEvaluationContext =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const [
          interviewResponse,
          evaluationResponse,
        ] = await Promise.all([
          getInterviewById(
            interviewId
          ),
          getInterviewEvaluations(
            interviewId
          ),
        ]);

        const interviewData =
          extractInterview(
            interviewResponse
          );

        const evaluationData =
          extractEvaluation(
            evaluationResponse
          );

        setInterview(
          interviewData
        );

        setEvaluation(
          evaluationData
        );

        if (evaluationData) {
          const existingQuestionIds =
            Array.isArray(
              evaluationData.questionScores
            )
              ? evaluationData.questionScores.map(
                  (item) =>
                    String(
                      item.questionId
                    )
                )
              : [];

          setSelectedQuestionIds(
            existingQuestionIds
          );

          const scores = {};

          const notes = {};

          (
            evaluationData.questionScores ||
            []
          ).forEach(
            (item) => {
              const key = String(
                item.questionId
              );

              scores[key] =
                item.score;

              notes[key] =
                item.notes || "";
            }
          );

          setQuestionScores(
            scores
          );

          setQuestionNotes(
            notes
          );

          const skillMap = {};

          (
            evaluationData.skillScores ||
            []
          ).forEach(
            (item) => {
              skillMap[
                item.skill
              ] = item.score;
            }
          );

          setSkillScores(
            skillMap
          );

          setRecommendation(
            evaluationData.recommendation ||
              "HOLD"
          );

          setStrengths(
            evaluationData.strengths ||
              ""
          );

          setWeaknesses(
            evaluationData.weaknesses ||
              ""
          );

          setFeedback(
            evaluationData.feedback ||
              ""
          );
        }
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            "Unable to load evaluation."
        );
      } finally {
        setLoading(false);
      }
    }, [interviewId]);

  useEffect(() => {
    loadEvaluationContext();
  }, [loadEvaluationContext]);

  const loadQuestions = useCallback(
    async () => {
      try {
        setQuestionsLoading(true);

        const response =
          await getQuestions({
            page: 1,
            limit: 50,
            search:
              search || undefined,
            field:
              filters.field || undefined,
            role:
              filters.role || undefined,
            category:
              filters.category ||
              undefined,
            skill:
              filters.skill || undefined,
            type:
              filters.type || undefined,
            difficulty:
              filters.difficulty ||
              undefined,
            isActive: "true",
          });

        setQuestions(
          extractQuestionItems(
            response
          )
        );
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            "Unable to load question library."
        );
      } finally {
        setQuestionsLoading(false);
      }
    },
    [
      search,
      filters,
    ]
  );

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  useEffect(() => {
    const loadFilterOptions =
      async () => {
        try {
          const response =
            await getQuestionFilters();

          const data =
            extractData(
              response
            );

          setFilterOptions(
            data || {}
          );
        } catch {}
      };

    loadFilterOptions();
  }, []);

  const availableQuestions =
    useMemo(() => {
      const map =
        new Map();

      questions.forEach(
        (question) => {
          map.set(
            String(
              question._id
            ),
            question
          );
        }
      );

      if (
        evaluation?.questionScores
      ) {
        evaluation.questionScores.forEach(
          (item) => {
            const key =
              String(
                item.questionId
              );

            if (!map.has(key)) {
              map.set(key, {
                _id:
                  item.questionId,
                title:
                  item.questionText,
                skills:
                  item.skill
                    ? [
                        item.skill,
                      ]
                    : [],
                type:
                  "TECHNICAL",
                difficulty:
                  "MEDIUM",
                category:
                  "Historical",
                tags: [],
              });
            }
          }
        );
      }

      return [
        ...map.values(),
      ];
    }, [
      questions,
      evaluation,
    ]);

  const handleQuestionSelection =
    (nextIds) => {
      setSelectedQuestionIds(
        nextIds
      );

      setSuccess("");
    };

  const handleQuestionScoreChange =
    (
      questionId,
      score
    ) => {
      setQuestionScores(
        (current) => ({
          ...current,
          [questionId]: score,
        })
      );

      setSuccess("");
    };

  const handleQuestionNoteChange =
    (
      questionId,
      event
    ) => {
      setQuestionNotes(
        (current) => ({
          ...current,
          [questionId]:
            event.target.value,
        })
      );

      setSuccess("");
    };

  const handleSkillScoreChange =
    (
      skill,
      score
    ) => {
      setSkillScores(
        (current) => ({
          ...current,
          [skill]:
            score,
        })
      );

      setSuccess("");
    };

  const selectedQuestions =
    useMemo(() => {
      const selected =
        new Set(
          selectedQuestionIds
        );

      return availableQuestions.filter(
        (question) =>
          selected.has(
            String(
              question._id
            )
          )
      );
    }, [
      availableQuestions,
      selectedQuestionIds,
    ]);

  const evaluationSkills =
    useMemo(() => {
      const skillSet =
        new Set();

      selectedQuestions.forEach(
        (question) => {
          (
            question.skills ||
            []
          ).forEach(
            (skill) => {
              if (skill) {
                skillSet.add(
                  String(skill)
                    .trim()
                    .toLowerCase()
                );
              }
            }
          );
        }
      );

      Object.keys(
        skillScores
      ).forEach(
        (skill) =>
          skillSet.add(skill)
      );

      return [
        ...skillSet,
      ];
    }, [
      selectedQuestions,
      skillScores,
    ]);

  const normalizedSkillScores =
    useMemo(
      () =>
        evaluationSkills
          .filter(
            (skill) =>
              skillScores[skill] !==
              undefined
          )
          .map(
            (skill) => ({
              skill,
              score:
                Number(
                  skillScores[
                    skill
                  ]
                ) || 0,
              maxScore: 5,
            })
          ),
      [
        evaluationSkills,
        skillScores,
      ]
    );

  const previewOverallScore =
    calculatePreviewScore(
      normalizedSkillScores
    );

  const buildPayload = () => {
    return {
      interviewId,

      questionScores:
        selectedQuestions
          .map((question) => ({
            questionId:
              question._id,

            score:
              Number(
                questionScores[
                  String(
                    question._id
                  )
                ] || 0
              ),

            skill:
              question.skills?.[0] ||
              undefined,

            notes:
              questionNotes[
                String(
                  question._id
                )
              ] || "",
          }))
          .filter(
            (item) =>
              item.score >= 0
          ),

      skillScores:
        normalizedSkillScores.map(
          (item) => ({
            skill:
              item.skill,
            score:
              item.score,
            comment: "",
          })
        ),

      recommendation,

      strengths,

      weaknesses,

      feedback,
    };
  };

  const handleSaveDraft =
    async () => {
      try {
        setSaving(true);
        setError("");
        setSuccess("");

        const payload =
          buildPayload();

        let response;

        if (evaluation?._id) {
          response =
            await updateEvaluation(
              evaluation._id,
              payload
            );
        } else {
          response =
            await createEvaluation(
              payload
            );
        }

        const saved =
          extractEvaluation(
            response
          );

        setEvaluation(
          saved
        );

        setSuccess(
          "Evaluation draft saved successfully."
        );
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            "Unable to save evaluation."
        );
      } finally {
        setSaving(false);
      }
    };

  const handleSubmit =
    async () => {
      if (
        interview?.status !==
        "COMPLETED"
      ) {
        setError(
          "The interview must be completed before the evaluation can be submitted."
        );

        return;
      }

      if (
        normalizedSkillScores.length ===
        0
      ) {
        setError(
          "Add at least one skill score before submitting."
        );

        return;
      }

      try {
        setSubmitting(true);
        setError("");
        setSuccess("");

        let currentEvaluation =
          evaluation;

        if (
          !currentEvaluation?._id
        ) {
          const createResponse =
            await createEvaluation(
              buildPayload()
            );

          currentEvaluation =
            extractEvaluation(
              createResponse
            );

          setEvaluation(
            currentEvaluation
          );
        } else {
          const updateResponse =
            await updateEvaluation(
              currentEvaluation._id,
              buildPayload()
            );

          currentEvaluation =
            extractEvaluation(
              updateResponse
            );

          setEvaluation(
            currentEvaluation
          );
        }

        const response =
          await submitEvaluation(
            currentEvaluation._id,
            {
              recommendation,
              strengths,
              weaknesses,
              feedback,
            }
          );

        const submitted =
          extractEvaluation(
            response
          );

        setEvaluation(
          submitted
        );

        setSuccess(
          "Evaluation submitted successfully."
        );
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            "Unable to submit evaluation."
        );
      } finally {
        setSubmitting(false);
      }
    };

  if (loading) {
    return (
      <EvaluationSkeleton />
    );
  }

  if (
    error &&
    !interview
  ) {
    return (
      <div className="space-y-5">
        <Link
          to={`/interviewer/interviews/${interviewId}`}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to interview
        </Link>

        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5 text-sm text-rose-300">
          {error}
        </div>
      </div>
    );
  }

  const isLocked =
    ["SUBMITTED", "REVIEWED"].includes(
      evaluation?.status
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to={`/interviewer/interviews/${interviewId}`}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to interview
        </Link>

        <div className="flex items-center gap-3">
          {evaluation?.status && (
            <EvaluationStatusBadge
              status={
                evaluation.status
              }
            />
          )}

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/10"
          >
            <Printer size={15} />
            Print Scorecard
          </button>

          <button
            type="button"
            onClick={
              loadEvaluationContext
            }
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/10"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>
      </div>

      <EvaluationHeader
        candidateName={
          interview?.candidateId?.name ||
          interview?.candidateId?.firstName ||
          "Candidate"
        }
        jobTitle={
          interview?.jobId?.title ||
          "Interview"
        }
        roundName={
          interview?.roundName
        }
        status={
          evaluation?.status ||
          "DRAFT"
        }
      />

      {error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          {success}
        </div>
      )}

      {isLocked && (
        <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 text-sm text-sky-200">
          This evaluation has already been submitted and
          is now read-only.
        </div>
      )}

      {!isLocked && (
        <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
          <EvaluationSection title="Pick Questions">
            <QuestionLibrary
              questions={
                questions
              }
              selectedIds={
                selectedQuestionIds
              }
              onSelectionChange={
                handleQuestionSelection
              }
              search={search}
              onSearchChange={
                setSearch
              }
              filters={
                filters
              }
              onFiltersChange={
                setFilters
              }
              filterOptions={{
                fields:
                  filterOptions.fields ||
                  [],
                roles:
                  filterOptions.roles ||
                  [],
                categories:
                  filterOptions.categories ||
                  [],
                skills:
                  filterOptions.skills ||
                  [],
                types: [
                  "TECHNICAL",
                  "CODING",
                  "SYSTEM_DESIGN",
                  "BEHAVIORAL",
                  "HR",
                  "SCENARIO",
                  "CONCEPTUAL",
                  "CASE_STUDY",
                ],
                difficulties: [
                  "EASY",
                  "MEDIUM",
                  "HARD",
                  "EXPERT",
                ],
              }}
              loading={
                questionsLoading
              }
            />
          </EvaluationSection>

          <EvaluationSection title="Interview Questions">
            {selectedQuestions.length ===
            0 ? (
              <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
                <BookOpen
                  size={32}
                  className="mx-auto text-slate-600"
                />

                <p className="mt-3 text-sm font-medium text-slate-300">
                  No questions selected
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedQuestions.map(
                  (
                    question,
                    index
                  ) => {
                    const key =
                      String(
                        question._id
                      );

                    return (
                      <div
                        key={key}
                        className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-xs text-slate-500">
                            {index + 1}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium leading-6 text-white">
                              {
                                question.title
                              }
                            </p>

                            {question.skills?.length >
                              0 && (
                              <p className="mt-1 text-xs text-slate-500">
                                Skills:{" "}
                                {question.skills.join(
                                  ", "
                                )}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                          <QuestionScore
                            value={
                              questionScores[
                                key
                              ] ?? ""
                            }
                            onChange={(
                              value
                            ) =>
                              handleQuestionScoreChange(
                                key,
                                value
                              )
                            }
                          />

                          <QuestionNotes
                            value={
                              questionNotes[
                                key
                              ] || ""
                            }
                            onChange={(
                              event
                            ) =>
                              handleQuestionNoteChange(
                                key,
                                event
                              )
                            }
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </EvaluationSection>
        </div>
      )}

      <EvaluationSection title="Rate Skills (1–5)">
        {evaluationSkills.length ===
        0 ? (
          <p className="text-sm text-slate-500">
            No skills selected yet.
          </p>
        ) : (
          <SkillScoreList
            skills={
              evaluationSkills
            }
            values={
              skillScores
            }
            onChange={
              isLocked
                ? undefined
                : handleSkillScoreChange
            }
          />
        )}
      </EvaluationSection>

      <EvaluationSection title="Final Score & Decision">
        <OverallScore
          score={
            evaluation?.overallScore ??
            previewOverallScore
          }
        />

        <div className="mt-5">
          <RecommendationSelector
            value={
              evaluation?.recommendation ??
              recommendation
            }
            onChange={
              isLocked
                ? undefined
                : setRecommendation
            }
          />
        </div>
      </EvaluationSection>

      <EvaluationSection title="Detailed Feedback">
        <div className="grid gap-5 lg:grid-cols-2">
          <StrengthsInput
            value={
              evaluation?.strengths ??
              strengths
            }
            onChange={
              isLocked
                ? undefined
                : setStrengths
            }
          />

          <WeaknessesInput
            value={
              evaluation?.weaknesses ??
              weaknesses
            }
            onChange={
              isLocked
                ? undefined
                : setWeaknesses
            }
          />
        </div>

        <div className="mt-5">
          <FeedbackTextarea
            value={
              evaluation?.feedback ??
              feedback
            }
            onChange={
              isLocked
                ? undefined
                : setFeedback
            }
          />
        </div>
      </EvaluationSection>

      {!isLocked && (
        <div className="sticky bottom-4 z-10 rounded-2xl border border-white/10 bg-slate-950/95 p-4 shadow-2xl backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-white">
              {evaluation
                ? "Evaluation draft"
                : "New evaluation"}
            </p>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={
                  handleSaveDraft
                }
                disabled={
                  saving ||
                  submitting
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/10 disabled:opacity-50"
              >
                <Save size={16} />
                {saving
                  ? "Saving..."
                  : "Save Draft"}
              </button>

              <button
                type="button"
                onClick={
                  handleSubmit
                }
                disabled={
                  submitting ||
                  saving ||
                  interview?.status !==
                    "COMPLETED"
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={16} />

                {submitting
                  ? "Submitting..."
                  : "Submit Evaluation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewerEvaluation;
