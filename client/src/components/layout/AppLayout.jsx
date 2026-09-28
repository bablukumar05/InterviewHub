import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Menu } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { navigationConfig } from "./navigation";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";
import MobileSidebar from "./MobileSidebar";

const AppLayout = () => {
  const { user } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navigation = (navigationConfig[user?.role] || []).slice(0, 4);

  return (
    <div className="relative min-h-screen bg-slate-950 text-white overflow-x-hidden">
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat scale-105 blur-[4px]"
        style={{ backgroundImage: "url('/office-bg.jpg')" }}
      />
      <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-slate-950/60 via-slate-900/45 to-slate-950/75" />

      <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">
        <Sidebar />
      </div>

      <MobileSidebar
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <div className="relative z-10 lg:pl-64 flex min-h-screen flex-col">
        <TopNavbar onMenuClick={() => setMobileSidebarOpen(true)} />

        <main className="flex-1 p-4 pb-24 sm:p-6 sm:pb-24 lg:p-8 max-w-full overflow-x-hidden">
          <div className="mx-auto max-w-7xl rounded-3xl border border-sky-300/25 bg-slate-900/50 backdrop-blur-2xl p-5 sm:p-8 shadow-[0_32px_90px_rgba(2,6,23,0.85)] ring-1 ring-white/10">
            <Outlet />
          </div>
        </main>
      </div>

      {navigation.length > 0 && (
        <nav className="fixed bottom-0 inset-x-0 z-30 border-t border-white/15 bg-slate-900/75 backdrop-blur-2xl lg:hidden">
          <div className="grid grid-cols-5 items-center px-2 py-1.5">
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
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center gap-1 rounded-xl py-1.5 text-[10px] font-medium transition ${
                      isActive
                        ? "text-sky-400"
                        : "text-slate-300 hover:text-white"
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span className="truncate max-w-[64px]">
                    {item.label.split(" ")[0]}
                  </span>
                </NavLink>
              );
            })}

            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="flex flex-col items-center justify-center gap-1 rounded-xl py-1.5 text-[10px] font-medium text-slate-300 hover:text-white"
            >
              <Menu className="h-4 w-4" />
              <span>Menu</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
};

export default AppLayout;
