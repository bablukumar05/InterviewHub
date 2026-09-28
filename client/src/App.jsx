import { useEffect } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  Link,
  useLocation,
} from "react-router-dom";

import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleBasedRoute from "./routes/RoleBasedRoute";

import AppLayout from "./components/layout/AppLayout";
import PublicLayout from "./components/layout/PublicLayout";

import Home from "./pages/Home";
import Features from "./pages/public/Features";
import About from "./pages/public/About";
import Contact from "./pages/public/Contact";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Unauthorized from "./pages/Unauthorized";

import OAuthCallback from "./pages/auth/OAuthCallback";
import OAuthSuccess from "./pages/OAuthSuccess";
import CandidateOnboarding from "./pages/auth/CandidateOnboarding";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/Users";
import AdminAuditLogs from "./pages/admin/AuditLogs";
import QuestionBankPage from "./pages/admin/Questions";

import RecruiterDashboard from "./pages/recruiter/RecruiterDashboard";
import RecruiterJobs from "./pages/recruiter/RecruiterJobs";
import RecruiterApplications from "./pages/recruiter/Applications";
import RecruiterInterviews from "./pages/recruiter/Interviews";
import RecruiterInterviewDetails from "./pages/recruiter/RecruiterInterviewDetails";

import InterviewerInterviews from "./pages/interviewer/Interviews";
import InterviewerWorkspace from "./pages/interviewer/InterviewerWorkspace";
import InterviewerInterviewDetails from "./pages/interviewer/InterviewerInterviewDetails";
import InterviewerEvaluation from "./pages/interviewer/InterviewerEvaluation";

import CandidateDashboard from "./pages/candidate/CandidateDashboard";
import CandidateProfile from "./pages/candidate/CandidateProfile";
import CandidateJobs from "./pages/candidate/CandidateJobs";
import CandidateApplications from "./pages/candidate/CandidateApplications";
import CandidateApplicationDetails from "./pages/candidate/CandidateApplicationDetails";
import CandidateInterviews from "./pages/candidate/CandidateInterviews";
import CandidateOffers from "./pages/candidate/Offers";

import JobDetails from "./pages/jobs/JobDetails";

const DashboardDispatcher = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "CANDIDATE" && !user.isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  switch (user.role) {
    case "ADMIN":
      return <Navigate to="/admin" replace />;
    case "RECRUITER":
      return <Navigate to="/recruiter" replace />;
    case "INTERVIEWER":
      return <Navigate to="/interviewer" replace />;
    case "CANDIDATE":
      return <Navigate to="/candidate" replace />;
    default:
      return <Navigate to="/candidate" replace />;
  }
};

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [pathname]);

  return null;
};

const App = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<CandidateJobs />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/features" element={<Features />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/onboarding" element={<CandidateOnboarding />} />
          <Route
            path="/auth/select-role"
            element={<Navigate to="/onboarding" replace />}
          />
          <Route path="/dashboard" element={<DashboardDispatcher />} />

          <Route element={<AppLayout />}>
            <Route element={<RoleBasedRoute allowedRoles={["ADMIN"]} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/jobs" element={<RecruiterJobs />} />
              <Route path="/admin/jobs/:id" element={<JobDetails />} />
              <Route
                path="/admin/interviews"
                element={<RecruiterInterviews />}
              />
              <Route
                path="/admin/interviews/:id"
                element={<RecruiterInterviewDetails />}
              />
              <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
              <Route path="/admin/*" element={<AdminDashboard />} />
            </Route>

            <Route
              element={<RoleBasedRoute allowedRoles={["RECRUITER", "ADMIN"]} />}
            >
              <Route path="/recruiter" element={<RecruiterDashboard />} />
              <Route path="/recruiter/jobs" element={<RecruiterJobs />} />
              <Route path="/recruiter/jobs/:id" element={<JobDetails />} />
              <Route
                path="/recruiter/applications"
                element={<RecruiterApplications />}
              />
              <Route
                path="/recruiter/interviews"
                element={<RecruiterInterviews />}
              />
              <Route
                path="/recruiter/interviews/:id"
                element={<RecruiterInterviewDetails />}
              />
              <Route path="/recruiter/*" element={<RecruiterDashboard />} />
            </Route>

            <Route element={<RoleBasedRoute allowedRoles={["INTERVIEWER"]} />}>
              <Route path="/interviewer" element={<InterviewerWorkspace />} />
              <Route
                path="/interviewer/workspace"
                element={<InterviewerWorkspace />}
              />
              <Route
                path="/interviewer/interviews"
                element={<InterviewerInterviews />}
              />
              <Route
                path="/interviewer/interviews/:id"
                element={<InterviewerInterviewDetails />}
              />
              <Route
                path="/interviewer/interviews/:id/evaluation"
                element={<InterviewerEvaluation />}
              />
              <Route
                path="/interviewer/questions"
                element={<QuestionBankPage />}
              />
              <Route path="/interviewer/*" element={<InterviewerWorkspace />} />
            </Route>

            <Route element={<RoleBasedRoute allowedRoles={["CANDIDATE"]} />}>
              <Route path="/candidate" element={<CandidateDashboard />} />
              <Route path="/candidate/jobs" element={<CandidateJobs />} />
              <Route path="/candidate/jobs/:id" element={<JobDetails />} />
              <Route path="/candidate/profile" element={<CandidateProfile />} />
              <Route
                path="/candidate/applications"
                element={<CandidateApplications />}
              />
              <Route
                path="/candidate/applications/:id"
                element={<CandidateApplicationDetails />}
              />
              <Route
                path="/candidate/interviews"
                element={<CandidateInterviews />}
              />
              <Route path="/candidate/offers" element={<CandidateOffers />} />
              <Route path="/candidate/*" element={<CandidateDashboard />} />
            </Route>
          </Route>
        </Route>

        <Route
          path="*"
          element={
            <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 space-y-4 text-center">
              <span className="text-6xl font-black text-sky-400 font-mono">
                404
              </span>
              <h1 className="text-2xl font-bold">Page Not Found</h1>
              <Link
                to="/"
                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-colors"
              >
                Return to Home
              </Link>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
