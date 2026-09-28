import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Zap,
  Target,
  CheckCircle2,
  Lock,
  ArrowRight,
  Server,
  Database,
} from "lucide-react";

const About = () => {
  const values = [
    {
      title: "Structured Scorecards",
      icon: Target,
    },
    {
      title: "Clear Application Stages",
      icon: CheckCircle2,
    },
    {
      title: "Clean MongoDB Schema",
      icon: Database,
    },
    {
      title: "Fast Round Scheduling",
      icon: Zap,
    },
  ];

  const architectureHighlights = [
    {
      title: "Organization Data Separation",
      icon: Server,
    },
    {
      title: "Role-Based Route Protection",
      icon: Lock,
    },
    {
      title: "MongoDB Aggregation Charts",
      icon: Database,
    },
    {
      title: "JWT Auth & Activity Logs",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat scale-105 blur-[4px]"
        style={{ backgroundImage: "url('/office-bg.jpg')" }}
      />
      <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-slate-950/60 via-slate-900/45 to-slate-950/75" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="rounded-3xl border border-white/25 bg-slate-900/50 backdrop-blur-2xl p-6 sm:p-12 shadow-[0_32px_90px_rgba(2,6,23,0.85)] ring-1 ring-white/10 space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-sky-300 via-blue-400 to-indigo-300 bg-clip-text text-transparent drop-shadow-[0_2px_16px_rgba(56,189,248,0.35)]">
              About InterviewHub
            </h1>
          </div>

          <div className="p-6 sm:p-7 rounded-2xl bg-slate-950/75 border border-white/20 backdrop-blur-xl shadow-xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/35 text-sky-300 flex items-center justify-center font-bold text-xs">
                10
              </div>
              <div>
                <div className="text-sm font-bold text-white">MongoDB Collections</div>
                <div className="text-[11px] text-sky-200/80">MERN Stack Backend</div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-[11px] font-mono text-slate-100">
              <div className="p-3 rounded-xl bg-slate-900/85 border border-white/15">Organizations</div>
              <div className="p-3 rounded-xl bg-slate-900/85 border border-white/15">Users</div>
              <div className="p-3 rounded-xl bg-slate-900/85 border border-white/15">CandidateProfiles</div>
              <div className="p-3 rounded-xl bg-slate-900/85 border border-white/15">Jobs</div>
              <div className="p-3 rounded-xl bg-slate-900/85 border border-white/15">Applications</div>
              <div className="p-3 rounded-xl bg-slate-900/85 border border-white/15">Interviews</div>
              <div className="p-3 rounded-xl bg-slate-900/85 border border-white/15">Questions</div>
              <div className="p-3 rounded-xl bg-slate-900/85 border border-white/15">Evaluations</div>
              <div className="p-3 rounded-xl bg-slate-900/85 border border-white/15">Offers</div>
              <div className="p-3 rounded-xl bg-slate-900/85 border border-white/15">AuditLogs</div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="text-center max-w-xl mx-auto">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Core Principles
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {values.map((val, idx) => {
                const Icon = val.icon;
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-950/75 border border-white/20 backdrop-blur-md shadow-lg space-y-3 hover:border-sky-400/40 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/30 text-sky-300 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-bold text-white">{val.title}</h3>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-slate-950/75 border border-white/20 backdrop-blur-xl shadow-xl space-y-6">
            <div className="text-center max-w-xl mx-auto">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Architecture Highlights
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {architectureHighlights.map((arch, idx) => {
                const Icon = arch.icon;
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-900/85 border border-white/15 flex items-center gap-3 hover:border-sky-400/40 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/30 text-sky-300 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white">{arch.title}</h3>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-center space-y-4 pt-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Get Started with InterviewHub
            </h2>
            <div className="flex items-center justify-center gap-3">
              <Link
                to="/register"
                className="border border-sky-300/40 bg-gradient-to-b from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-[0_0_20px_rgba(56,189,248,0.45)] transition-all inline-flex items-center gap-1.5"
              >
                <span>Create Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/contact"
                className="border border-white/25 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all"
              >
                Contact Team
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
