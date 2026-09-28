import { Filter } from "lucide-react";

const QuestionFilters = ({
  filters = {},
  onChange,
  fields = [],
  categories = [],
  skills = [],
  types = [],
  difficulties = [],
}) => {
  const updateFilter = (
    key,
    value
  ) => {
    onChange?.({
      ...filters,
      [key]: value,
    });
  };

  const renderOptions = (
    options
  ) => {
    return options.map((option) => {
      const normalized =
        typeof option === "string"
          ? {
              value: option,
              label: option
                .replaceAll("_", " "),
            }
          : option;

      return (
        <option
          key={normalized.value}
          value={normalized.value}
        >
          {normalized.label}
        </option>
      );
    });
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="mb-4 flex items-center gap-2">
        <Filter
          size={16}
          className="text-sky-400"
        />

        <h3 className="text-sm font-semibold text-white">
          Question filters
        </h3>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <select
          value={filters.field || ""}
          onChange={(event) =>
            updateFilter(
              "field",
              event.target.value
            )
          }
          className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none"
        >
          <option value="">
            All fields
          </option>
          {renderOptions(fields)}
        </select>

        <select
          value={filters.category || ""}
          onChange={(event) =>
            updateFilter(
              "category",
              event.target.value
            )
          }
          className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none"
        >
          <option value="">
            All categories
          </option>
          {renderOptions(categories)}
        </select>

        <select
          value={filters.skill || ""}
          onChange={(event) =>
            updateFilter(
              "skill",
              event.target.value
            )
          }
          className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none"
        >
          <option value="">
            All skills
          </option>
          {renderOptions(skills)}
        </select>

        <select
          value={filters.difficulty || ""}
          onChange={(event) =>
            updateFilter(
              "difficulty",
              event.target.value
            )
          }
          className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none"
        >
          <option value="">
            All difficulty
          </option>
          {renderOptions(difficulties)}
        </select>

        <select
          value={filters.type || ""}
          onChange={(event) =>
            updateFilter(
              "type",
              event.target.value
            )
          }
          className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none"
        >
          <option value="">
            All types
          </option>
          {renderOptions(types)}
        </select>
      </div>
    </div>
  );
};

export default QuestionFilters;
