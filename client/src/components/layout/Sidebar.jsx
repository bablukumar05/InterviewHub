import { NavLink, Link } from "react-router-dom";
import { Briefcase, LogOut, PanelLeftClose } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { navigationConfig } from "./navigation";

const Sidebar = ({ onClose }) => {
  const { user, logout } = useAuth();

  const navigation = navigationConfig[user?.role] || [];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside className="flex h-full w-64 flex-col border-r border-white/20 bg-slate-900/55 backdrop-blur-2xl shadow-[8px_0_32px_rgba(2,6,23,0.65)]">
      <div className="flex h-16 items-center justify-between border-b border-white/15 px-5">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-b from-sky-400 to-blue-600 text-slate-950 font-bold shadow-[0_0_16px_rgba(56,189,248,0.5)] border border-sky-300/50">
            <Briefcase className="h-4 w-4" />
          </div>
          <h1 className="text-lg font-extrabold tracking-tight text-white">
            Interview<span className="text-sky-400">Hub</span>
          </h1>
        </Link>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <PanelLeftClose className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3.5 py-5">
        <div className="space-y-1.5">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={`${item.label}-${item.path}`}
                to={item.path}
                end={
                  item.path === "/admin" ||
                  item.path === "/recruiter" ||
                  item.path === "/interviewer" ||
                  item.path === "/candidate"
                }
                onClick={onClose}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all",
                    isActive
                      ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-[0_0_20px_rgba(56,189,248,0.45)] border border-sky-300/40"
                      : "text-slate-300 hover:bg-white/10 hover:text-white border border-transparent",
                  ].join(" ")
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-white/15 p-3.5">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-rose-500/15 hover:text-rose-300 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
