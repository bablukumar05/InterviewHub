import { HelpCircle } from "lucide-react";

const QuestionEmptyState = ({
  title = "No questions found",
  message = "Try changing your filters or search query.",
  action,
}) => {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-14 text-center">
      <HelpCircle
        size={36}
        className="mx-auto text-slate-600"
      />

      <h3 className="mt-4 text-lg font-semibold text-white">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
        {message}
      </p>

      {action && (
        <div className="mt-5">
          {action}
        </div>
      )}
    </div>
  );
};

export default QuestionEmptyState;
