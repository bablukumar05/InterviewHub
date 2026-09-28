import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  UserPlus,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";

import SocialAuthButtons from "../components/auth/SocialAuthButtons";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setError("");
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const trimmedName = formData.name.trim();
    const normalizedEmail = formData.email.trim().toLowerCase();

    if (!trimmedName || !normalizedEmail || !formData.password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (formData.password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const result = await register({
        name: trimmedName,
        email: normalizedEmail,
        password: formData.password,
      });

      if (!result.success) {
        setError(result.message || "Registration failed. Please try again.");
        return;
      }

      navigate("/onboarding");
    } catch (err) {
      setError(
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white flex flex-col justify-between px-4 py-6 sm:px-6 lg:px-8">
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat scale-105 blur-[4px]"
        style={{ backgroundImage: "url('/office-bg.jpg')" }}
      />
      <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-slate-950/70 via-slate-900/55 to-slate-950/85" />

      <div className="relative z-10 max-w-7xl w-full mx-auto flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-200 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4 text-sky-400" />
          <span>Back to Home</span>
        </Link>

        <Link
          to="/login"
          className="text-xs font-semibold text-sky-300 hover:text-sky-200 transition"
        >
          Already have an account? Sign in →
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto my-8">
        <div className="text-center mb-6 space-y-1.5">
          <Link
            to="/"
            className="inline-flex items-center justify-center w-12 h-12 rounded-2xl border border-sky-300/40 bg-gradient-to-b from-sky-400 to-blue-600 text-white shadow-[0_0_22px_rgba(56,189,248,0.45)] mb-2"
          >
            <UserPlus className="w-6 h-6" />
          </Link>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Create your InterviewHub account
          </h1>
          <div className="text-xs text-slate-200">
            Start applying to roles and tracking your interview pipeline
          </div>
        </div>

        <div className="rounded-3xl border border-white/25 bg-slate-900/65 backdrop-blur-2xl p-6 sm:p-7 shadow-[0_32px_90px_rgba(2,6,23,0.9)] ring-1 ring-white/10 space-y-5">
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/35 bg-rose-500/15 px-4 py-3 text-xs text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <SocialAuthButtons mode="register" />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-semibold text-slate-100 mb-1.5"
              >
                Name
              </label>

              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-300/80" />

                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Rahul Sharma"
                  autoComplete="name"
                  className="w-full rounded-xl border border-white/15 bg-slate-950/90 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white placeholder:text-slate-400 outline-none transition focus:border-sky-400/60"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-100 mb-1.5"
              >
                Email
              </label>

              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-300/80" />

                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="rahul@gmail.com"
                  autoComplete="email"
                  className="w-full rounded-xl border border-white/15 bg-slate-950/90 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white placeholder:text-slate-400 outline-none transition focus:border-sky-400/60"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-100 mb-1.5"
              >
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-300/80" />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-white/15 bg-slate-950/90 py-2.5 pl-10 pr-10 text-xs sm:text-sm text-white placeholder:text-slate-400 outline-none transition focus:border-sky-400/60"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold text-slate-100 mb-1.5"
              >
                Confirm Password
              </label>

              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-300/80" />

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(event) => {
                    setError("");
                    setConfirmPassword(event.target.value);
                  }}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-white/15 bg-slate-950/90 py-2.5 pl-10 pr-10 text-xs sm:text-sm text-white placeholder:text-slate-400 outline-none transition focus:border-sky-400/60"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((previous) => !previous)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white cursor-pointer"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
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
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-sky-300/40 bg-gradient-to-b from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 px-4 py-3 font-semibold text-xs sm:text-sm text-white shadow-[0_0_22px_rgba(56,189,248,0.45)] transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-slate-200 pt-1">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-sky-300 hover:text-sky-200"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>

      <div className="relative z-10 text-center text-[11px] text-slate-300">
        InterviewHub • Enterprise Technical Interview Platform
      </div>
    </div>
  );
};

export default Register;
