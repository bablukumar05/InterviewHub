import { Link } from "react-router-dom";
import { Briefcase, ArrowUpRight } from "lucide-react";

const PublicFooter = () => {
  return (
    <footer className="relative z-10 overflow-hidden text-slate-300 text-xs pb-10 pt-2 px-4 sm:px-6 lg:px-8">
      <div className="relative z-10 max-w-6xl mx-auto rounded-3xl border border-white/25 bg-slate-900/55 backdrop-blur-2xl shadow-[0_28px_80px_rgba(2,6,23,0.85)] ring-1 ring-white/10 overflow-hidden">
        <div className="border-b border-white/15 bg-slate-950/40 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-white font-semibold">All Systems Online</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">MERN Stack (MongoDB, Express, React, Node.js)</span>
          </div>

          <div className="flex items-center gap-4 text-slate-300 font-medium">
            <span>Technical Interview Portal</span>
          </div>
        </div>

        <div className="px-6 sm:px-8 py-8 sm:py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 space-y-3">
              <Link to="/" className="inline-flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-sky-500/20">
                  <Briefcase className="w-4 h-4" />
                </div>
                <span className="text-base font-extrabold tracking-tight text-white">
                  Interview<span className="text-sky-400">Hub</span>
                </span>
              </Link>

              <div className="text-xs text-slate-300 max-w-xs leading-relaxed">
                End-to-end technical hiring, panel scheduling, question bank, and structured interview scorecards.
              </div>

              <div className="pt-1 flex items-center gap-2 text-[11px] text-sky-300 font-mono">
                <span className="rounded-md border border-sky-400/25 bg-sky-500/10 px-2 py-0.5">
                  v1.0.0
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300">Role-Based Access Control</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Modules
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li>
                  <Link to="/features" className="hover:text-white transition-colors">
                    Candidate Portal
                  </Link>
                </li>
                <li>
                  <Link to="/features" className="hover:text-white transition-colors">
                    Interview Scheduling
                  </Link>
                </li>
                <li>
                  <Link to="/features" className="hover:text-white transition-colors">
                    Question Bank
                  </Link>
                </li>
                <li>
                  <Link to="/features" className="hover:text-white transition-colors">
                    Evaluation Scorecards
                  </Link>
                </li>
                <li>
                  <Link to="/features" className="hover:text-white transition-colors">
                    Offer Management
                  </Link>
                </li>
                <li>
                  <Link to="/features" className="hover:text-white transition-colors">
                    Hiring Analytics
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Workspaces
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li>
                  <Link to="/login" className="hover:text-white transition-colors inline-flex items-center gap-1">
                    <span>Candidate Portal</span>
                    <ArrowUpRight className="w-3 h-3 text-sky-400" />
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white transition-colors inline-flex items-center gap-1">
                    <span>Recruiter Pipeline</span>
                    <ArrowUpRight className="w-3 h-3 text-sky-400" />
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white transition-colors inline-flex items-center gap-1">
                    <span>Interviewer Workspace</span>
                    <ArrowUpRight className="w-3 h-3 text-sky-400" />
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white transition-colors inline-flex items-center gap-1">
                    <span>Admin Console</span>
                    <ArrowUpRight className="w-3 h-3 text-sky-400" />
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Quick Links
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li>
                  <Link to="/jobs" className="hover:text-white transition-colors">
                    Open Jobs
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-white transition-colors">
                    About Platform
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-white transition-colors">
                    Contact & Support
                  </Link>
                </li>
                <li>
                  <Link to="/features" className="hover:text-white transition-colors">
                    Architecture & Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-5 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-300">
            <span>© 2026 InterviewHub. All rights reserved.</span>
            <span className="font-semibold text-white">Built by Bablu Kumar</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
