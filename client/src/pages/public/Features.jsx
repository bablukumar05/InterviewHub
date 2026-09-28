import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Briefcase,
  Award,
  ShieldCheck,
  BarChart3,
  CheckCircle2,
  Code2,
  Calendar,
  FileCheck2,
  Lock,
  ArrowRight,
  Database,
  Zap,
  Clock,
  FileText,
} from "lucide-react";

const Features = () => {
  const [activeTab, setActiveTab] = useState("candidate");

  const categories = [
    { id: "candidate", label: "Candidate Portal", icon: Users },
    { id: "recruiter", label: "Recruiter Tools", icon: Briefcase },
    { id: "evaluation", label: "Interviews & Scoring", icon: Award },
    { id: "governance", label: "Admin & Access", icon: ShieldCheck },
    { id: "analytics", label: "Reports & Charts", icon: BarChart3 },
  ];

  const categoryDetails = {
    candidate: {
      title: "Candidate Dashboard & Job Applications",
      badge: "For Candidates",
      features: [
        { title: "Developer Profile & Skills", icon: Code2 },
        { title: "PDF Resume Upload", icon: FileCheck2 },
        { title: "Live Application Status", icon: CheckCircle2 },
        { title: "Online Offer Acceptance", icon: FileCheck2 },
      ],
    },
    recruiter: {
      title: "Job Postings & Candidate Pipeline",
      badge: "For Recruiters",
      features: [
        { title: "Create & Publish Job Posts", icon: Briefcase },
        { title: "Shortlist & Move Candidates", icon: Zap },
        { title: "Schedule Panel Interviews", icon: Calendar },
        { title: "Send Offer Letters", icon: FileCheck2 },
      ],
    },
    evaluation: {
      title: "Question Bank & Interview Scorecards",
      badge: "For Interviewers",
      features: [
        { title: "Role & Skill Question Bank", icon: Code2 },
        { title: "1–5 Skill Rating Scorecards", icon: Award },
        { title: "Hire / Hold / Reject Recommendations", icon: CheckCircle2 },
        { title: "Custom Team Questions", icon: Database },
      ],
    },
    governance: {
      title: "Role Access & Activity Logs",
      badge: "For Admins",
      features: [
        { title: "Organization Data Separation", icon: Database },
        { title: "Role-Based Access Control", icon: Lock },
        { title: "User & Action Audit Logs", icon: ShieldCheck },
        { title: "JWT Login & Google/GitHub Auth", icon: Lock },
      ],
    },
    analytics: {
      title: "Hiring Funnel & Monthly Reports",
      badge: "Analytics",
      features: [
        { title: "Stage-by-Stage Hiring Funnel", icon: BarChart3 },
        { title: "Monthly Application Trends", icon: Zap },
        { title: "Interview Completion Stats", icon: Award },
        { title: "Offer Status Breakdown", icon: FileCheck2 },
      ],
    },
  };

  const currentCategory = categoryDetails[activeTab];

  const matrix = [
    { capability: "Build developer profile & upload resume", candidate: true, recruiter: false, interviewer: false, admin: false },
    { capability: "Browse & apply to open jobs", candidate: true, recruiter: false, interviewer: false, admin: false },
    { capability: "Post jobs & set interview rounds", candidate: false, recruiter: true, interviewer: false, admin: true },
    { capability: "Shortlist applicants & update status", candidate: false, recruiter: true, interviewer: false, admin: true },
    { capability: "Manage technical question bank", candidate: false, recruiter: false, interviewer: true, admin: false },
    { capability: "Submit 1–5 interview scorecards", candidate: false, recruiter: false, interviewer: true, admin: true },
    { capability: "Send job offers to candidates", candidate: false, recruiter: true, interviewer: false, admin: true },
    { capability: "Accept or decline job offers", candidate: true, recruiter: false, interviewer: false, admin: false },
    { capability: "View hiring charts & funnel stats", candidate: false, recruiter: true, interviewer: false, admin: true },
    { capability: "Manage users & roles", candidate: false, recruiter: false, interviewer: false, admin: true },
    { capability: "View activity audit logs", candidate: false, recruiter: false, interviewer: false, admin: true },
  ];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat scale-105 blur-[4px]"
        style={{ backgroundImage: "url('/office-bg.jpg')" }}
      />
      <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-slate-950/60 via-slate-900/45 to-slate-950/75" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl border border-white/25 bg-slate-900/50 backdrop-blur-2xl p-6 sm:p-12 shadow-[0_32px_90px_rgba(2,6,23,0.85)] ring-1 ring-white/10 space-y-10">
          <div className="pointer-events-none hidden lg:grid grid-cols-2 gap-3 absolute left-8 top-64 opacity-20">
            <div className="w-12 h-12 rounded-xl border border-white/30 bg-white/5 flex items-center justify-center text-white">
              <Users className="w-5 h-5" />
            </div>
            <div className="w-12 h-12 rounded-xl border border-white/30 bg-white/5 flex items-center justify-center text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div className="w-12 h-12 rounded-xl border border-white/30 bg-white/5 flex items-center justify-center text-white">
              <Clock className="w-5 h-5" />
            </div>
            <div className="w-12 h-12 rounded-xl border border-white/30 bg-white/5 flex items-center justify-center text-white">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>

          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-sm">
              Platform Features
            </h1>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const active = activeTab === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveTab(cat.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? "border border-sky-300/40 bg-gradient-to-b from-sky-400 to-blue-600 text-white shadow-[0_0_20px_rgba(56,189,248,0.45)]"
                      : "border border-white/20 bg-white/10 hover:bg-white/20 backdrop-blur-md text-slate-100 hover:text-white"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? "text-white" : "text-sky-300"}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          <div className="relative z-10 max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl bg-slate-950/75 border border-white/20 backdrop-blur-xl shadow-2xl space-y-6">
            <div>
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-sky-300">
                {currentCategory.badge}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                {currentCategory.title}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {currentCategory.features.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-900/85 border border-white/15 flex items-center gap-3 hover:border-sky-400/40 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/30 text-sky-300 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white">{item.title}</h3>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto space-y-4 pt-2">
            <div className="text-center max-w-xl mx-auto">
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Role Permission Matrix
              </h2>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/20 bg-slate-950/75 backdrop-blur-xl shadow-2xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/15 bg-slate-900/90 text-slate-100 font-semibold">
                    <th className="py-3.5 px-5">Capability</th>
                    <th className="py-3.5 px-3 text-center">Candidate</th>
                    <th className="py-3.5 px-3 text-center">Recruiter</th>
                    <th className="py-3.5 px-3 text-center">Interviewer</th>
                    <th className="py-3.5 px-3 text-center">Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {matrix.map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.04] transition-colors">
                      <td className="py-3 px-5 text-slate-100 font-medium">{row.capability}</td>
                      <td className="py-3 px-3 text-center text-sky-300 font-bold">
                        {row.candidate ? "✓" : <span className="text-slate-500 font-normal">—</span>}
                      </td>
                      <td className="py-3 px-3 text-center text-sky-300 font-bold">
                        {row.recruiter ? "✓" : <span className="text-slate-500 font-normal">—</span>}
                      </td>
                      <td className="py-3 px-3 text-center text-sky-300 font-bold">
                        {row.interviewer ? "✓" : <span className="text-slate-500 font-normal">—</span>}
                      </td>
                      <td className="py-3 px-3 text-center text-sky-300 font-bold">
                        {row.admin ? "✓" : <span className="text-slate-500 font-normal">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto p-6 rounded-2xl bg-slate-950/75 border border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">Ready to explore InterviewHub?</h3>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <Link
                to="/register"
                className="border border-sky-300/40 bg-gradient-to-b from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-[0_0_20px_rgba(56,189,248,0.45)] transition-all inline-flex items-center gap-1.5"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/contact"
                className="border border-white/25 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
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

export default Features;
