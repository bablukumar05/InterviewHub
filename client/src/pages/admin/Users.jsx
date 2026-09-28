import { useCallback, useEffect, useState } from "react";
import {
  Users as UsersIcon,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  UserX,
  Mail,
  UserPlus,
  X,
  Lock,
  Briefcase,
  Building2,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const ROLES = ["ADMIN", "RECRUITER", "INTERVIEWER", "CANDIDATE"];

export default function AdminUsers() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "RECRUITER",
    title: "",
    department: "",
  });

  const fetchUsers = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError("");

        const params = { limit: 50 };
        if (roleFilter) params.role = roleFilter;
        if (search.trim()) params.search = search.trim();

        const res = await api.get("/users", { params });
        const rawList =
          res?.data?.data?.users ||
          res?.data?.users ||
          res?.data?.data ||
          [];
        setUsers(Array.isArray(rawList) ? rawList : []);
      } catch (err) {
        setError(
          err?.response?.data?.message || "Failed to load platform users."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [roleFilter, search]
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUpdateUser = async (targetUserId, payload) => {
    try {
      setUpdatingId(targetUserId);
      setSuccessMsg("");
      const res = await api.put(`/users/${targetUserId}/status`, payload);
      const updatedUser = res?.data?.data?.user || res?.data?.user;

      if (updatedUser) {
        setUsers((prev) =>
          prev.map((item) => (item._id === targetUserId ? updatedUser : item))
        );
        setSuccessMsg(
          `Updated ${updatedUser.name} (${updatedUser.role} · ${
            updatedUser.isActive !== false ? "Active" : "Inactive"
          })`
        );
      } else {
        await fetchUsers(true);
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update user.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateError("");
    setSuccessMsg("");

    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password) {
      setCreateError("Name, email, and password are required.");
      return;
    }

    if (newUser.password.length < 6) {
      setCreateError("Password must be at least 6 characters.");
      return;
    }

    try {
      setCreating(true);
      const res = await api.post("/users", newUser);
      const created = res?.data?.data?.user || res?.data?.user;

      if (created) {
        setUsers((prev) => [created, ...prev]);
      } else {
        await fetchUsers(true);
      }

      setSuccessMsg(
        `Added ${newUser.role} account for ${newUser.name.trim()} (${newUser.email.trim()})`
      );
      setIsAddOpen(false);
      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "RECRUITER",
        title: "",
        department: "",
      });
    } catch (err) {
      setCreateError(
        err?.response?.data?.message || "Failed to create team member."
      );
    } finally {
      setCreating(false);
    }
  };

  const stats = {
    total: users.length,
    active: users.filter((u) => u.isActive !== false).length,
    recruiters: users.filter((u) => u.role === "RECRUITER").length,
    interviewers: users.filter((u) => u.role === "INTERVIEWER").length,
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Team & Users
          </h1>
          <div className="mt-0.5 text-xs text-slate-200">
            Add new Recruiters or Interviewers, change roles, and manage account access
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setCreateError("");
              setIsAddOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-sky-300/40 bg-gradient-to-b from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 px-4 py-2.5 text-xs font-semibold text-white shadow-[0_0_20px_rgba(56,189,248,0.45)] transition-all cursor-pointer"
          >
            <UserPlus size={15} />
            <span>+ Add Recruiter / Interviewer</span>
          </button>

          <button
            type="button"
            onClick={() => fetchUsers(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 hover:bg-white/20 backdrop-blur-xl px-4 py-2.5 text-xs font-semibold text-white transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw
              size={14}
              className={refreshing ? "animate-spin text-sky-400" : "text-sky-300"}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-400/35 bg-emerald-500/15 backdrop-blur-xl px-4 py-3 text-xs font-medium text-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-300 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMsg("")}
            className="text-emerald-200/80 hover:text-white cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-white/15 bg-slate-950/75 backdrop-blur-xl p-4 shadow-lg">
          <span className="block text-xs font-medium text-slate-200">Total Users</span>
          <div className="mt-1 text-2xl font-bold text-white">{stats.total}</div>
        </div>
        <div className="rounded-2xl border border-white/15 bg-slate-950/75 backdrop-blur-xl p-4 shadow-lg">
          <span className="block text-xs font-medium text-emerald-300">Active Accounts</span>
          <div className="mt-1 text-2xl font-bold text-emerald-300">
            {stats.active}
          </div>
        </div>
        <div className="rounded-2xl border border-white/15 bg-slate-950/75 backdrop-blur-xl p-4 shadow-lg">
          <span className="block text-xs font-medium text-sky-300">Recruiters</span>
          <div className="mt-1 text-2xl font-bold text-sky-300">
            {stats.recruiters}
          </div>
        </div>
        <div className="rounded-2xl border border-white/15 bg-slate-950/75 backdrop-blur-xl p-4 shadow-lg">
          <span className="block text-xs font-medium text-indigo-300">Interviewers</span>
          <div className="mt-1 text-2xl font-bold text-indigo-300">
            {stats.interviewers}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-white/15 bg-slate-950/75 backdrop-blur-xl p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-300/80"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or title..."
            className="w-full rounded-xl border border-white/15 bg-slate-900/90 py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-slate-400 focus:border-sky-400/60 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-sky-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-white/15 bg-slate-900/90 px-3 py-2.5 text-xs text-slate-100 focus:border-sky-400/60 focus:outline-none"
          >
            <option value="">All Roles</option>
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-200">
          <Loader2 size={32} className="animate-spin text-sky-400" />
          <span className="text-sm">Loading users...</span>
        </div>
      ) : error ? (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-sm text-rose-300">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-2xl border border-white/15 bg-slate-950/75 backdrop-blur-xl p-12 text-center">
          <UsersIcon size={36} className="mx-auto mb-3 text-sky-400/70" />
          <h3 className="text-base font-medium text-white">No users found</h3>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/15 bg-slate-950/75 backdrop-blur-xl shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/10 bg-slate-900/85 text-[11px] font-semibold uppercase tracking-wider text-slate-200">
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Role (Click to Change)</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Joined</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-xs">
                {users.map((item) => {
                  const isSelf =
                    String(item._id) ===
                    String(currentUser?.id || currentUser?._id);
                  const isBusy = updatingId === item._id;

                  return (
                    <tr
                      key={item._id}
                      className="transition hover:bg-white/[0.04]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-sky-400/30 bg-sky-500/20 text-xs font-bold text-sky-300">
                            {item.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate font-semibold text-white">
                              {item.name}
                              {isSelf && (
                                <span className="ml-2 rounded bg-sky-500/20 px-1.5 py-0.5 text-[10px] text-sky-200 border border-sky-400/30">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="mt-0.5 flex items-center gap-1 truncate text-slate-300">
                              <Mail size={11} className="text-sky-300/80" />
                              {item.email}
                            </div>
                            {(item.title || item.department) && (
                              <div className="mt-0.5 text-[11px] text-sky-200/80 truncate">
                                {[item.title, item.department]
                                  .filter(Boolean)
                                  .join(" • ")}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <select
                          value={item.role}
                          disabled={isSelf || isBusy}
                          onChange={(e) =>
                            handleUpdateUser(item._id, {
                              role: e.target.value,
                            })
                          }
                          className="rounded-lg border border-white/20 bg-slate-900/90 px-2.5 py-1.5 text-xs font-semibold text-white focus:border-sky-400/60 focus:outline-none disabled:opacity-50 cursor-pointer"
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-5 py-4">
                        {item.isActive !== false ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                            <UserCheck size={12} />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/15 px-2.5 py-1 text-[11px] font-semibold text-rose-300">
                            <UserX size={12} />
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-slate-200">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )
                          : "—"}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          disabled={isSelf || isBusy}
                          onClick={() =>
                            handleUpdateUser(item._id, {
                              isActive: item.isActive === false,
                            })
                          }
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-40 cursor-pointer ${
                            item.isActive !== false
                              ? "border-rose-500/30 bg-rose-500/15 text-rose-300 hover:bg-rose-500/25"
                              : "border-emerald-500/30 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                          }`}
                        >
                          <ShieldCheck size={13} />
                          {item.isActive !== false ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-lg rounded-3xl border border-white/25 bg-slate-900/90 backdrop-blur-2xl p-6 sm:p-7 shadow-[0_32px_90px_rgba(2,6,23,0.9)] ring-1 ring-white/10 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-300/40 bg-gradient-to-b from-sky-400 to-blue-600 text-white shadow-[0_0_18px_rgba(56,189,248,0.45)]">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white">
                    Add New Team Member
                  </h2>
                  <div className="text-xs text-slate-200">
                    Create a Recruiter, Interviewer, or Admin in your organization
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="rounded-xl border border-white/15 bg-white/10 p-2 text-slate-200 hover:bg-white/20 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {createError && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/15 px-3.5 py-2.5 text-xs text-rose-200">
                <AlertCircle size={15} className="shrink-0 text-rose-300" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-100 mb-1.5">
                  Select Role *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {ROLES.map((r) => {
                    const active = newUser.role === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setNewUser((prev) => ({ ...prev, role: r }))}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          active
                            ? "border border-sky-300/40 bg-gradient-to-b from-sky-400 to-blue-600 text-white shadow-[0_0_15px_rgba(56,189,248,0.4)]"
                            : "border border-white/15 bg-slate-950/75 text-slate-200 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {r}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-100 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full rounded-xl border border-white/15 bg-slate-950/90 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-400 focus:border-sky-400/60 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-100 mb-1.5">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. priya@interviewhub.com"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="w-full rounded-xl border border-white/15 bg-slate-950/90 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-400 focus:border-sky-400/60 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-100 mb-1.5">
                  Temporary Password *
                </label>
                <div className="relative">
                  <Lock
                    size={14}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-300/80"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="Minimum 6 characters"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-white/15 bg-slate-950/90 py-2.5 pl-9 pr-10 text-xs text-white placeholder:text-slate-400 focus:border-sky-400/60 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-100 mb-1.5">
                    Job Title
                  </label>
                  <div className="relative">
                    <Briefcase
                      size={14}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-300/80"
                    />
                    <input
                      type="text"
                      placeholder={
                        newUser.role === "INTERVIEWER"
                          ? "e.g. Senior Backend Engineer"
                          : "e.g. Technical Recruiter"
                      }
                      value={newUser.title}
                      onChange={(e) =>
                        setNewUser((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-white/15 bg-slate-950/90 py-2.5 pl-9 pr-3.5 text-xs text-white placeholder:text-slate-400 focus:border-sky-400/60 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-100 mb-1.5">
                    Department
                  </label>
                  <div className="relative">
                    <Building2
                      size={14}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-300/80"
                    />
                    <input
                      type="text"
                      placeholder="e.g. Engineering / Talent"
                      value={newUser.department}
                      onChange={(e) =>
                        setNewUser((prev) => ({
                          ...prev,
                          department: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-white/15 bg-slate-950/90 py-2.5 pl-9 pr-3.5 text-xs text-white placeholder:text-slate-400 focus:border-sky-400/60 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="rounded-xl border border-white/25 bg-white/10 hover:bg-white/20 px-4 py-2.5 text-xs font-semibold text-white transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center gap-2 rounded-xl border border-sky-300/40 bg-gradient-to-b from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 px-5 py-2.5 text-xs font-semibold text-white shadow-[0_0_20px_rgba(56,189,248,0.45)] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {creating ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={14} />
                      <span>Create {newUser.role}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
