import {
  Check,
  Loader2,
  RefreshCw,
  Search,
  UserRound,
  X,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import {
  assignInterviewers,
  getInterviewerOptions,
} from "../../api/interviewApi";

const getDisplayName = (user) => {
  if (!user) return "Unknown interviewer";

  return (
    user.name ||
    [user.firstName, user.lastName]
      .filter(Boolean)
      .join(" ") ||
    "Interviewer"
  );
};

export default function InterviewerSelector({
  interviewId,
  initialAssigned = [],
  onAssigned,
}) {
  const [items, setItems] = useState([]);

  const [selectedIds, setSelectedIds] = useState(
    initialAssigned
      .map((item) =>
        typeof item === "string"
          ? item
          : item?.userId?._id || item?.userId?.id || item?.userId
      )
      .filter(Boolean)
  );

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadOptions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getInterviewerOptions(interviewId);
      const data = response?.data || response;

      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to load interviewer availability."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!interviewId) return;

    loadOptions();
  }, [interviewId]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return items;
    }

    return items.filter((item) => {
      const user = item?.user || {};
      const name = getDisplayName(user).toLowerCase();
      const title = String(user?.title || "").toLowerCase();

      return name.includes(query) || title.includes(query);
    });
  }, [items, search]);

  const toggleInterviewer = (item) => {
    const id = item?.user?._id;
    if (!id) return;

    if (!item.isAvailable) {
      return;
    }

    setSelectedIds((current) => {
      if (current.includes(id)) {
        return current.filter((value) => value !== id);
      }
      return [...current, id];
    });
  };

  const removeSelected = (interviewerId) => {
    setSelectedIds((current) =>
      current.filter((id) => id !== interviewerId)
    );
  };

  const handleSave = async () => {
    if (selectedIds.length === 0) {
      setError("Select at least one interviewer.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await assignInterviewers(interviewId, selectedIds);
      const updatedInterview =
        response?.data?.interview || response?.interview || response?.data;

      onAssigned?.(updatedInterview);
      await loadOptions();
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to assign interviewers."
      );

      await loadOptions();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-white/10 bg-white/[0.02]">
        <div className="text-center">
          <Loader2
            size={26}
            className="mx-auto animate-spin text-indigo-400"
          />
          <p className="mt-3 text-sm text-slate-500">
            Checking interviewer availability...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900">
      <div className="border-b border-white/10 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Interview panel
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Select one or more available interviewers.
            </p>
          </div>

          <button
            type="button"
            onClick={loadOptions}
            disabled={loading || saving}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        <div className="relative mt-4">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search interviewer..."
            className="w-full rounded-lg border border-white/10 bg-slate-950 py-2.5 pl-9 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-400/40"
          />
        </div>
      </div>

      {error && (
        <div className="mx-5 mt-4 rounded-lg border border-red-400/15 bg-red-400/5 px-4 py-3">
          <div className="flex items-center gap-2">
            <X size={16} className="text-red-400" />
            <p className="text-xs text-red-300">{error}</p>
          </div>
        </div>
      )}

      {selectedIds.length > 0 && (
        <div className="border-b border-white/10 px-5 py-4">
          <p className="text-[11px] uppercase tracking-wide text-slate-600">
            Selected panel
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {selectedIds.map((selectedId) => {
              const selected = items.find(
                (item) => item?.user?._id === selectedId
              );

              if (!selected) {
                return null;
              }

              return (
                <button
                  key={selectedId}
                  type="button"
                  onClick={() => removeSelected(selectedId)}
                  className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1.5 text-xs text-indigo-300"
                >
                  {getDisplayName(selected.user)}
                  <X size={13} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="max-h-[420px] overflow-y-auto p-5">
        {filteredItems.length === 0 ? (
          <div className="py-10 text-center">
            <UserRound size={28} className="mx-auto text-slate-600" />
            <p className="mt-3 text-sm text-slate-400">
              No interviewers found.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => {
              const user = item.user || {};
              const id = user._id;
              const selected = selectedIds.includes(id);
              const busy = !item.isAvailable;

              return (
                <button
                  key={id}
                  type="button"
                  disabled={busy}
                  onClick={() => toggleInterviewer(item)}
                  className={[
                    "w-full rounded-xl border p-4 text-left transition",
                    busy
                      ? "cursor-not-allowed border-white/5 bg-white/[0.015] opacity-60"
                      : selected
                      ? "border-indigo-400/20 bg-indigo-400/[0.06]"
                      : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-800">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <UserRound size={18} className="text-slate-500" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        {getDisplayName(user)}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {user.title || user.department || "Interviewer"}
                      </p>
                    </div>

                    {selected ? (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500">
                        <Check size={15} className="text-white" />
                      </div>
                    ) : busy ? (
                      <span className="rounded-full border border-amber-400/15 bg-amber-400/5 px-2.5 py-1 text-[10px] font-medium text-amber-300">
                        Busy
                      </span>
                    ) : (
                      <span className="rounded-full border border-emerald-400/15 bg-emerald-400/5 px-2.5 py-1 text-[10px] font-medium text-emerald-300">
                        Available
                      </span>
                    )}
                  </div>

                  {busy && item.conflicts?.length > 0 && (
                    <div className="mt-3 rounded-lg border border-amber-400/10 bg-amber-400/[0.03] px-3 py-2">
                      <p className="text-xs text-amber-300">
                        Already booked for another interview at this time.
                      </p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          {selectedIds.length} interviewer
          {selectedIds.length !== 1 ? "s" : ""} selected
        </p>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || selectedIds.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check size={16} />
              Save Interview Panel
            </>
          )}
        </button>
      </div>
    </div>
  );
}
