import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  MapPin,
  Phone,
  Send,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Building2,
} from "lucide-react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Support",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 450);
  };

  const faqs = [
    {
      q: "How do interview video links work?",
      a: "When a recruiter schedules a round, they can attach a Google Meet or Zoom link. Both the candidate and interviewer can join directly from their dashboard.",
    },
    {
      q: "Who can add questions to the Question Bank?",
      a: "Interviewers can add, edit, and filter technical questions by role, skill tag, and difficulty level for use during live interviews.",
    },
    {
      q: "How is the overall evaluation score calculated?",
      a: "Interviewers rate each skill from 1 to 5. The backend calculates the overall percentage score automatically when the scorecard is submitted.",
    },
    {
      q: "Can candidates apply without an invite?",
      a: "Yes. Candidates can sign up, complete their profile, upload a resume PDF, and apply to any open job post.",
    },
    {
      q: "What roles are available in InterviewHub?",
      a: "There are 4 roles: Admin, Recruiter, Interviewer, and Candidate.",
    },
  ];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat scale-105 blur-[4px]"
        style={{ backgroundImage: "url('/office-bg.jpg')" }}
      />
      <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-slate-950/60 via-slate-900/45 to-slate-950/75" />

      <div className="relative z-10 max-w-6xl mx-auto space-y-10">
        <div className="rounded-3xl border border-white/25 bg-slate-900/55 backdrop-blur-2xl p-6 sm:p-10 shadow-[0_32px_90px_rgba(2,6,23,0.85)] ring-1 ring-white/10 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-6 space-y-5">
              <div className="space-y-2.5">
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/15 px-3 py-1 text-[11px] font-semibold text-sky-200">
                  <span>InterviewHub · Technical Hiring Portal</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Contact Our Team
                </h1>

                <div className="text-xs sm:text-sm text-slate-200">
                  Get in touch with InterviewHub for support, sales, or general inquiries.
                </div>
              </div>

              {submitted ? (
                <div className="rounded-2xl border border-white/20 bg-slate-950/70 p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h2 className="text-lg font-bold text-white">Message Sent</h2>
                  <div className="text-xs text-slate-300">
                    Our team will get back to you within 24 hours.
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: "",
                        email: "",
                        subject: "Support",
                        message: "",
                      });
                    }}
                    className="mt-2 px-4 py-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-100 mb-1.5">
                        Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Your Full Name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/95 border border-white/40 text-xs text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-100 mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="Your Work Email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/95 border border-white/40 text-xs text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-100 mb-1.5">
                      Subject
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/95 border border-white/40 text-xs font-medium text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                    >
                      <option value="Support">Support</option>
                      <option value="Enterprise Sales">Enterprise Sales</option>
                      <option value="Technical Demo">Technical Demo</option>
                      <option value="Partnership">Partnership</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-100 mb-1.5">
                      Message
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Describe your query or request..."
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/95 border border-white/40 text-xs text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 border border-sky-300/40 bg-gradient-to-b from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 text-white font-semibold text-xs py-3 rounded-xl shadow-[0_0_20px_rgba(56,189,248,0.45)] transition-all cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            <div className="lg:col-span-6 space-y-3">
              <h2 className="text-lg font-bold text-white">Contact Us</h2>

              <div className="rounded-2xl bg-white/95 backdrop-blur-md border border-white/60 p-5 sm:p-6 text-slate-900 shadow-xl space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-200/80">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="text-xs space-y-0.5">
                      <div className="font-bold text-slate-900">Email</div>
                      <div className="text-slate-600">support@interviewhub.com</div>
                      <div className="text-slate-600">sales@interviewhub.com</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="text-xs space-y-0.5">
                      <div className="font-bold text-slate-900">Phone</div>
                      <div className="text-slate-600">+91 1800-300-4000 (Sales)</div>
                      <div className="text-slate-600">+91 1800-300-4001 (Support)</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-200/80">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="text-xs space-y-0.5">
                      <div className="font-bold text-slate-900">Helpline</div>
                      <div className="text-slate-600">+91 1800-300-4000</div>
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div className="text-xs space-y-0.5">
                        <div className="font-bold text-slate-900">Live Chat</div>
                        <div className="text-slate-600">
                          {chatStarted ? "Support connected" : "Available 24/5"}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setChatStarted((prev) => !prev)}
                      className="rounded-lg border border-sky-300/40 bg-gradient-to-b from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm transition-all shrink-0 cursor-pointer"
                    >
                      {chatStarted ? "Active" : "Start Chat"}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="text-xs space-y-0.5">
                      <div className="font-bold text-slate-900">Office Address</div>
                      <div className="text-slate-600">
                        123 Tech Park, HSR Layout, Bengaluru, KA 560100, India
                      </div>
                    </div>
                  </div>

                  <div className="relative h-24 w-full overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-slate-100 via-sky-50 to-slate-200 flex items-center justify-center">
                    <div
                      className="absolute inset-0 opacity-35"
                      style={{
                        backgroundImage:
                          "radial-gradient(#64748b 1px, transparent 1px), linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)",
                        backgroundSize: "16px 16px, 32px 32px, 32px 32px",
                      }}
                    />
                    <div className="relative z-10 inline-flex items-center gap-2 rounded-full bg-slate-900/90 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md">
                      <MapPin className="w-3.5 h-3.5 text-sky-400" />
                      <span>Bengaluru Tech Park · HSR Layout</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/15 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/jobs"
              className="w-full sm:max-w-md text-center rounded-xl border border-sky-300/40 bg-gradient-to-b from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 py-3 px-6 text-sm font-bold text-white shadow-[0_0_22px_rgba(56,189,248,0.45)] transition-all"
            >
              Browse Jobs
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto text-center rounded-xl border border-white/25 bg-white/10 hover:bg-white/20 backdrop-blur-md py-3 px-7 text-sm font-semibold text-white transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-white/20 bg-slate-900/55 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl space-y-5">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-2.5">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl bg-slate-950/75 border border-white/15 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                    className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-100 hover:text-white cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-sky-400 shrink-0 ml-2" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-sky-200/70 shrink-0 ml-2" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-200 leading-relaxed border-t border-white/10 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
