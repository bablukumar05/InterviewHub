import QuestionCard from "./QuestionCard";

const QuestionList = ({
  questions = [],
  loading = false,
  selectedIds = [],
  onSelect,
  onQuestionClick,
  selectable = false,
}) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-36 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {questions.map((question) => (
        <QuestionCard
          key={question._id}
          question={question}
          selectable={selectable}
          selected={selectedIds.includes(
            question._id
          )}
          onSelect={onSelect}
          onClick={onQuestionClick}
        />
      ))}
    </div>
  );
};

export default QuestionList;
