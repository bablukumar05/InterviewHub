import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Briefcase,
  ArrowLeft,
  Loader2,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import SocialAuthButtons from "../components/auth/SocialAuthButtons";

const DEMO_ACCOUNTS = [
  {
    label: "Interviewer",
    email: "interviewer@interviewhub.com",
    password: "password123",
    badge: "Evaluate & Score",
  },
  {
    label: "Recruiter",
    email: "recruiter@interviewhub.com",
    password: "password123",
    badge: "Jobs & Pipeline",
  },
  {
    label: "Candidate",
    email: "candidate@interviewhub.com",
    password: "password123",
    badge: "Apply & Track",
  },
  {
    label: "Admin",
    email: "admin@interviewhub.com",
    password: "password123",
    badge: "Users & Logs",
  },
];

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  const { user, login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quickRoleLoading, setQuickRoleLoading] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      navigate(redirectUrl, { replace: true });
    }
  }, [user, navigate, redirectUrl]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setError("");
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const performLogin = async (email, password, roleLabel = "") => {
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      if (roleLabel) {
        setQuickRoleLoading(roleLabel);
      }

      const result = await login(email.trim(), password);

      if (!result.success) {
        setError(result.message);
        return;
      }

      navigate(redirectUrl, { replace: true });
    } catch (err) {
      setError(
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
      setQuickRoleLoading("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await performLogin(formData.email, formData.password);
  };

  const handleQuickDemoLogin = async (account) => {
    setFormData({
      email: account.email,
      password: account.password,
    });
    await performLogin(
      account.email,
      account.password,
      account.label
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <Link
          to="/register"
          className="text-xs font-medium text-sky-400 hover:text-sky-300 transition"
        >
          Create new account →
        </Link>
      </div>

      <div className="w-full max-w-md mx-auto my-8">
        <div className="text-center mb-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-sky-500 text-slate-950 font-bold mb-3 shadow-lg shadow-sky-500/20"
          >
            <Briefcase className="w-6 h-6" />
          </Link>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Sign in to InterviewHub
          </h1>
        </div>

        <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 sm:p-7 shadow-2xl space-y-5">
          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-300">
              {error}
            </div>
          )}

          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="inline-flex items-center gap-1.5 font-semibold text-sky-400">
                <Sparkles className="w-3.5 h-3.5" />
                Instant 1-Click Role Sign In
              </span>
              <span className="text-slate-500">Demo Workspace</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => {
                const isThisLoading =
                  quickRoleLoading === acc.label;
                return (
                  <button
                    key={acc.label}
                    type="button"
                    disabled={loading}
                    onClick={() => handleQuickDemoLogin(acc)}
                    className="flex flex-col items-start rounded-xl border border-white/10 bg-slate-950/90 px-3 py-2.5 text-left transition hover:border-sky-500/40 hover:bg-sky-500/10 disabled:opacity-50 cursor-pointer"
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="text-xs font-bold text-white">
                        {acc.label}
                      </span>
                      {isThisLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
                      )}
                    </div>
                    <span className="mt-0.5 text-[10px] text-slate-400">
                      {acc.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-slate-900 px-3 text-[10px] uppercase tracking-wider text-slate-500">
              or email credentials
            </span>
            <div className="border-t border-white/10 w-full" />
          </div>

          <SocialAuthButtons mode="login" />

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Email address
              </label>

              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  autoComplete="email"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />

                <input
                  id="password"
                  name="password"
                  type={
                    showPassword ? "text" : "password"
                  }
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 py-2.5 pl-10 pr-10 text-xs sm:text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-sky-500"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer p-1"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-sky-300/40 bg-gradient-to-b from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 px-4 py-3 font-semibold text-xs sm:text-sm text-white transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 shadow-[0_0_20px_rgba(56,189,248,0.45)]"
            >
              {loading && !quickRoleLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In with Email</span>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-slate-300 pt-1">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-sky-400 hover:text-sky-300"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>

      <div className="text-center text-[11px] text-slate-600">
        InterviewHub • Enterprise Technical Interview Platform
      </div>
    </div>
  );
};

export default Login;
