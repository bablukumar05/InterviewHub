import { useMemo } from "react";
import QuestionSearch from "./QuestionSearch";
import QuestionFilters from "./QuestionFilters";
import QuestionList from "./QuestionList";
import QuestionEmptyState from "./QuestionEmptyState";

const QuestionPicker = ({
  questions = [],
  selectedIds = [],
  onSelectionChange,
  search = "",
  onSearchChange,
  filters = {},
  onFiltersChange,
  filterOptions = {},
  loading = false,
}) => {
  const selectedSet = useMemo(
    () => new Set(selectedIds),
    [selectedIds]
  );

  const toggleQuestion = (
    question
  ) => {
    const next = new Set(selectedSet);

    if (next.has(question._id)) {
      next.delete(question._id);
    } else {
      next.add(question._id);
    }

    onSelectionChange?.([
      ...next,
    ]);
  };

  return (
    <div className="space-y-4">
      <QuestionSearch
        value={search}
        onChange={onSearchChange}
      />

      <QuestionFilters
        filters={filters}
        onChange={onFiltersChange}
        {...filterOptions}
      />

      {questions.length === 0 &&
      !loading ? (
        <QuestionEmptyState />
      ) : (
        <QuestionList
          questions={questions}
          loading={loading}
          selectable
          selectedIds={selectedIds}
          onSelect={toggleQuestion}
        />
      )}
    </div>
  );
};

export default QuestionPicker;
