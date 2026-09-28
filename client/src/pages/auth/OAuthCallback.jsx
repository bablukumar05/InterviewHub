import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleOAuthSuccess } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const processOAuth = async () => {
      const token = searchParams.get("token");
      const isNewUser = searchParams.get("isNewUser");
      const error = searchParams.get("error");
      const message = searchParams.get("message");

      if (error) {
        setErrorMessage(message || error || "Social authentication failed.");
        return;
      }

      if (!token) {
        setErrorMessage("No authentication token received from provider.");
        return;
      }

      try {
        const freshUser = await handleOAuthSuccess(token);

        if (isNewUser === "true" || (freshUser && freshUser.role === "CANDIDATE" && !freshUser.isOnboarded)) {

          navigate("/onboarding", { replace: true });
        } else {

          navigate("/dashboard", { replace: true });
        }
      } catch (err) {
        setErrorMessage(err.message || "Failed to process authentication token.");
      }
    };

    processOAuth();
  }, [searchParams, handleOAuthSuccess, navigate]);

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Authentication Failed</h2>
          <p className="text-xs text-slate-400 leading-relaxed">{errorMessage}</p>
          <div className="pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <span>Back to Login</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 space-y-3">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      <h2 className="text-base font-semibold text-white">Completing Secure Authentication</h2>
      <p className="text-xs text-slate-500">Connecting your profile to InterviewHub...</p>
    </div>
  );
};

export default OAuthCallback;
