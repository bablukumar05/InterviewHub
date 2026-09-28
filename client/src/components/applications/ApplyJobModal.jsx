import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  Send,
  UserRound,
  X,
} from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createApplication,
  getMyApplications,
  getMyCandidateProfile,
} from "../../api/applicationApi";

import { applicationSchema } from "../../validators/applicationSchema";

const MIN_PROFILE_COMPLETION = Number(
  import.meta.env.VITE_MIN_PROFILE_COMPLETION || 60
);

const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    "Something went wrong. Please try again."
  );
};

const getErrorStatus = (error) => {
  return error?.response?.status;
};

export default function ApplyJobModal({
  isOpen,
  onClose,
  job,
  onApplicationSuccess,
}) {
  const [step, setStep] = useState("checking");
  const [profile, setProfile] = useState(null);
  const [existingApplication, setExistingApplication] = useState(null);
  const [createdApplicationId, setCreatedApplicationId] = useState(null);
  const [readinessError, setReadinessError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      coverLetter: "",
    },
  });

  const coverLetterValue = watch("coverLetter") || "";

  useEffect(() => {
    if (!isOpen || !job?._id) return;

    let cancelled = false;

    const checkApplicationReadiness = async () => {
      setStep("checking");
      setProfile(null);
      setExistingApplication(null);
      setReadinessError("");
      setSubmitError("");

      try {

        const profileResponse = await getMyCandidateProfile();

        if (cancelled) return;

        const candidateProfile =
          profileResponse?.data || profileResponse?.profile || profileResponse;

        setProfile(candidateProfile);

        const completion = Number(
          candidateProfile?.profileCompletion || 0
        );

        const resumeUrl =
          candidateProfile?.resumeUrl || candidateProfile?.resume?.url;

        if (completion < MIN_PROFILE_COMPLETION) {
          setReadinessError(
            `Complete at least ${MIN_PROFILE_COMPLETION}% of your profile before applying.`
          );

          setStep("blocked");
          return;
        }

        if (!resumeUrl) {
          setReadinessError(
            "Please upload your resume before applying for this job."
          );

          setStep("blocked");
          return;
        }

        const applicationsResponse = await getMyApplications({
          jobId: job._id,
          page: 1,
          limit: 1,
        });

        if (cancelled) return;

        const applications =
          applicationsResponse?.data?.applications ||
          applicationsResponse?.data?.items ||
          applicationsResponse?.applications ||
          applicationsResponse?.data ||
          [];

        if (Array.isArray(applications) && applications.length > 0) {
          setExistingApplication(applications[0]);
          setStep("already-applied");
          return;
        }

        setStep("form");
      } catch (error) {
        if (cancelled) return;

        const status = getErrorStatus(error);

        if (status === 404) {
          setReadinessError(
            "Please complete your candidate profile before applying."
          );

          setStep("blocked");
          return;
        }

        setReadinessError(getErrorMessage(error));
        setStep("error");
      }
    };

    checkApplicationReadiness();

    return () => {
      cancelled = true;
    };
  }, [isOpen, job?._id]);

  useEffect(() => {
    if (!isOpen) {
      reset({
        coverLetter: "",
      });

      setStep("checking");
      setProfile(null);
      setExistingApplication(null);
      setCreatedApplicationId(null);
      setReadinessError("");
      setSubmitError("");
      setIsSubmitting(false);
    }
  }, [isOpen, reset]);

  const handleApplicationSubmit = async (values) => {
    if (!job?._id) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await createApplication({
        jobId: job._id,
        coverLetter: values.coverLetter?.trim() || "",
      });

      const createdApplication =
        response?.data?.application ||
        response?.application ||
        response?.data;

      const appId =
        createdApplication?._id ||
        createdApplication?.id ||
        null;

      if (appId) {
        setCreatedApplicationId(appId);
      }

      setStep("success");

      onApplicationSuccess?.(createdApplication);
    } catch (error) {
      const status = getErrorStatus(error);
      const message = getErrorMessage(error);

      if (status === 409) {
        setSubmitError(
          "You have already applied for this job."
        );

        setStep("already-applied-submit");
        return;
      }

      setSubmitError(message);
      setStep("submit-error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !job) return null;

  const completion = Number(profile?.profileCompletion || 0);

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget && !isSubmitting) {
            onClose();
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl"
        >

          <div className="flex items-start justify-between border-b border-white/10 px-6 py-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                Apply for position
              </p>

              <h2 className="mt-1 text-xl font-semibold text-white">
                {job.title}
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                {job.organizationId?.name ||
                  job.organization?.name ||
                  "Company"}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Close application dialog"
            >
              <X size={20} />
            </button>
          </div>

          <div className="max-h-[75vh] overflow-y-auto p-6">
            {step === "checking" && (
              <div className="flex min-h-[240px] flex-col items-center justify-center text-center">
                <Loader2
                  className="animate-spin text-indigo-400"
                  size={32}
                />

                <h3 className="mt-4 text-base font-medium text-white">
                  Checking application readiness
                </h3>

                <p className="mt-2 max-w-sm text-sm text-slate-400">
                  We are checking your profile, resume, and existing
                  application status.
                </p>
              </div>
            )}

            {step === "blocked" && (
              <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-5">
                <div className="flex gap-3">
                  <AlertCircle
                    className="mt-0.5 shrink-0 text-amber-400"
                    size={22}
                  />

                  <div>
                    <h3 className="font-medium text-white">
                      Application not ready
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {readinessError}
                    </p>

                    {profile && (
                      <div className="mt-4">
                        <div className="mb-2 flex items-center justify-between text-xs">
                          <span className="text-slate-400">
                            Profile completion
                          </span>

                          <span className="font-medium text-white">
                            {completion}%
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                          <div
                            className="h-full rounded-full bg-indigo-500 transition-all"
                            style={{
                              width: `${Math.min(completion, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="mt-5 flex flex-wrap gap-3">
                      <Link
                        to="/candidate/profile"
                        onClick={onClose}
                        className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-400"
                      >
                        Complete Profile
                      </Link>

                      <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === "already-applied" && (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/10">
                  <CheckCircle2
                    className="text-emerald-400"
                    size={30}
                  />
                </div>

                <h3 className="mt-5 text-xl font-semibold text-white">
                  Already applied
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                  You have already submitted an application for this
                  position.
                </p>

                {existingApplication?.status && (
                  <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                    <span>Status:</span>
                    <span className="font-semibold text-white">
                      {String(existingApplication.status).replace(
                        /_/g,
                        " "
                      )}
                    </span>
                  </div>
                )}

                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  {existingApplication?._id && (
                    <Link
                      to={`/candidate/applications/${existingApplication._id}`}
                      onClick={onClose}
                      className="rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400"
                    >
                      View Application
                    </Link>
                  )}

                  <Link
                    to="/candidate/applications"
                    onClick={onClose}
                    className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
                  >
                    View All Applications
                  </Link>

                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {step === "form" && (
              <form
                onSubmit={handleSubmit(handleApplicationSubmit)}
                className="space-y-6"
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-indigo-400/10 p-2">
                        <UserRound
                          className="text-indigo-400"
                          size={18}
                        />
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Profile
                        </p>

                        <p className="mt-0.5 text-sm font-medium text-white">
                          {completion}% complete
                        </p>
                      </div>

                      <CheckCircle2
                        className="ml-auto text-emerald-400"
                        size={18}
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-indigo-400/10 p-2">
                        <FileText
                          className="text-indigo-400"
                          size={18}
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs text-slate-500">
                          Resume
                        </p>

                        <p className="mt-0.5 truncate text-sm font-medium text-white">
                          {profile?.resumeOriginalName ||
                            profile?.resume?.originalName ||
                            "Resume uploaded"}
                        </p>
                      </div>

                      <CheckCircle2
                        className="ml-auto shrink-0 text-emerald-400"
                        size={18}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="coverLetter"
                      className="text-sm font-medium text-white"
                    >
                      Cover letter
                    </label>

                    <span className="text-xs text-slate-500">
                      {coverLetterValue.length}/3000
                    </span>
                  </div>

                  <textarea
                    id="coverLetter"
                    rows={8}
                    maxLength={3000}
                    placeholder="Tell the recruiter why you're a strong fit for this role..."
                    {...register("coverLetter")}
                    className="w-full resize-none rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-400/10"
                  />

                  {errors.coverLetter && (
                    <p className="mt-2 text-xs text-red-400">
                      {errors.coverLetter.message}
                    </p>
                  )}
                </div>

                {step === "submit-error" && submitError && (
                  <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-4">
                    <div className="flex gap-3">
                      <AlertCircle
                        className="shrink-0 text-red-400"
                        size={18}
                      />

                      <p className="text-sm leading-6 text-red-300">
                        {submitError}
                      </p>
                    </div>
                  </div>
                )}

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <p className="text-xs leading-5 text-slate-500">
                    Your application will use your current profile,
                    skills, experience, and uploaded resume. You cannot
                    modify those details from this form.
                  </p>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={17} />
                        Submit Application
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {step === "already-applied-submit" && (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-400/10">
                  <AlertCircle
                    className="text-amber-400"
                    size={30}
                  />
                </div>

                <h3 className="mt-5 text-xl font-semibold text-white">
                  Application already exists
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                  {submitError}
                </p>

                <div className="mt-7 flex justify-center gap-3">
                  <Link
                    to="/candidate/applications"
                    onClick={onClose}
                    className="rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400"
                  >
                    View Application Status
                  </Link>

                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {step === "success" && (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/10">
                  <CheckCircle2
                    className="text-emerald-400"
                    size={36}
                  />
                </div>

                <h3 className="mt-5 text-2xl font-semibold text-white">
                  Application submitted
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                  Your application for{" "}
                  <span className="font-medium text-slate-200">
                    {job.title}
                  </span>{" "}
                  has been submitted successfully.
                </p>

                <div className="mt-6 rounded-xl border border-emerald-400/10 bg-emerald-400/5 p-4">
                  <p className="text-sm text-emerald-300">
                    Application status
                  </p>

                  <p className="mt-1 text-lg font-semibold text-white">
                    Applied
                  </p>
                </div>

                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  {createdApplicationId && (
                    <Link
                      to={`/candidate/applications/${createdApplicationId}`}
                      onClick={onClose}
                      className="rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400"
                    >
                      View Application Details
                    </Link>
                  )}

                  <Link
                    to="/candidate/applications"
                    onClick={onClose}
                    className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
                  >
                    All Applications
                  </Link>

                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            {step === "error" && (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-400/10">
                  <AlertCircle
                    className="text-red-400"
                    size={30}
                  />
                </div>

                <h3 className="mt-5 text-xl font-semibold text-white">
                  Unable to continue
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                  {readinessError}
                </p>

                <button
                  type="button"
                  onClick={onClose}
                  className="mt-7 rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
