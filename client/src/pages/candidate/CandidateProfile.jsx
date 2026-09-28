import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  getMyCandidateProfile,
  createCandidateProfile,
  updateCandidateProfile,
} from '../../api/candidateProfileApi';

import { candidateProfileSchema } from '../../validators/candidateProfileSchema';

import ProfileCompletionCard from '../../components/candidate/ProfileCompletionCard';
import ResumeUpload from '../../components/candidate/ResumeUpload';

const emptyForm = {
  headline: '',
  bio: '',
  phone: '',
  location: '',
  dateOfBirth: '',

  skills: [],

  education: [],

  experience: [],

  certifications: [],

  portfolioUrl: '',
  githubUrl: '',
  linkedinUrl: '',

  salaryExpectation: {
    min: undefined,
    max: undefined,
    currency: 'INR',
  },

  preferredRole: '',
  expectedSalary: undefined,
  noticePeriodDays: 30,
};

const inputClass =
  'w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500';

const textareaClass =
  'w-full resize-none rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500';

const CandidateProfile = () => {
  const [profileExists, setProfileExists] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [completion, setCompletion] = useState(0);
  const [skillInput, setSkillInput] = useState('');
  const [resumeData, setResumeData] = useState({
    resumeUrl: '',
    resumeOriginalName: '',
    resumeSize: 0,
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(candidateProfileSchema),
    defaultValues: emptyForm,
  });

  const skills = watch('skills') || [];

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({
    control,
    name: 'education',
  });

  const {
    fields: experienceFields,
    append: appendExperience,
    remove: removeExperience,
  } = useFieldArray({
    control,
    name: 'experience',
  });

  const {
    fields: certificationFields,
    append: appendCertification,
    remove: removeCertification,
  } = useFieldArray({
    control,
    name: 'certifications',
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoadingProfile(true);
        setServerError('');

        const response = await getMyCandidateProfile();

        if (response?.success && response?.data) {
          const profile = response.data;

          setProfileExists(true);
          setCompletion(profile.profileCompletion || 0);
          setResumeData({
            resumeUrl: profile.resumeUrl || '',
            resumeOriginalName: profile.resumeOriginalName || '',
            resumeSize: profile.resumeSize || 0,
          });

          reset({
            headline: profile.headline || '',
            bio: profile.bio || '',
            phone: profile.phone || '',
            location: profile.location || '',
            dateOfBirth: profile.dateOfBirth
              ? profile.dateOfBirth.slice(0, 10)
              : '',

            skills: profile.skills || [],

            education: (profile.education || []).map((item) => ({
              degree: item.degree || '',
              institution: item.institution || '',
              field: item.field || '',
              startYear: item.startYear,
              endYear: item.endYear,
            })),

            experience: (profile.experience || []).map((item) => ({
              company: item.company || '',
              position: item.position || item.role || '',
              role: item.role || item.position || '',
              startDate: item.startDate
                ? item.startDate.slice(0, 10)
                : '',
              endDate: item.endDate
                ? item.endDate.slice(0, 10)
                : '',
              currentlyWorking:
                item.currentlyWorking ??
                item.current ??
                false,
              current:
                item.current ??
                item.currentlyWorking ??
                false,
              description: item.description || '',
            })),

            certifications: (profile.certifications || []).map(
              (item) => ({
                name: item.name || '',
                title: item.title || '',
                issuer: item.issuer || '',
                issueDate: item.issueDate
                  ? item.issueDate.slice(0, 10)
                  : '',
                expiryDate: item.expiryDate
                  ? item.expiryDate.slice(0, 10)
                  : '',
                credentialUrl: item.credentialUrl || '',
              })
            ),

            portfolioUrl: profile.portfolioUrl || '',
            githubUrl: profile.githubUrl || '',
            linkedinUrl: profile.linkedinUrl || '',

            salaryExpectation: {
              min: profile.salaryExpectation?.min,
              max: profile.salaryExpectation?.max,
              currency:
                profile.salaryExpectation?.currency || 'INR',
            },

            preferredRole: profile.preferredRole || '',

            expectedSalary:
              profile.expectedSalary || undefined,

            noticePeriodDays:
              profile.noticePeriodDays ?? 30,
          });
        }
      } catch (error) {
        if (error.response?.status !== 404) {
          setServerError(
            error.response?.data?.message ||
              'Unable to load candidate profile'
          );
        }
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [reset]);

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      setServerError('');
      setSuccessMessage('');

      const response = profileExists
        ? await updateCandidateProfile(data)
        : await createCandidateProfile(data);

      if (response?.success) {
        setProfileExists(true);

        const updatedProfile = response.data;

        setCompletion(
          updatedProfile?.profileCompletion || 0
        );

        if (updatedProfile?.resumeUrl !== undefined) {
          setResumeData({
            resumeUrl: updatedProfile.resumeUrl || '',
            resumeOriginalName: updatedProfile.resumeOriginalName || '',
            resumeSize: updatedProfile.resumeSize || 0,
          });
        }

        successMessageHandler(
          profileExists
            ? 'Profile updated successfully'
            : 'Profile created successfully'
        );
      }
    } catch (error) {
      const apiData = error.response?.data;
      const validationErrors = apiData?.data?.errors;

      if (Array.isArray(validationErrors)) {
        setServerError(
          validationErrors
            .map(
              (item) =>
                `${item.field}: ${item.message}`
            )
            .join(' • ')
        );
      } else {
        setServerError(
          apiData?.message ||
            'Unable to save candidate profile'
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const successMessageHandler = (message) => {
    setSuccessMessage(message);

    window.setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  const handleAddSkill = (customSkill) => {
    const raw = customSkill !== undefined ? customSkill : skillInput;
    if (!raw.trim()) return;

    const parts = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const newSkills = [...skills];
    parts.forEach((part) => {
      if (!newSkills.includes(part)) {
        newSkills.push(part);
      }
    });

    setValue('skills', newSkills, { shouldValidate: true });
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setValue(
      'skills',
      skills.filter((s) => s !== skillToRemove),
      { shouldValidate: true }
    );
  };

  if (loadingProfile) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-sm text-slate-400">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/candidate"
            className="mb-3 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </Link>

          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            My Profile
          </h1>
        </div>

        <button
          type="submit"
          form="candidate-profile-form"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
        >
          <Save size={17} />
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

      {serverError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{serverError}</p>
        </div>
      )}

      {successMessage && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          {successMessage}
        </div>
      )}

      <ProfileCompletionCard
        completion={completion}
      />

      <ResumeUpload
        resumeData={resumeData}
        onUploaded={(data) => {
          setResumeData({
            resumeUrl: data.resumeUrl,
            resumeOriginalName: data.resumeOriginalName,
            resumeSize: data.resumeSize,
          });
          if (typeof data.profileCompletion === 'number') {
            setCompletion(data.profileCompletion);
          }
        }}
        onDeleted={(data) => {
          setResumeData({
            resumeUrl: '',
            resumeOriginalName: '',
            resumeSize: 0,
          });
          if (typeof data.profileCompletion === 'number') {
            setCompletion(data.profileCompletion);
          }
        }}
      />

      <form
        id="candidate-profile-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-5 text-xl font-semibold text-white">
            Basic information
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm text-slate-300">
                Professional headline
              </label>

              <input
                {...register('headline')}
                placeholder="MERN Stack Developer"
                className={inputClass}
              />

              {errors.headline && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.headline.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Phone
              </label>

              <input
                {...register('phone')}
                placeholder="+91 9876543210"
                className={inputClass}
              />

              {errors.phone && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Location
              </label>

              <input
                {...register('location')}
                placeholder="Gurugram"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Date of birth
              </label>

              <input
                type="date"
                {...register('dateOfBirth')}
                className={inputClass}
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm text-slate-300">
                Bio
              </label>

              <textarea
                {...register('bio')}
                rows={5}
                placeholder="Write a short professional introduction..."
                className={textareaClass}
              />

              {errors.bio && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.bio.message}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-5 text-xl font-semibold text-white">
            Skills
          </h2>

          <div>
            <div className="flex gap-2">
              <input
                value={skillInput}
                placeholder="Add skill (or comma-separated values: React, Node.js, MongoDB)"
                className={inputClass}
                onChange={(event) => setSkillInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleAddSkill();
                  }
                }}
              />
              <button
                type="button"
                onClick={() => handleAddSkill()}
                className="inline-flex items-center gap-1 rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-3 text-sm font-medium text-white transition-colors cursor-pointer border border-white/10 shrink-0"
              >
                <Plus size={16} />
                <span>Add</span>
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-white cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-white">
              Education
            </h2>

            <button
              type="button"
              onClick={() =>
                appendEducation({
                  degree: '',
                  institution: '',
                  field: '',
                  startYear: undefined,
                  endYear: undefined,
                })
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10 cursor-pointer"
            >
              <Plus size={16} />
              Add education
            </button>
          </div>

          <div className="space-y-5">
            {educationFields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-xl border border-white/10 bg-slate-950/40 p-5"
              >
                <div className="mb-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeEducation(index)}
                    className="text-slate-500 transition hover:text-red-400 cursor-pointer"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    {...register(`education.${index}.degree`)}
                    placeholder="Degree"
                    className={inputClass}
                  />

                  <input
                    {...register(`education.${index}.institution`)}
                    placeholder="Institution"
                    className={inputClass}
                  />

                  <input
                    {...register(`education.${index}.field`)}
                    placeholder="Field of study"
                    className={inputClass}
                  />

                  <input
                    type="number"
                    {...register(`education.${index}.startYear`, {
                      setValueAs: (value) =>
                        value === '' ? undefined : Number(value),
                    })}
                    placeholder="Start year"
                    className={inputClass}
                  />

                  <input
                    type="number"
                    {...register(`education.${index}.endYear`, {
                      setValueAs: (value) =>
                        value === '' ? undefined : Number(value),
                    })}
                    placeholder="End year"
                    className={inputClass}
                  />
                </div>

                {errors.education?.[index]?.endYear && (
                  <p className="mt-2 text-xs text-red-400">
                    {errors.education[index].endYear.message}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-white">
              Experience
            </h2>

            <button
              type="button"
              onClick={() =>
                appendExperience({
                  company: '',
                  position: '',
                  role: '',
                  startDate: '',
                  endDate: '',
                  currentlyWorking: false,
                  current: false,
                  description: '',
                })
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10 cursor-pointer"
            >
              <Plus size={16} />
              Add experience
            </button>
          </div>

          <div className="space-y-5">
            {experienceFields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-xl border border-white/10 bg-slate-950/40 p-5"
              >
                <div className="mb-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeExperience(index)}
                    className="text-slate-500 transition hover:text-red-400 cursor-pointer"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    {...register(`experience.${index}.company`)}
                    placeholder="Company"
                    className={inputClass}
                  />

                  <input
                    {...register(`experience.${index}.position`)}
                    placeholder="Position"
                    className={inputClass}
                  />

                  <input
                    type="date"
                    {...register(`experience.${index}.startDate`)}
                    className={inputClass}
                  />

                  <input
                    type="date"
                    {...register(`experience.${index}.endDate`)}
                    className={inputClass}
                  />

                  <label className="flex items-center gap-3 text-sm text-slate-300 md:col-span-2">
                    <input
                      type="checkbox"
                      {...register(`experience.${index}.currentlyWorking`)}
                      className="h-4 w-4 rounded"
                    />
                    Currently working here
                  </label>

                  <textarea
                    {...register(`experience.${index}.description`)}
                    rows={4}
                    placeholder="Describe your responsibilities..."
                    className={`${textareaClass} md:col-span-2`}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-white">
              Certifications
            </h2>

            <button
              type="button"
              onClick={() =>
                appendCertification({
                  name: '',
                  title: '',
                  issuer: '',
                  issueDate: '',
                  expiryDate: '',
                  credentialUrl: '',
                })
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10 cursor-pointer"
            >
              <Plus size={16} />
              Add certification
            </button>
          </div>

          <div className="space-y-5">
            {certificationFields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-xl border border-white/10 bg-slate-950/40 p-5"
              >
                <div className="mb-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeCertification(index)}
                    className="text-slate-500 transition hover:text-red-400 cursor-pointer"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    {...register(`certifications.${index}.name`)}
                    placeholder="Certification name"
                    className={inputClass}
                  />

                  <input
                    {...register(`certifications.${index}.title`)}
                    placeholder="Certificate title"
                    className={inputClass}
                  />

                  <input
                    {...register(`certifications.${index}.issuer`)}
                    placeholder="Issuer"
                    className={inputClass}
                  />

                  <input
                    type="date"
                    {...register(`certifications.${index}.issueDate`)}
                    className={inputClass}
                  />

                  <input
                    type="date"
                    {...register(`certifications.${index}.expiryDate`)}
                    className={inputClass}
                  />

                  <input
                    {...register(`certifications.${index}.credentialUrl`)}
                    placeholder="Credential URL"
                    className={inputClass}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-5 text-xl font-semibold text-white">
            Links & preferences
          </h2>

          <div className="grid gap-4 md:grid-cols-2">

            <input
              {...register('portfolioUrl')}
              placeholder="Portfolio URL"
              className={inputClass}
            />

            <input
              {...register('githubUrl')}
              placeholder="GitHub URL"
              className={inputClass}
            />

            <input
              {...register('linkedinUrl')}
              placeholder="LinkedIn URL"
              className={inputClass}
            />

            <input
              {...register('preferredRole')}
              placeholder="Preferred role"
              className={inputClass}
            />

            <input
              type="number"
              {...register('expectedSalary', {
                setValueAs: (value) =>
                  value === '' ? undefined : Number(value),
              })}
              placeholder="Expected salary"
              className={inputClass}
            />

            <input
              type="number"
              {...register('noticePeriodDays', {
                setValueAs: (value) =>
                  value === '' ? undefined : Number(value),
              })}
              placeholder="Notice period in days"
              className={inputClass}
            />

            <input
              type="number"
              {...register('salaryExpectation.min', {
                setValueAs: (value) =>
                  value === '' ? undefined : Number(value),
              })}
              placeholder="Minimum salary"
              className={inputClass}
            />

            <input
              type="number"
              {...register('salaryExpectation.max', {
                setValueAs: (value) =>
                  value === '' ? undefined : Number(value),
              })}
              placeholder="Maximum salary"
              className={inputClass}
            />

            <select
              {...register('salaryExpectation.currency')}
              className={inputClass}
            >
              <option value="INR">INR</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>

          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              <Save size={17} />
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </section>

      </form>
    </div>
  );
};

export default CandidateProfile;
