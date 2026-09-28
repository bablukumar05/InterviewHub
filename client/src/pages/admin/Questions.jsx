import { useCallback, useEffect, useState } from "react";
import {
  ClipboardList,
  Plus,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  X,
} from "lucide-react";
import {
  getQuestions,
  createQuestion,
  activateQuestion,
  deactivateQuestion,
} from "../../api/questionApi";
import { useAuth } from "../../context/AuthContext";

const QUESTION_TYPES = [
  "TECHNICAL",
  "CODING",
  "SYSTEM_DESIGN",
  "BEHAVIORAL",
  "SITUATIONAL",
];

const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"];

const INITIAL_FORM = {
  title: "",
  description: "",
  expectedAnswer: "",
  evaluationGuidance: "",
  field: "Software Engineering",
  role: "Full Stack Engineer",
  category: "Backend",
  type: "TECHNICAL",
  difficulty: "MEDIUM",
  skillsText: "",
};

export default function QuestionBankPage() {
  const { user } = useAuth();
  const canManage = ["ADMIN", "RECRUITER", "INTERVIEWER"].includes(user?.role);

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [type, setType] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState(INITIAL_FORM);

  const loadQuestions = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError("");

        const params = { limit: 50 };
        if (search.trim()) params.search = search.trim();
        if (difficulty) params.difficulty = difficulty;
        if (type) params.type = type;

        const res = await getQuestions(params);
        const rawList =
          res?.data?.items ||
          res?.items ||
          res?.data ||
          [];
        setQuestions(Array.isArray(rawList) ? rawList : []);
      } catch (err) {
        setError(
          err?.response?.data?.message || "Unable to load question library."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, difficulty, type]
  );

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleToggleActive = async (question) => {
    try {
      if (question.isActive !== false) {
        await deactivateQuestion(question._id);
      } else {
        await activateQuestion(question._id);
      }
      await loadQuestions(true);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update question status.");
    }
  };

  const handleCreateSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!form.title.trim()) {
      setFormError("Question title is required.");
      return;
    }

    try {
      setSaving(true);
      const skills = form.skillsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await createQuestion({
        title: form.title.trim(),
        description: form.description.trim(),
        expectedAnswer: form.expectedAnswer.trim(),
        evaluationGuidance: form.evaluationGuidance.trim(),
        field: form.field.trim() || "Engineering",
        role: form.role.trim() || "Software Engineer",
        category: form.category.trim() || "General",
        type: form.type,
        difficulty: form.difficulty,
        skills,
        tags: skills,
      });

      setForm(INITIAL_FORM);
      setModalOpen(false);
      await loadQuestions(true);
    } catch (err) {
      setFormError(
        err?.response?.data?.message || "Failed to create question."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Question Bank
        </h1>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => loadQuestions(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={refreshing ? "animate-spin text-sky-400" : ""}
            />
            Refresh
          </button>

          {canManage && (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-sky-400"
            >
              <Plus size={15} />
              Add Question
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-3 rounded-2xl border border-white/10 bg-slate-900 p-4 md:grid-cols-4">
        <div className="relative md:col-span-2">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, skill, category, or role..."
            className="w-full rounded-xl border border-white/10 bg-slate-950 py-2 pl-10 pr-4 text-xs text-white placeholder:text-slate-500 focus:border-sky-500/50 focus:outline-none"
          />
        </div>

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-slate-300 focus:border-sky-500/50 focus:outline-none"
        >
          <option value="">All Difficulties</option>
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-slate-300 focus:border-sky-500/50 focus:outline-none"
        >
          <option value="">All Question Types</option>
          {QUESTION_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
          <Loader2 size={32} className="animate-spin text-sky-400" />
          <span className="text-sm">Loading question bank...</span>
        </div>
      ) : error ? (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-sm text-rose-300">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : questions.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-12 text-center">
          <ClipboardList size={36} className="mx-auto mb-3 text-slate-600" />
          <h3 className="text-base font-medium text-white">
            No questions found
          </h3>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => {
            const isExpanded = expandedId === q._id;
            const diffBadge =
              q.difficulty === "HARD"
                ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
                : q.difficulty === "EASY"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-amber-500/30 bg-amber-500/10 text-amber-300";

            return (
              <div
                key={q._id}
                className="rounded-2xl border border-white/10 bg-slate-900 p-5 transition hover:border-white/20"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-lg border px-2.5 py-0.5 text-[10px] font-bold ${diffBadge}`}
                      >
                        {q.difficulty}
                      </span>
                      <span className="rounded-lg border border-sky-500/25 bg-sky-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-sky-300">
                        {q.type}
                      </span>
                      {q.category && (
                        <span className="rounded-lg border border-white/10 bg-slate-950 px-2.5 py-0.5 text-[10px] text-slate-300">
                          {q.category}
                        </span>
                      )}
                      {q.role && (
                        <span className="text-[11px] text-slate-400">
                          • {q.role}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-semibold text-white">
                      {q.title}
                    </h3>

                    {q.description && (
                      <p className="text-xs leading-relaxed text-slate-400">
                        {q.description}
                      </p>
                    )}

                    {Array.isArray(q.skills) && q.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {q.skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-md border border-white/10 bg-slate-950 px-2 py-0.5 text-[10px] text-slate-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : q._id)
                      }
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-white/20 hover:text-white"
                    >
                      {isExpanded ? (
                        <>
                          Hide Answer
                          <ChevronUp size={14} />
                        </>
                      ) : (
                        <>
                          Show Answer
                          <ChevronDown size={14} />
                        </>
                      )}
                    </button>

                    {canManage && (
                      <button
                        type="button"
                        onClick={() => handleToggleActive(q)}
                        className={`inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                          q.isActive !== false
                            ? "border-rose-500/25 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                            : "border-emerald-500/25 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                        }`}
                      >
                        {q.isActive !== false ? (
                          <>
                            <XCircle size={13} />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={13} />
                            Activate
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 md:grid-cols-2">
                    <div className="rounded-xl border border-white/10 bg-slate-950 p-3.5">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-sky-400">
                        Expected Answer
                      </p>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                        {q.expectedAnswer ||
                          "No reference answer provided for this question."}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-slate-950 p-3.5">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                        What to Check
                      </p>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                        {q.evaluationGuidance ||
                          "Check code clarity, edge cases, and practical understanding."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white">
                Add Interview Question
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              {formError && (
                <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-2.5 text-xs text-rose-300">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300">
                  Question Title *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="e.g. How would you build a basic API rate limiter using Redis?"
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-sky-500/50 focus:outline-none"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300">
                    Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, type: e.target.value }))
                    }
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-xs text-white"
                  >
                    {QUESTION_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300">
                    Difficulty
                  </label>
                  <select
                    value={form.difficulty}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        difficulty: e.target.value,
                      }))
                    }
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-xs text-white"
                  >
                    {DIFFICULTIES.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300">
                    Category
                  </label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    placeholder="Backend / System Design"
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300">
                    Role
                  </label>
                  <input
                    type="text"
                    value={form.role}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, role: e.target.value }))
                    }
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300">
                    Skills (comma separated)
                  </label>
                  <input
                    type="text"
                    value={form.skillsText}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        skillsText: e.target.value,
                      }))
                    }
                    placeholder="redis, distributed-systems, node.js"
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300">
                  Description / Context
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300">
                  Expected Answer
                </label>
                <textarea
                  rows={3}
                  value={form.expectedAnswer}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      expectedAnswer: e.target.value,
                    }))
                  }
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300">
                  What to Check
                </label>
                <textarea
                  rows={2}
                  value={form.evaluationGuidance}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      evaluationGuidance: e.target.value,
                    }))
                  }
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-white/10 bg-slate-950 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400 disabled:opacity-50"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
