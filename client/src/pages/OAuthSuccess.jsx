import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    user,
    getMe,
    loading,
  } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("token", token);
    }
    getMe();
  }, [getMe, searchParams]);

  useEffect(() => {
    if (loading || !user) {
      return;
    }

    const routes = {
      ADMIN: "/admin",
      RECRUITER: "/recruiter",
      INTERVIEWER: "/interviewer",
      CANDIDATE: "/candidate",
    };

    navigate(
      routes[user.role] || "/candidate",
      {
        replace: true,
      }
    );
  }, [user, loading, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />

        <p className="mt-4 text-sm text-slate-400">
          Completing sign in...
        </p>
      </div>
    </div>
  );
};

export default OAuthSuccess;
