import { useState } from "react";
import {
  ChevronDown,
  UserRound,
  LogOut,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import { useNavigate } from "react-router-dom";

const UserMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const handleProfileClick = () => {
    setOpen(false);
    if (user?.role === "CANDIDATE") {
      navigate("/candidate/profile");
    } else {
      navigate("/dashboard");
    }
  };

  const handleLogout = async () => {
    setOpen(false);
    await logout();
  };

  return (
    <div className="relative">

      <button
        type="button"
        onClick={() =>
          setOpen((previous) => !previous)
        }
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-slate-800"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600/20 text-sm font-semibold text-blue-400">
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>

        <div className="hidden text-left sm:block">
          <p className="max-w-32 truncate text-sm font-medium text-white">
            {user?.name}
          </p>

          <p className="text-xs text-slate-500">
            {user?.role}
          </p>
        </div>

        <ChevronDown className="hidden h-4 w-4 text-slate-500 sm:block" />
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl">

          <div className="border-b border-slate-800 px-3 py-3">
            <p className="truncate text-sm font-medium text-white">
              {user?.name}
            </p>

            <p className="mt-1 truncate text-xs text-slate-500">
              {user?.email}
            </p>
          </div>

          <button
            type="button"
            onClick={handleProfileClick}
            className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
          >
            <UserRound className="h-4 w-4" />
            Profile
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>

        </div>
      )}

    </div>
  );
};

export default UserMenu;
