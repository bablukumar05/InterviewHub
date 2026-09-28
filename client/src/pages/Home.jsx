import { Link } from "react-router-dom";
import {
  Briefcase,
  Users,
  Calendar,
  Code2,
  Award,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Video,
  ClipboardCheck,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const HeroDashboardMockup = () => {
  return (
    <div className="relative mt-10 sm:mt-12 mx-auto max-w-5xl text-left">
      <div className="pointer-events-none absolute -inset-x-8 -top-8 h-64 bg-gradient-to-b from-sky-400/20 via-amber-400/10 to-transparent blur-3xl" />

      <div className="relative rounded-2xl border border-sky-300/25 bg-slate-950/90 backdrop-blur-2xl shadow-[0_28px_80px_-20px_rgba(2,6,23,0.95)] overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/15 bg-slate-900/90 px-4 py-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
            <div className="ml-3 rounded-lg border border-white/15 bg-slate-950/85 px-3 py-1 font-mono text-[11px] text-sky-200/80">
              interviewhub.app/workspace/dashboard
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-[11px] font-medium text-slate-200">
            <span className="text-sky-300 font-semibold">Candidates</span>
            <span>Interviews</span>
            <span>Evaluations</span>
            <span>Analytics</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-[190px_1fr_270px]">
          <aside className="hidden lg:flex flex-col justify-between border-r border-white/15 bg-slate-900/55 p-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 px-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-b from-sky-400 to-blue-600 text-xs font-bold text-slate-950 shadow-[0_0_12px_rgba(56,189,248,0.5)]">
                  IH
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">InterviewHub</div>
                  <div className="text-[10px] text-sky-200/75">Engineering Hiring</div>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-sky-500/25 to-blue-600/25 border border-sky-400/35 px-3 py-2 font-semibold text-sky-200">
                  <Users className="h-3.5 w-3.5 text-sky-300" />
                  <span>Candidates</span>
                </div>
                <div className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-slate-200">
                  <Calendar className="h-3.5 w-3.5 text-sky-300/70" />
                  <span>Interviews</span>
                </div>
                <div className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-slate-200">
                  <ClipboardCheck className="h-3.5 w-3.5 text-sky-300/70" />
                  <span>Evaluations</span>
                </div>
                <div className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-slate-200">
                  <BookOpen className="h-3.5 w-3.5 text-sky-300/70" />
                  <span>Question Bank</span>
                </div>
                <div className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-slate-200">
                  <BarChart3 className="h-3.5 w-3.5 text-sky-300/70" />
                  <span>Analytics</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-amber-300/25 bg-amber-500/10 p-3">
              <div className="text-[10px] uppercase tracking-wider text-amber-300 font-semibold">
                Open Role
              </div>
              <div className="mt-1 text-xs font-semibold text-white">
                Senior MERN Developer
              </div>
              <div className="text-[11px] text-amber-100/80">14 Active Applicants</div>
            </div>
          </aside>

          <div className="p-4 sm:p-5 space-y-4 border-b lg:border-b-0 lg:border-r border-white/15">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { label: "Candidates", value: "128", meta: "+18 this week" },
                { label: "Interviews", value: "34", meta: "8 today" },
                { label: "Feedback", value: "92%", meta: "Submitted" },
                { label: "Avg Score", value: "84%", meta: "Overall" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-white/15 bg-slate-900/75 p-3"
                >
                  <div className="text-[11px] text-slate-200">{stat.label}</div>
                  <div className="mt-1 text-lg font-bold text-white">{stat.value}</div>
                  <div className="text-[10px] text-sky-300 font-medium">{stat.meta}</div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-white/15 bg-slate-900/65 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white">
                  Recent Candidates & Interview Status
                </span>
                <span className="text-[11px] text-amber-300 font-medium">Live Status</span>
              </div>

              <div className="space-y-2">
                {[
                  {
                    name: "Aman Verma",
                    role: "Senior Full Stack Developer",
                    round: "Round 2 · Technical",
                    score: "93%",
                    status: "STRONG_HIRE",
                    tone: "text-emerald-300 border-emerald-500/30 bg-emerald-500/15",
                  },
                  {
                    name: "Sneha Iyer",
                    role: "Frontend React Developer",
                    round: "Round 2 · UI Coding",
                    score: "85%",
                    status: "NEXT_ROUND",
                    tone: "text-sky-300 border-sky-400/30 bg-sky-500/15",
                  },
                  {
                    name: "Karan Malhotra",
                    role: "Backend Node.js Developer",
                    round: "Round 1 · Coding",
                    score: "Scheduled",
                    status: "CONFIRMED",
                    tone: "text-amber-200 border-amber-400/30 bg-amber-500/15",
                  },
                ].map((row) => (
                  <div
                    key={row.name}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/15 bg-slate-950/85 px-3.5 py-2.5 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white">{row.name}</div>
                      <div className="text-[11px] text-slate-200">
                        {row.role} · {row.round}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-sky-200">
                        {row.score}
                      </span>
                      <span
                        className={`rounded-lg border px-2 py-0.5 text-[10px] font-semibold ${row.tone}`}
                      >
                        {row.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 space-y-4 bg-slate-900/40">
            <div className="rounded-xl border border-white/15 bg-slate-900/80 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-200">Round 1 Score</div>
                  <div className="mt-1 text-2xl font-extrabold text-white">93%</div>
                </div>
                <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold text-emerald-300">
                  STRONG HIRE
                </span>
              </div>

              <div className="mt-3.5 space-y-2">
                {[
                  { skill: "React & Hooks", val: "5.0 / 5", pct: "100%" },
                  { skill: "Node.js & Express", val: "4.5 / 5", pct: "90%" },
                  { skill: "MongoDB Queries", val: "4.5 / 5", pct: "90%" },
                ].map((s) => (
                  <div key={s.skill} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-100">{s.skill}</span>
                      <span className="font-mono text-sky-300">{s.val}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        style={{ width: s.pct }}
                        className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-white/15 bg-slate-900/75 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white">Next Interview</span>
                <span className="text-[10px] text-amber-300 font-semibold">11:00 AM</span>
              </div>
              <div className="text-[11px] text-slate-200">
                System Design · Rohan Mehta
              </div>
              <div className="flex items-center gap-2 text-[11px] text-sky-300 pt-1">
                <Video className="h-3.5 w-3.5 text-sky-400" />
                <span>Google Meet Link Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureBackgroundFragment = ({ type }) => {
  if (type === "pipeline") {
    return (
      <div className="pointer-events-none select-none absolute -right-6 -bottom-6 w-64 opacity-[0.16] blur-[1px] transition-opacity duration-300 group-hover:opacity-[0.24]">
        <div className="rounded-xl border border-white/20 bg-slate-900 p-3 space-y-2">
          <div className="flex justify-between text-[10px] text-slate-200">
            <span>APPLIED → INTERVIEW</span>
            <span>88%</span>
          </div>
          <div className="h-2 rounded bg-sky-500/60 w-4/5" />
          <div className="h-2 rounded bg-slate-700 w-3/5" />
          <div className="h-2 rounded bg-emerald-500/60 w-5/6" />
        </div>
      </div>
    );
  }

  if (type === "calendar") {
    return (
      <div className="pointer-events-none select-none absolute -right-6 -bottom-6 w-64 opacity-[0.16] blur-[1px] transition-opacity duration-300 group-hover:opacity-[0.24]">
        <div className="rounded-xl border border-white/20 bg-slate-900 p-3 space-y-2">
          <div className="flex items-center justify-between text-[10px] text-sky-300">
            <span>Round 2 · Technical</span>
            <span>CONFIRMED</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <div className="h-8 rounded bg-slate-800" />
            <div className="h-8 rounded bg-sky-500/40 border border-sky-400/40" />
            <div className="h-8 rounded bg-slate-800" />
          </div>
        </div>
      </div>
    );
  }

  if (type === "questions") {
    return (
      <div className="pointer-events-none select-none absolute -right-6 -bottom-6 w-64 opacity-[0.16] blur-[1px] transition-opacity duration-300 group-hover:opacity-[0.24]">
        <div className="rounded-xl border border-white/20 bg-slate-900 p-3 space-y-1.5 text-[10px]">
          <div className="rounded bg-amber-500/30 px-2 py-1 text-amber-200">
            FULL_STACK · REACT · HARD
          </div>
          <div className="h-2.5 rounded bg-slate-700 w-full" />
          <div className="h-2.5 rounded bg-slate-800 w-2/3" />
        </div>
      </div>
    );
  }

  return (
    <div className="pointer-events-none select-none absolute -right-6 -bottom-6 w-64 opacity-[0.16] blur-[1px] transition-opacity duration-300 group-hover:opacity-[0.24]">
      <div className="rounded-xl border border-white/20 bg-slate-900 p-3 space-y-2">
        <div className="flex justify-between text-[10px] text-emerald-300">
          <span>Overall Score</span>
          <span>88% · STRONG_HIRE</span>
        </div>
        <div className="h-2 rounded bg-emerald-500/60 w-11/12" />
        <div className="h-2 rounded bg-sky-500/60 w-4/5" />
      </div>
    </div>
  );
};

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      id: "pipeline",
      title: "Candidate Tracking",
      subtitle: "From resume to offer letter",
      icon: Users,
      metrics: "All Stages",
    },
    {
      id: "calendar",
      title: "Interview Scheduling",
      subtitle: "Assign rounds & meeting links",
      icon: Calendar,
      metrics: "Google Meet / Zoom",
    },
    {
      id: "questions",
      title: "Question Bank",
      subtitle: "Filter by role, skill & level",
      icon: Code2,
      metrics: "Ready to Use",
    },
    {
      id: "evaluation",
      title: "Interview Scorecards",
      subtitle: "Skill ratings & interviewer notes",
      icon: Award,
      metrics: "1–5 Rating Scale",
    },
  ];

  const workflowStages = [
    {
      step: "01",
      stage: "Application",
      status: "SHORTLISTED",
      title: "Resume & Skill Check",
      badgeTone: "text-amber-200 border-amber-400/30 bg-amber-500/15",
    },
    {
      step: "02",
      stage: "Interview",
      status: "COMPLETED",
      title: "Live Technical Round",
      badgeTone: "text-sky-300 border-sky-400/30 bg-sky-500/15",
    },
    {
      step: "03",
      stage: "Evaluation",
      status: "SUBMITTED",
      title: "Scorecard & Notes",
      badgeTone: "text-emerald-300 border-emerald-500/30 bg-emerald-500/15",
    },
    {
      step: "04",
      stage: "Decision",
      status: "OFFER SENT",
      title: "Final Review & Offer",
      badgeTone: "text-amber-200 border-amber-400/30 bg-amber-500/15",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/space-bg.jpg')" }}
      />
      <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-slate-950/45 via-slate-950/35 to-slate-950/70" />

      <div className="relative z-10 max-w-6xl mx-auto rounded-3xl border border-sky-300/25 bg-slate-950/45 backdrop-blur-xl px-4 sm:px-10 py-10 sm:py-16 shadow-[0_32px_100px_rgba(2,6,23,0.9)] ring-1 ring-white/15 space-y-20 sm:space-y-24">
        <section className="text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/80 border border-amber-300/30 text-xs text-amber-100 mb-6 shadow-[0_0_20px_rgba(251,191,36,0.15)]">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
            <span>InterviewHub · Technical Hiring Portal</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12] max-w-3xl mx-auto drop-shadow-md">
            Technical interviews,{" "}
            <span className="bg-gradient-to-r from-sky-300 via-blue-300 to-amber-200 bg-clip-text text-transparent">
              managed in one place.
            </span>
          </h1>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            {user ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-sky-300/40 bg-gradient-to-b from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 px-6 py-3 text-sm font-bold text-white transition-all shadow-[0_0_24px_rgba(56,189,248,0.45)]"
              >
                <span>Open Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-sky-300/40 bg-gradient-to-b from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 px-6 py-3 text-sm font-bold text-white transition-all shadow-[0_0_24px_rgba(56,189,248,0.45)]"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            <Link
              to="/jobs"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 hover:bg-white/20 backdrop-blur-md px-6 py-3 text-sm font-semibold text-white transition-all shadow-lg"
            >
              <Briefcase className="w-4 h-4 text-amber-300" />
              <span>Browse Open Jobs</span>
            </Link>
          </div>

          <HeroDashboardMockup />
        </section>

        <section className="space-y-8">
          <div className="max-w-2xl space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-300">
              Core Modules
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Built around your hiring workflow
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {features.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="group relative overflow-hidden rounded-2xl border border-white/20 bg-slate-900/65 backdrop-blur-xl p-6 sm:p-7 shadow-xl transition-all hover:border-sky-300/45"
                >
                  <FeatureBackgroundFragment type={item.id} />

                  <div className="relative z-10 flex flex-col justify-between h-full space-y-5">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-400/30 bg-sky-500/15 text-sky-300">
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="rounded-full border border-amber-300/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-200">
                          {item.metrics}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-white">
                          {item.title}
                        </h3>
                        <div className="text-xs font-medium text-sky-200 mt-0.5">
                          {item.subtitle}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/15 flex items-center justify-between text-xs text-slate-200">
                      <span>Role-based dashboards</span>
                      <Link
                        to="/features"
                        className="font-semibold text-sky-300 hover:text-white transition-colors"
                      >
                        View details →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-8">
          <div className="max-w-2xl space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-300">
              How It Works
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Application → Interview → Evaluation → Decision
            </h2>
          </div>

          <div className="rounded-2xl border border-white/20 bg-slate-900/65 backdrop-blur-xl p-5 sm:p-7 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {workflowStages.map((item, idx) => (
                <div
                  key={item.step}
                  className="relative rounded-xl border border-white/15 bg-slate-950/90 p-5 flex flex-col justify-between space-y-4 shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-sky-300">
                        {item.step} · {item.stage}
                      </span>
                      <span
                        className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${item.badgeTone}`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white">
                      {item.title}
                    </h3>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-200">
                    <span>Step {idx + 1} of 4</span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-sky-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-slate-900/65 backdrop-blur-xl p-6 sm:p-10 shadow-xl">
            <div className="pointer-events-none select-none absolute inset-x-0 bottom-0 h-64 opacity-[0.14] blur-[1.5px]">
              <div className="flex h-full items-end gap-3 px-8 pt-12">
                {[40, 58, 48, 72, 66, 84, 78, 92, 88, 96, 85, 94].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}%` }}
                    className="flex-1 rounded-t-lg bg-gradient-to-t from-sky-500/40 to-amber-300"
                  />
                ))}
              </div>
            </div>

            <div className="relative z-10 grid gap-8 lg:grid-cols-12 items-center">
              <div className="lg:col-span-6 space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-300">
                  <TrendingUp className="h-4 w-4 text-sky-300" />
                  <span>Scorecards & Reports</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Compare interviewer feedback and scores side by side
                </h2>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="rounded-xl border border-white/15 bg-slate-950/90 p-3.5">
                    <div className="text-[11px] text-slate-200">Skill Ratings</div>
                    <div className="mt-1 text-lg font-bold text-white">1 to 5 Scale</div>
                    <div className="text-[11px] text-sky-300">Auto-calculated percentage</div>
                  </div>
                  <div className="rounded-xl border border-white/15 bg-slate-950/90 p-3.5">
                    <div className="text-[11px] text-slate-200">Panel Feedback</div>
                    <div className="mt-1 text-lg font-bold text-white">Independent</div>
                    <div className="text-[11px] text-amber-300">Separate notes per round</div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="rounded-xl border border-white/15 bg-slate-950/95 p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div>
                      <div className="text-xs font-semibold text-white">
                        Panel Scorecard Summary
                      </div>
                      <div className="text-[11px] text-slate-200">
                        Senior Full Stack Developer · Round 1
                      </div>
                    </div>
                    <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-300">
                      Avg 90%
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    {[
                      {
                        interviewer: "Rohan Mehta (Senior Full Stack)",
                        skill: "React & Node.js",
                        score: "93%",
                        rec: "STRONG_HIRE",
                      },
                      {
                        interviewer: "Pooja Nair (Backend Lead)",
                        skill: "MongoDB & System Design",
                        score: "88%",
                        rec: "HIRE",
                      },
                    ].map((row) => (
                      <div
                        key={row.interviewer}
                        className="flex items-center justify-between rounded-lg border border-white/15 bg-slate-900/85 p-3"
                      >
                        <div>
                          <div className="font-semibold text-white">{row.interviewer}</div>
                          <div className="text-[11px] text-slate-200">{row.skill}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-sky-300">{row.score}</div>
                          <div className="text-[10px] font-semibold text-emerald-400">
                            {row.rec}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="relative overflow-hidden rounded-2xl border border-sky-300/25 bg-slate-900/70 backdrop-blur-xl p-8 sm:p-14 text-center shadow-xl">
            <div className="pointer-events-none select-none absolute -top-12 left-1/2 -translate-x-1/2 w-[520px] opacity-[0.08] blur-[2px]">
              <div className="rounded-2xl border border-white/20 bg-slate-950 p-4 space-y-2">
                <div className="h-3 w-32 rounded bg-sky-500/50 mx-auto" />
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="h-12 rounded bg-slate-800" />
                  <div className="h-12 rounded bg-sky-500/30" />
                  <div className="h-12 rounded bg-slate-800" />
                </div>
              </div>
            </div>

            <div className="relative z-10 max-w-xl mx-auto space-y-5">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Run structured technical interviews with confidence.
              </h2>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                {user ? (
                  <Link
                    to="/dashboard"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-sky-300/40 bg-gradient-to-b from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 px-6 py-3 text-sm font-bold text-white shadow-[0_0_22px_rgba(56,189,248,0.45)] transition-all"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-sky-300/40 bg-gradient-to-b from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 px-6 py-3 text-sm font-bold text-white shadow-[0_0_22px_rgba(56,189,248,0.45)] transition-all"
                    >
                      <span>Get Started</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/login"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 hover:bg-white/20 backdrop-blur-md px-6 py-3 text-sm font-semibold text-white transition-all"
                    >
                      <span>Sign In</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
