import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Sparkles, ArrowRight } from "lucide-react";

const SocialAuthButtons = ({ mode = "login" }) => {
  const { devSocialLogin } = useAuth();
  const navigate = useNavigate();
  const [devLoading, setDevLoading] = useState("");
  const [devError, setDevError] = useState("");

  const apiBaseUrl =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

  const handleOAuthRedirect = (provider) => {
    window.location.href = `${apiBaseUrl}/auth/${provider}`;
  };

  const handleDevLogin = async (provider) => {
    try {
      setDevLoading(provider);
      setDevError("");
      const result = await devSocialLogin(provider);

      if (!result.success) {
        setDevError(result.message || "Social login simulation failed.");
        return;
      }

      if (result.isNewUser) {
        navigate("/onboarding", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setDevError(err.message || "Simulation error");
    } finally {
      setDevLoading("");
    }
  };

  return (
    <div className="space-y-3">
      {devError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400 text-center">
          {devError}
        </div>
      )}

      <button
        type="button"
        onClick={() => handleOAuthRedirect("google")}
        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium transition-colors cursor-pointer"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Continue with Google</span>
      </button>

      <button
        type="button"
        onClick={() => handleOAuthRedirect("github")}
        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium transition-colors cursor-pointer"
      >
        <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
        <span>Continue with GitHub</span>
      </button>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => handleDevLogin("LINKEDIN")}
          className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
        >
          <svg className="w-3.5 h-3.5 fill-[#0A66C2]" viewBox="0 0 24 24">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
          </svg>
          <span>LinkedIn</span>
        </button>

        <button
          type="button"
          onClick={() => handleDevLogin("TWITTER")}
          className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
        >
          <svg className="w-3 h-3 fill-white" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span>X (Twitter)</span>
        </button>
      </div>

      <div className="pt-1 text-center">
        <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
          <Sparkles className="w-3 h-3 text-blue-400" />
          <span>Need quick testing?</span>
          <button
            type="button"
            onClick={() => handleDevLogin("GOOGLE")}
            disabled={devLoading !== ""}
            className="text-blue-400 hover:text-blue-300 font-medium underline ml-1 cursor-pointer disabled:opacity-50"
          >
            {devLoading ? "Simulating..." : "Test 1-Click Social Login"}
          </button>
        </div>
      </div>

      <div className="relative flex items-center justify-center py-2">
        <div className="w-full border-t border-slate-800" />
        <span className="absolute bg-slate-900 px-3 text-[11px] uppercase tracking-wider text-slate-500">
          or continue with email
        </span>
      </div>
    </div>
  );
};

export default SocialAuthButtons;
