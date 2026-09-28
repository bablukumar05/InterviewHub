import { useCallback, useEffect, useState } from "react";
import {
  ScrollText,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  AlertCircle,
  Clock,
  Shield,
} from "lucide-react";
import api from "../../api/axios";

const ENTITIES = [
  "USER",
  "JOB",
  "APPLICATION",
  "INTERVIEW",
  "EVALUATION",
  "OFFER",
  "ORGANIZATION",
];

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [actionSearch, setActionSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("");

  const fetchLogs = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError("");

        const params = { limit: 50 };
        if (entityFilter) params.entity = entityFilter;
        if (actionSearch.trim()) params.action = actionSearch.trim();

        const res = await api.get("/audit-logs", { params });
        const rawLogs =
          res?.data?.data?.logs ||
          res?.data?.logs ||
          res?.data?.data ||
          [];
        setLogs(Array.isArray(rawLogs) ? rawLogs : []);
      } catch (err) {
        setError(
          err?.response?.data?.message || "Failed to load system audit logs."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [entityFilter, actionSearch]
  );

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Activity Logs
        </h1>

        <button
          type="button"
          onClick={() => fetchLogs(true)}
          disabled={loading || refreshing}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-white/15 bg-slate-950/75 backdrop-blur-xl px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-900 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw
            size={14}
            className={refreshing ? "animate-spin text-sky-400" : ""}
          />
          Refresh
        </button>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-white/15 bg-slate-950/75 backdrop-blur-xl p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={actionSearch}
            onChange={(e) => setActionSearch(e.target.value)}
            placeholder="Filter by action (e.g. LOGIN, CREATE, UPDATE, SUBMIT)..."
            className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-slate-500 focus:border-sky-500/50 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-sky-400" />
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-slate-900/90 px-3 py-2.5 text-xs text-slate-200 focus:border-sky-500/50 focus:outline-none"
          >
            <option value="">All Modules</option>
            {ENTITIES.map((entity) => (
              <option key={entity} value={entity}>
                {entity}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-300">
          <Loader2 size={32} className="animate-spin text-sky-400" />
          <span className="text-sm">Loading activity...</span>
        </div>
      ) : error ? (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-sm text-rose-300">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-2xl border border-white/15 bg-slate-950/75 backdrop-blur-xl p-12 text-center">
          <ScrollText size={36} className="mx-auto mb-3 text-slate-500" />
          <h3 className="text-base font-medium text-white">
            No activity logs found
          </h3>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => {
            const actor = log.user || log.userId || {};

            return (
              <div
                key={log._id}
                className="flex flex-col justify-between gap-4 rounded-2xl border border-white/15 bg-slate-950/75 backdrop-blur-xl p-4 shadow-lg sm:flex-row sm:items-center sm:px-5 transition hover:border-sky-400/30"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-lg border border-sky-500/30 bg-sky-500/15 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-sky-300">
                      <Shield size={11} />
                      {log.action}
                    </span>
                    <span className="rounded-lg border border-white/15 bg-slate-900/90 px-2.5 py-0.5 font-mono text-[11px] text-slate-200">
                      {log.entity}
                    </span>
                    {actor.role && (
                      <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                        {actor.role}
                      </span>
                    )}
                  </div>

                  <div className="text-sm font-semibold text-white">
                    {log.description}
                  </div>

                  <div className="text-xs text-slate-400">
                    By{" "}
                    <strong className="text-slate-200">
                      {actor.name || "System"}
                    </strong>{" "}
                    {actor.email ? `(${actor.email})` : ""} • IP:{" "}
                    <span className="font-mono text-slate-300">
                      {log.ipAddress || log.ip || "127.0.0.1"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-300 sm:self-center">
                  <Clock size={13} className="text-sky-400" />
                  <span>
                    {log.createdAt
                      ? new Date(log.createdAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })
                      : "—"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
