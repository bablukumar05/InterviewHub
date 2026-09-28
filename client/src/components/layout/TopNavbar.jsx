import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  Bell,
  Briefcase,
  CheckCheck,
  Trash2,
  RefreshCw,
  CalendarDays,
  ClipboardCheck,
  FileText,
  Sparkles,
  Check,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "../../api/notificationApi";
import UserMenu from "./UserMenu";

const formatRelativeTime = (dateValue) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";

  const diffSeconds = Math.max(
    Math.floor((Date.now() - date.getTime()) / 1000),
    0
  );

  if (diffSeconds < 60) return "Just now";
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const getNotificationIcon = (type = "") => {
  const normalized = String(type).toUpperCase();

  if (normalized.includes("INTERVIEW")) {
    return {
      Icon: CalendarDays,
      color: "border-sky-500/25 bg-sky-500/10 text-sky-400",
    };
  }
  if (normalized.includes("EVALUATION")) {
    return {
      Icon: ClipboardCheck,
      color: "border-emerald-500/25 bg-emerald-500/10 text-emerald-400",
    };
  }
  if (normalized.includes("OFFER") || normalized.includes("APPLICATION")) {
    return {
      Icon: FileText,
      color: "border-indigo-500/25 bg-indigo-500/10 text-indigo-400",
    };
  }

  return {
    Icon: Sparkles,
    color: "border-amber-500/25 bg-amber-500/10 text-amber-400",
  };
};

const TopNavbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);

  const dropdownRef = useRef(null);

  const loadNotifications = useCallback(async ({ silent = false } = {}) => {
    if (!localStorage.getItem("token")) return;

    try {
      if (!silent) {
        setLoading(true);
      }
      const res = await getNotifications({ limit: 20 });
      const data = res?.data || res || {};
      const list = Array.isArray(data.notifications)
        ? data.notifications
        : Array.isArray(data.items)
        ? data.items
        : [];

      setNotifications(list);

      const calculatedUnread =
        typeof data.unreadCount === "number"
          ? data.unreadCount
          : list.filter((item) => !item.read && !item.isRead).length;

      setUnreadCount(calculatedUnread);
    } catch {
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    loadNotifications({ silent: true });

    const interval = setInterval(() => {
      loadNotifications({ silent: true });
    }, 30000);

    return () => clearInterval(interval);
  }, [user, loadNotifications]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleToggleOpen = () => {
    const nextState = !open;
    setOpen(nextState);
    if (nextState) {
      loadNotifications();
    }
  };

  const handleMarkAsRead = async (notification, shouldNavigate = false) => {
    const isAlreadyRead = Boolean(notification.read || notification.isRead);

    if (!isAlreadyRead) {
      setNotifications((prev) =>
        prev.map((item) =>
          item._id === notification._id
            ? { ...item, read: true, isRead: true }
            : item
        )
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));

      try {
        await markNotificationRead(notification._id);
      } catch {
        loadNotifications({ silent: true });
      }
    }

    if (shouldNavigate && notification.link) {
      setOpen(false);
      navigate(notification.link);
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0 || actionBusy) return;

    setActionBusy(true);
    setNotifications((prev) =>
      prev.map((item) => ({ ...item, read: true, isRead: true }))
    );
    setUnreadCount(0);

    try {
      await markAllNotificationsRead();
    } catch {
      loadNotifications({ silent: true });
    } finally {
      setActionBusy(false);
    }
  };

  const handleDeleteNotification = async (event, notification) => {
    event.stopPropagation();

    const wasUnread = !notification.read && !notification.isRead;
    setNotifications((prev) =>
      prev.filter((item) => item._id !== notification._id)
    );
    if (wasUnread) {
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    }

    try {
      await deleteNotification(notification._id);
    } catch {
      loadNotifications({ silent: true });
    }
  };

  const handleClearAll = async () => {
    if (notifications.length === 0 || actionBusy) return;

    setActionBusy(true);
    const idsToDelete = notifications.map((n) => n._id);
    setNotifications([]);
    setUnreadCount(0);

    try {
      await Promise.all(idsToDelete.map((id) => deleteNotification(id)));
    } catch {
      loadNotifications({ silent: true });
    } finally {
      setActionBusy(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/20 bg-slate-900/55 backdrop-blur-2xl px-4 sm:px-8 shadow-lg">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-slate-900/80 p-2 text-slate-200 hover:bg-slate-800 hover:text-white lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link to="/dashboard" className="flex items-center gap-2 lg:hidden">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500 text-slate-950">
            <Briefcase className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-bold text-white">
            Interview<span className="text-sky-400">Hub</span>
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-2.5 min-w-0 rounded-xl border border-white/15 bg-slate-950/60 px-4 py-1.5">
          <span className="text-xs text-slate-300">InterviewHub Workspace</span>
          <span className="text-slate-600">•</span>
          <span className="truncate text-xs font-bold text-white">
            {user?.name}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {user?.role && (
          <span className="hidden sm:inline-flex items-center rounded-lg border border-sky-400/30 bg-sky-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-sky-300">
            {user.role}
          </span>
        )}

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={handleToggleOpen}
            aria-label="Notifications"
            aria-expanded={open}
            className={`relative rounded-xl border p-2 transition cursor-pointer ${
              open
                ? "border-sky-400/40 bg-sky-500/15 text-sky-300"
                : "border-white/15 bg-slate-950/70 text-slate-300 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-sky-500 px-1 text-[10px] font-bold text-slate-950 shadow">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="fixed inset-x-3 top-16 z-50 sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-96 overflow-hidden rounded-2xl border border-white/20 bg-slate-900/95 shadow-2xl backdrop-blur-2xl">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <span className="rounded-full border border-sky-500/30 bg-sky-500/15 px-2 py-0.5 text-[10px] font-semibold text-sky-300">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      disabled={actionBusy}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-slate-950 px-2 py-1 text-[11px] font-medium text-slate-300 transition hover:border-sky-500/30 hover:text-sky-300 disabled:opacity-50"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      Mark all read
                    </button>
                  )}

                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAll}
                      disabled={actionBusy}
                      title="Clear all notifications"
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-slate-950 px-2 py-1 text-[11px] font-medium text-slate-400 transition hover:border-rose-500/30 hover:text-rose-300 disabled:opacity-50"
                    >
                      <Trash2 className="h-3 w-3" />
                      Clear
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => loadNotifications()}
                    disabled={loading}
                    title="Refresh notifications"
                    className="rounded-lg border border-white/10 bg-slate-950 p-1 text-slate-400 transition hover:text-white disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${
                        loading ? "animate-spin text-sky-400" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto divide-y divide-white/5">
                {loading && notifications.length === 0 ? (
                  <div className="flex items-center justify-center gap-2 py-10 text-xs text-slate-400">
                    <RefreshCw className="h-4 w-4 animate-spin text-sky-400" />
                    Loading notifications...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-10 text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-slate-950 text-slate-500">
                      <Bell className="h-4 w-4" />
                    </div>
                    <div className="mt-3 text-xs font-semibold text-slate-200">
                      You&apos;re all caught up
                    </div>
                  </div>
                ) : (
                  notifications.map((item) => {
                    const isRead = Boolean(item.read || item.isRead);
                    const { Icon, color } = getNotificationIcon(item.type);

                    return (
                      <div
                        key={item._id}
                        onClick={() => handleMarkAsRead(item, true)}
                        className={`group flex cursor-pointer items-start gap-3 px-4 py-3.5 transition ${
                          isRead
                            ? "bg-transparent hover:bg-white/[0.03]"
                            : "bg-sky-500/[0.06] hover:bg-sky-500/[0.1]"
                        }`}
                      >
                        <div
                          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${color}`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <span
                              className={`text-xs leading-snug ${
                                isRead
                                  ? "font-medium text-slate-300"
                                  : "font-semibold text-white"
                              }`}
                            >
                              {item.title}
                            </span>
                            <span className="shrink-0 text-[10px] text-slate-500">
                              {formatRelativeTime(item.createdAt)}
                            </span>
                          </div>

                          <div className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-400">
                            {item.message}
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-1 self-center">
                          {!isRead && (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleMarkAsRead(item, false);
                              }}
                              title="Mark as read"
                              className="rounded-lg p-1 text-sky-400 transition hover:bg-sky-500/15"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={(event) =>
                              handleDeleteNotification(event, item)
                            }
                            title="Delete notification"
                            className="rounded-lg p-1 text-slate-500 opacity-70 transition hover:bg-rose-500/15 hover:text-rose-400 group-hover:opacity-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <UserMenu />
      </div>
    </header>
  );
};

export default TopNavbar;
