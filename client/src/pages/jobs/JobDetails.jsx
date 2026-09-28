import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  MapPin,
  Users,
} from 'lucide-react';

import {
  getJobById,
} from '../../api/jobApi';
import { getMyApplications } from '../../api/applicationApi';
import { useAuth } from '../../context/AuthContext';
import ApplyJobModal from '../../components/applications/ApplyJobModal';

const formatEmploymentType = (value) => {
  const labels = {
    FULL_TIME: 'Full Time',
    PART_TIME: 'Part Time',
    INTERNSHIP: 'Internship',
    CONTRACT: 'Contract',
  };

  return labels[value] || value;
};

const formatWorkMode = (value) => {
  const labels = {
    REMOTE: 'Remote',
    HYBRID: 'Hybrid',
    ONSITE: 'Onsite',
  };

  return labels[value] || value;
};

const formatExperienceLevel = (value) => {
  const labels = {
    ENTRY_LEVEL: 'Entry Level',
    JUNIOR: 'Junior',
    MID_LEVEL: 'Mid Level',
    SENIOR: 'Senior',
    LEAD: 'Lead',
    EXECUTIVE: 'Executive',
  };

  return labels[value] || value;
};

const formatSalary = (salary) => {
  if (!salary) {
    return 'Salary not disclosed';
  }

  const min = Number(salary.min || 0);
  const max = Number(salary.max || 0);
  const currency = salary.currency || 'INR';
  const period = salary.period || 'YEARLY';

  if (!min && !max) {
    return 'Salary not disclosed';
  }

  let formatter;

  try {
    formatter = new Intl.NumberFormat(
      'en-IN',
      {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
      }
    );
  } catch {
    formatter = new Intl.NumberFormat(
      'en-IN',
      {
        maximumFractionDigits: 0,
      }
    );
  }

  let value = '';

  if (min && max) {
    value = `${formatter.format(min)} - ${formatter.format(max)}`;
  } else {
    value = formatter.format(min || max);
  }

  const periodLabels = {
    YEARLY: '/ year',
    MONTHLY: '/ month',
    HOURLY: '/ hour',
  };

  return `${value} ${
    periodLabels[period] || ''
  }`;
};

const formatDate = (value) => {
  if (!value) {
    return 'Not specified';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Not specified';
  }

  return date.toLocaleDateString(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }
  );
};

const getCompanyName = (job) => {
  if (
    job.organizationId &&
    typeof job.organizationId === 'object'
  ) {
    return (
      job.organizationId.name ||
      'Organization'
    );
  }

  return 'Organization';
};

const getCompanyWebsite = (job) => {
  if (
    job.organizationId &&
    typeof job.organizationId === 'object'
  ) {
    return job.organizationId.website || '';
  }

  return '';
};

const Section = ({
  title,
  children,
}) => {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <h2 className="text-lg font-semibold text-white">
        {title}
      </h2>

      <div className="mt-4">
        {children}
      </div>
    </section>
  );
};

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const handleApplyClick = () => {

    if (!user) {
      navigate(
        `/login?redirect=${encodeURIComponent(`/jobs/${job?._id || id}`)}`
      );
      return;
    }

    if (user.role !== 'CANDIDATE') {
      return;
    }

    setIsApplyOpen(true);
  };

  useEffect(() => {
    const loadJob = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await getJobById(id);

        if (response?.success && response?.data) {
          setJob(response.data);
        } else {
          setError('Job could not be found.');
        }
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            'Unable to load job details.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadJob();
    }
  }, [id]);

  useEffect(() => {
    if (!user || user.role !== 'CANDIDATE' || !id) return;

    let isMounted = true;
    const checkAppliedStatus = async () => {
      try {
        const res = await getMyApplications({ limit: 100 });
        const apps = res?.data?.applications || [];
        const match = apps.some((app) => {
          const appJobId = app.jobId?._id || app.jobId || app.job?._id || app.job;
          return String(appJobId) === String(id);
        });
        if (isMounted) {
          setHasApplied(match);
        }
      } catch {}
    };

    checkAppliedStatus();

    return () => {
      isMounted = false;
    };
  }, [user, id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        <div className="animate-pulse space-y-6">

          <div className="h-5 w-32 rounded bg-white/5" />

          <div className="h-44 rounded-3xl border border-white/10 bg-white/[0.03]" />

          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">

            <div className="space-y-6">
              <div className="h-64 rounded-2xl bg-white/[0.03]" />
              <div className="h-48 rounded-2xl bg-white/[0.03]" />
            </div>

            <div className="h-80 rounded-2xl bg-white/[0.03]" />

          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="mx-auto flex min-h-[500px] max-w-2xl items-center justify-center px-4">

        <div className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">

          <BriefcaseBusiness className="mx-auto h-10 w-10 text-slate-600" />

          <h1 className="mt-4 text-2xl font-semibold text-white">
            Job not found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {error ||
              'This job may no longer be available.'}
          </p>

          <Link
            to="/jobs"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            <ArrowLeft size={16} />
            Browse jobs
          </Link>

        </div>

      </div>
    );
  }

  const organization =
    job.organizationId &&
    typeof job.organizationId === 'object'
      ? job.organizationId
      : null;

  const recruiter =
    job.recruiterId &&
    typeof job.recruiterId === 'object'
      ? job.recruiterId
      : null;

  const companyName =
    getCompanyName(job);

  const website =
    getCompanyWebsite(job);

  const renderApplyAction = (isSidebar = false) => {
    const isJobOpen =
      job.status === 'PUBLISHED' &&
      (!job.deadline || new Date(job.deadline).getTime() >= Date.now());

    if (!isJobOpen) {
      return (
        <button
          type="button"
          disabled
          className={`${
            isSidebar ? 'w-full' : ''
          } rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-500 cursor-not-allowed`}
        >
          Applications Closed
        </button>
      );
    }

    if (user && (user.role === 'RECRUITER' || user.role === 'ADMIN')) {
      const isOwner =
        user.role === 'ADMIN' ||
        String(job.recruiterId?._id || job.recruiterId) ===
          String(user.userId || user.id || user._id);
      if (isOwner) {
        return (
          <Link
            to={`/recruiter/applications?jobId=${job._id}`}
            className={`${
              isSidebar ? 'w-full' : ''
            } inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition`}
          >
            <Users size={16} />
            View Applicants ({job.applicantsCount || 0})
          </Link>
        );
      }
    }

    if (!user) {
      return (
        <button
          type="button"
          onClick={handleApplyClick}
          className={`${
            isSidebar ? 'w-full' : ''
          } inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition`}
        >
          Sign in to Apply
          <ArrowRight size={16} />
        </button>
      );
    }

    if (user.role === 'CANDIDATE') {
      if (hasApplied) {
        return (
          <Link
            to="/candidate/applications"
            className={`${
              isSidebar ? 'w-full' : ''
            } inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-2.5 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/20 transition`}
          >
            <CheckCircle2 size={16} />
            Applied &bull; View Status
          </Link>
        );
      }

      return (
        <button
          type="button"
          onClick={handleApplyClick}
          className={`${
            isSidebar ? 'w-full' : ''
          } inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 active:scale-[0.99] transition`}
        >
          Apply Now
          <ArrowRight size={16} />
        </button>
      );
    }

    return null;
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <Link
        to="/jobs"
        className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
      >
        <ArrowLeft size={16} />
        Back to jobs
      </Link>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-slate-950">
                {organization?.logo ? (
                  <img
                    src={organization.logo}
                    alt={companyName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <BriefcaseBusiness
                    size={28}
                    className="text-indigo-400"
                  />
                )}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium text-indigo-400">
                  {companyName}
                </p>

                <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  {job.title}
                </h1>

                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-400">
                  <span className="inline-flex items-center gap-2">
                    <MapPin size={15} />
                    {job.location ||
                      'Location not specified'}
                  </span>

                  <span className="inline-flex items-center gap-2">
                    <BriefcaseBusiness size={15} />
                    {formatEmploymentType(
                      job.employmentType
                    )}
                  </span>

                  <span className="inline-flex items-center gap-2">
                    <Clock3 size={15} />
                    {formatWorkMode(
                      job.workMode
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {renderApplyAction(false)}

              {website && (
                <a
                  href={website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  Company website
                  <ExternalLink size={15} />
                </a>
              )}
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetaCard
              label="Experience"
              value={formatExperienceLevel(
                job.experienceLevel
              )}
            />

            <MetaCard
              label="Salary"
              value={formatSalary(job.salary)}
            />

            <MetaCard
              label="Openings"
              value={`${job.openings} ${
                job.openings === 1
                  ? 'opening'
                  : 'openings'
              }`}
            />

            <MetaCard
              label="Apply by"
              value={formatDate(
                job.deadline
              )}
            />
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <main className="space-y-6">
          <Section title="About the role">
            <p className="whitespace-pre-line text-sm leading-7 text-slate-300">
              {job.description}
            </p>
          </Section>

          {job.responsibilities?.length > 0 && (
            <Section title="Responsibilities">
              <ul className="space-y-3">
                {job.responsibilities.map(
                  (item, index) => (
                    <li
                      key={`${item}-${index}`}
                      className="flex gap-3 text-sm leading-6 text-slate-300"
                    >
                      <CheckCircle2
                        size={18}
                        className="mt-1 shrink-0 text-indigo-400"
                      />

                      <span>{item}</span>
                    </li>
                  )
                )}
              </ul>
            </Section>
          )}

          {job.requirements?.length > 0 && (
            <Section title="Requirements">
              <ul className="space-y-3">
                {job.requirements.map(
                  (item, index) => (
                    <li
                      key={`${item}-${index}`}
                      className="flex gap-3 text-sm leading-6 text-slate-300"
                    >
                      <CheckCircle2
                        size={18}
                        className="mt-1 shrink-0 text-emerald-400"
                      />

                      <span>{item}</span>
                    </li>
                  )
                )}
              </ul>
            </Section>
          )}

          {job.skills?.length > 0 && (
            <Section title="Skills">
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-slate-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {job.interviewRounds?.length > 0 && (
            <Section title="Interview process">
              <div className="space-y-4">
                {[...job.interviewRounds]
                  .sort(
                    (a, b) =>
                      a.order - b.order
                  )
                  .map((round, index) => (
                    <div
                      key={`${round.name}-${round.order}-${index}`}
                      className="flex gap-4 rounded-xl border border-white/10 bg-slate-950/30 p-4"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-sm font-semibold text-indigo-400">
                        {round.order}
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-medium text-white">
                          {round.name}
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          {formatRoundType(
                            round.type
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </Section>
          )}
        </main>

        <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
            <h2 className="text-lg font-semibold text-white">
              Apply for this role
            </h2>

            <div className="pt-1">
              {renderApplyAction(true)}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-lg font-semibold text-white">
              Job overview
            </h2>

            <div className="mt-5 space-y-4">
              <InfoRow
                icon={BriefcaseBusiness}
                label="Employment"
                value={formatEmploymentType(
                  job.employmentType
                )}
              />

              <InfoRow
                icon={Clock3}
                label="Work mode"
                value={formatWorkMode(
                  job.workMode
                )}
              />

              <InfoRow
                icon={Users}
                label="Openings"
                value={`${job.openings}`}
              />

              <InfoRow
                icon={CalendarDays}
                label="Deadline"
                value={formatDate(
                  job.deadline
                )}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-lg font-semibold text-white">
              Company
            </h2>

            <div className="mt-4">
              <p className="font-medium text-white">
                {companyName}
              </p>

              {recruiter?.name && (
                <p className="mt-1 text-sm text-slate-500">
                  Posted by {recruiter.name}
                </p>
              )}

              {website && (
                <a
                  href={website}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300"
                >
                  Visit website
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        </aside>
      </div>

      <ApplyJobModal
        job={job}
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        onApplicationSuccess={() => {
          setHasApplied(true);
          setJob((prev) => (prev ? { ...prev, applicantsCount: (prev.applicantsCount || 0) + 1 } : prev));
        }}
      />
    </div>
  );
};

const MetaCard = ({
  label,
  value,
}) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">

      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-sm font-medium text-white">
        {value}
      </p>

    </div>
  );
};

const InfoRow = ({
  icon: Icon,
  label,
  value,
}) => {
  return (
    <div className="flex items-start gap-3">

      <div className="rounded-lg bg-indigo-500/10 p-2">
        <Icon
          size={15}
          className="text-indigo-400"
        />
      </div>

      <div>
        <p className="text-xs text-slate-500">
          {label}
        </p>

        <p className="mt-1 text-sm text-slate-300">
          {value}
        </p>
      </div>

    </div>
  );
};

const formatRoundType = (value) => {
  const labels = {
    TECHNICAL: 'Technical',
    SYSTEM_DESIGN: 'System Design',
    BEHAVIORAL: 'Behavioral',
    HR: 'HR',
    FINAL: 'Final',
  };

  return labels[value] || value;
};

export default JobDetails;
