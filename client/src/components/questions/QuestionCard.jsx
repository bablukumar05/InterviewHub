import {
  BookOpen,
  ChevronRight,
} from "lucide-react";

import QuestionTypeBadge from "./QuestionTypeBadge";
import DifficultyBadge from "./DifficultyBadge";
import QuestionCategoryBadge from "./QuestionCategoryBadge";
import QuestionTags from "./QuestionTags";

const QuestionCard = ({
  question,
  onClick,
  selectable = false,
  selected = false,
  onSelect,
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(question);
    }
  };

  return (
    <article
      className={`group rounded-2xl border p-5 transition ${
        selected
          ? "border-sky-500/40 bg-sky-500/[0.06]"
          : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
      }`}
    >
      <div className="flex items-start gap-4">
        {selectable && (
          <input
            type="checkbox"
            checked={selected}
            onChange={() =>
              onSelect?.(question)
            }
            className="mt-1 h-4 w-4 accent-sky-500"
          />
        )}

        <div className="flex min-w-0 flex-1 gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04]">
            <BookOpen
              size={18}
              className="text-sky-400"
            />
          </div>

          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={handleClick}
              className="text-left"
            >
              <h3 className="font-semibold text-white transition group-hover:text-sky-300">
                {question.title}
              </h3>
            </button>

            {question.description && (
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                {question.description}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <QuestionTypeBadge
                type={question.type}
              />

              <DifficultyBadge
                difficulty={question.difficulty}
              />

              <QuestionCategoryBadge
                category={question.category}
              />
            </div>

            <div className="mt-4">
              <QuestionTags
                tags={question.tags}
              />
            </div>
          </div>
        </div>

        {!selectable && (
          <button
            type="button"
            onClick={handleClick}
            className="shrink-0 rounded-lg p-2 text-slate-600 transition hover:bg-white/10 hover:text-white"
            aria-label="View question"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </article>
  );
};

export default QuestionCard;
