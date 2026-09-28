import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Code2,
  Briefcase,
  MapPin,
  Globe,
  Sparkles,
  ArrowRight,
  Plus,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const POPULAR_SKILLS = [
  "React",
  "Node.js",
  "TypeScript",
  "JavaScript",
  "Python",
  "Go",
  "MongoDB",
  "PostgreSQL",
  "Docker",
  "AWS",
  "System Design",
  "TailwindCSS",
];

const CandidateOnboarding = () => {
  const { user, completeOnboarding } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    headline: user?.title || "",
    experienceYears: user?.experienceYears || 2,
    location: "Remote",
    preferredRole: "Full Stack Engineer",
    githubUrl: "",
    portfolioUrl: "",
    bio: user?.bio || "",
  });

  const [skills, setSkills] = useState(
    user?.skills && user.skills.length > 0
      ? user.skills
      : ["JavaScript", "React", "Node.js"]
  );
  const [customSkill, setCustomSkill] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleToggleSkill = (skill) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const handleAddCustomSkill = (e) => {
    e.preventDefault();
    if (customSkill.trim() && !skills.includes(customSkill.trim())) {
      setSkills([...skills, customSkill.trim()]);
      setCustomSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError("");

    try {
      setLoading(true);
      const result = await completeOnboarding({
        ...formData,
        skills,
      });

      if (!result.success) {
        setError(result.message || "Failed to update profile.");
        return;
      }

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      setLoading(true);
      await completeOnboarding({
        headline: formData.headline || "Software Engineer",
        skills,
      });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      navigate("/dashboard", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto w-full space-y-8">

        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Candidate Onboarding</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Complete Your Candidate Profile
          </h1>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs text-red-400 text-center">
            {error}
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 shadow-xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Target Role / Professional Headline *
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Full Stack Engineer (React & Node.js)"
                  value={formData.headline}
                  onChange={(e) =>
                    setFormData({ ...formData, headline: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-slate-600 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Years of Experience
                </label>
                <select
                  value={formData.experienceYears}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      experienceYears: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 px-3 text-xs text-white focus:border-blue-500 outline-none"
                >
                  <option value={0}>0 - 1 years (Junior / Entry)</option>
                  <option value={2}>1 - 3 years (Associate / Mid)</option>
                  <option value={4}>3 - 5 years (Mid-Senior)</option>
                  <option value={6}>5 - 8 years (Senior Engineer)</option>
                  <option value={10}>8+ years (Staff / Principal)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Preferred Location / Mode
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru / Pune / Remote"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-slate-600 outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">
                Primary Technical Skills
              </label>

              <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 rounded-lg bg-slate-950 border border-slate-800">
                {skills.length === 0 ? (
                  <span className="text-[11px] text-slate-600">
                    Click popular tags below or type custom skills
                  </span>
                ) : (
                  skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-600/20 text-blue-400 border border-blue-500/30 text-[11px] font-medium"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-white cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Add custom skill (e.g. GraphQL, Rust, Kafka)..."
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomSkill(e);
                    }
                  }}
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-950 py-1.5 px-3 text-xs text-white placeholder:text-slate-600 outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSkill}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              <div className="pt-1.5">
                <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider block mb-1.5">
                  Popular Skills
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_SKILLS.map((item) => {
                    const isSelected = skills.includes(item);
                    return (
                      <button
                        type="button"
                        key={item}
                        onClick={() => handleToggleSkill(item)}
                        className={`text-[11px] px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-blue-600 text-white font-medium"
                            : "bg-slate-800 text-slate-300 hover:bg-slate-750 border border-slate-700/60"
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  GitHub Profile URL
                </label>
                <div className="relative">
                  <Code2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="url"
                    placeholder="https://github.com/username"
                    value={formData.githubUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, githubUrl: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-slate-600 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Portfolio / Website URL
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="url"
                    placeholder="https://yourportfolio.com"
                    value={formData.portfolioUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, portfolioUrl: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-slate-600 outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Short Bio / Background Summary
              </label>
              <textarea
                rows={3}
                placeholder="Briefly describe your software engineering background, interests, and what technologies you enjoy working with..."
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 px-3 text-xs text-white placeholder:text-slate-600 outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handleSkip}
                disabled={loading}
                className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer order-2 sm:order-1"
              >
                Skip for now →
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-6 py-2.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 order-1 sm:order-2"
              >
                {loading ? (
                  <span>Saving Profile...</span>
                ) : (
                  <>
                    <span>Complete Profile & Go to Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CandidateOnboarding;
