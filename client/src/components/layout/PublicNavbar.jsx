import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Briefcase,
  Menu,
  X,
  ArrowRight,
  LayoutDashboard,
  User,
  LogIn,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const NavbarTechBackdrop = () => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-blue-950/65 to-slate-950/90" />
      <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-amber-500/10 via-sky-500/5 to-transparent" />

      <svg
        className="absolute inset-0 h-full w-full opacity-35"
        viewBox="0 0 1440 72"
        fill="none"
        preserveAspectRatio="none"
      >
        <g stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.35">
          <path d="M190 0 V24 L210 44 V72" />
          <path d="M205 0 V18 L225 38 V72" />
          <path d="M220 0 V12 L240 32 V72" />
          <path d="M360 0 V28 L340 48 V72" />
          <path d="M375 0 V20 L355 40 V72" />
          <path d="M980 0 V22 L1000 42 V72" />
          <path d="M995 0 V14 L1015 34 V72" />
          <path d="M1140 0 V26 L1120 46 V72" />
          <path d="M1155 0 V16 L1135 36 V72" />
        </g>

        <g stroke="#bae6fd" strokeWidth="1.2" strokeOpacity="0.45">
          <line x1="460" y1="14" x2="505" y2="32" />
          <line x1="505" y1="32" x2="480" y2="58" />
          <line x1="505" y1="32" x2="545" y2="20" />
          <line x1="545" y1="20" x2="565" y2="48" />
          <line x1="890" y1="46" x2="935" y2="26" />
          <line x1="935" y1="26" x2="965" y2="52" />
          <line x1="935" y1="26" x2="915" y2="10" />
        </g>

        <g fill="#e0f2fe">
          <circle cx="460" cy="14" r="2.5" />
          <circle cx="505" cy="32" r="3.5" />
          <circle cx="480" cy="58" r="2.5" />
          <circle cx="545" cy="20" r="3" />
          <circle cx="565" cy="48" r="2.5" />
          <circle cx="890" cy="46" r="2.5" />
          <circle cx="935" cy="26" r="3.5" />
          <circle cx="965" cy="52" r="3" />
          <circle cx="915" cy="10" r="2" />
        </g>
      </svg>
    </div>
  );
};

const PublicNavbar = () => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Jobs", path: "/jobs" },
    { name: "Features", path: "/features" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-slate-950/75 backdrop-blur-xl border-b border-white/15 shadow-[0_8px_32px_rgba(2,6,23,0.65)]">
      <NavbarTechBackdrop />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-sky-400 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-[0_0_20px_rgba(56,189,248,0.55)] border border-sky-300/50 transition-transform group-hover:scale-105">
              <Briefcase className="w-4 h-4 text-slate-950" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-white drop-shadow-sm">
              Interview<span className="text-sky-400">Hub</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 rounded-xl border border-white/20 bg-slate-900/55 backdrop-blur-xl p-1 shadow-inner">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === "/"}
                className={({ isActive }) =>
                  `relative px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? "text-white bg-white/15 border border-white/20 shadow-sm"
                      : "text-sky-200/85 hover:text-white hover:bg-white/10 border border-transparent"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2.5">
            {user ? (
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/75 backdrop-blur-md border border-white/20">
                  <div className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center text-[10px] font-bold">
                    {user.name ? (
                      user.name.charAt(0).toUpperCase()
                    ) : (
                      <User className="w-3 h-3" />
                    )}
                  </div>
                  <span className="text-xs font-medium text-slate-100 max-w-[120px] truncate">
                    {user.name || "User"}
                  </span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30 uppercase">
                    {user.role}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="flex items-center gap-1.5 rounded-xl border border-blue-400/40 bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 text-white text-xs font-semibold px-4 py-2 shadow-[0_0_20px_rgba(37,99,235,0.45)] transition-all cursor-pointer"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Workspace</span>
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-100 hover:text-white px-4 py-2 rounded-xl border border-white/25 bg-slate-800/65 hover:bg-slate-800/90 backdrop-blur-md shadow-sm transition-all"
                >
                  <LogIn className="w-3.5 h-3.5 text-sky-400" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-blue-400/40 bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 text-white text-xs font-semibold px-4 py-2 shadow-[0_0_20px_rgba(37,99,235,0.5)] transition-all"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>

          <div className="flex md:hidden items-center gap-2">
            {user ? (
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="inline-flex items-center gap-1 rounded-xl border border-sky-300/40 bg-gradient-to-b from-sky-400 to-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-[0_0_15px_rgba(56,189,248,0.4)] cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>App</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1 rounded-xl border border-white/25 bg-white/10 hover:bg-white/20 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-white transition-all"
              >
                Sign In
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="inline-flex items-center justify-center p-2 rounded-xl border border-white/25 bg-white/10 text-white hover:bg-white/20 focus:outline-none cursor-pointer transition-all"
              aria-label="Toggle Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-sky-300" />
              ) : (
                <Menu className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="relative z-20 md:hidden bg-slate-950/95 backdrop-blur-2xl border-t border-white/15 max-h-[calc(100vh-4rem)] overflow-y-auto shadow-[0_24px_60px_rgba(2,6,23,0.9)]">
          <div className="p-4 space-y-5">
            <div className="space-y-1.5">
              <div className="px-3 text-[10px] font-semibold uppercase tracking-widest text-sky-300/80">
                Navigation
              </div>
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === "/"}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-sky-500/25 to-blue-600/20 text-white border border-sky-400/40 shadow-sm"
                        : "text-slate-200 hover:text-white hover:bg-white/10 border border-transparent"
                    }`
                  }
                >
                  <span>{link.name}</span>
                  <ArrowRight className="w-4 h-4 text-sky-300 opacity-80" />
                </NavLink>
              ))}
            </div>

            <div className="pt-4 border-t border-white/15 space-y-3">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/90 border border-white/15 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center font-bold shrink-0">
                        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-white truncate">
                          {user.name}
                        </div>
                        <div className="text-[11px] text-slate-300 truncate">
                          {user.email}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-200 border border-sky-400/30 uppercase font-semibold shrink-0">
                      {user.role}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate("/dashboard");
                    }}
                    className="w-full flex items-center justify-center gap-2 border border-sky-300/40 bg-gradient-to-b from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 text-white text-sm font-semibold py-3 rounded-xl shadow-[0_0_20px_rgba(56,189,248,0.45)] transition-all cursor-pointer"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Open Workspace</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white bg-white/10 border border-white/25 hover:bg-white/20 backdrop-blur-md transition-all"
                  >
                    <LogIn className="w-4 h-4 text-sky-300" />
                    <span>Sign In to Account</span>
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 border border-sky-300/40 bg-gradient-to-b from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 text-white text-sm font-semibold py-3 rounded-xl shadow-[0_0_20px_rgba(56,189,248,0.45)] transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Create Free Account</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default PublicNavbar;
