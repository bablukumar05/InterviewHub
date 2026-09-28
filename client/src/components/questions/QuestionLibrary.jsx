import QuestionPicker from "./QuestionPicker";

const QuestionLibrary = ({
  questions,
  selectedIds = [],
  onSelectionChange,
  search,
  onSearchChange,
  filters,
  onFiltersChange,
  filterOptions,
  loading,
}) => {
  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          Question Library
        </h2>

        <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-400">
          {selectedIds.length} selected
        </span>
      </div>

      <QuestionPicker
        questions={questions}
        selectedIds={selectedIds}
        onSelectionChange={
          onSelectionChange
        }
        search={search}
        onSearchChange={onSearchChange}
        filters={filters}
        onFiltersChange={
          onFiltersChange
        }
        filterOptions={
          filterOptions
        }
        loading={loading}
      />
    </section>
  );
};

export default QuestionLibrary;
