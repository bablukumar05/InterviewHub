import { useEffect } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { jobSchema } from '../../validators/jobSchema';

const emptyJob = {
  title: '',
  department: '',
  description: '',
  responsibilities: '',
  requirements: '',
  skills: '',
  experienceLevel: 'ENTRY_LEVEL',
  employmentType: 'FULL_TIME',
  location: '',
  workMode: 'REMOTE',
  salary: {
    min: 0,
    max: 0,
    currency: 'INR',
    period: 'YEARLY',
  },
  openings: 1,
  deadline: '',
  interviewRounds: [],
};

const inputClass =
  'w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-indigo-500';

const labelClass = 'mb-2 block text-sm font-medium text-slate-300';

const textareaClass =
  'w-full resize-none rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-indigo-500';

const JobForm = ({
  initialData,
  submitting = false,
  onSubmit,
  onClose,
}) => {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(jobSchema),
    defaultValues: emptyJob,
  });

  const {
    fields: interviewFields,
    append: appendInterview,
    remove: removeInterview,
  } = useFieldArray({
    control,
    name: 'interviewRounds',
  });

  useEffect(() => {
    if (!initialData) {
      reset(emptyJob);
      return;
    }

    const toDateInput = (value) => {
      if (!value) return '';
      return new Date(value).toISOString().slice(0, 10);
    };

    reset({
      title: initialData.title || '',
      department: initialData.department || '',
      description: initialData.description || '',

      responsibilities: Array.isArray(initialData.responsibilities)
        ? initialData.responsibilities.join('\n')
        : initialData.responsibilities || '',

      requirements: Array.isArray(initialData.requirements)
        ? initialData.requirements.join('\n')
        : initialData.requirements || '',

      skills: Array.isArray(initialData.skills)
        ? initialData.skills.join(', ')
        : initialData.skills || '',

      experienceLevel: initialData.experienceLevel || 'ENTRY_LEVEL',
      employmentType: initialData.employmentType || 'FULL_TIME',
      location: initialData.location || '',
      workMode: initialData.workMode || 'REMOTE',

      salary: {
        min: initialData.salary?.min ?? 0,
        max: initialData.salary?.max ?? 0,
        currency: initialData.salary?.currency || 'INR',
        period: initialData.salary?.period || 'YEARLY',
      },

      openings: initialData.openings ?? 1,
      deadline: toDateInput(initialData.deadline),

      interviewRounds: (initialData.interviewRounds || []).map((round) => ({
        name: round.name || '',
        type: round.type || 'TECHNICAL',
        order: round.order || 1,
      })),
    });
  }, [initialData, reset]);

  const transformData = (data) => {
    const toArray = (val, separator) => {
      if (Array.isArray(val)) {
        return val.map((s) => String(s).trim()).filter(Boolean);
      }
      if (typeof val === 'string') {
        return val
          .split(separator)
          .map((item) => item.trim())
          .filter(Boolean);
      }
      return [];
    };

    return {
      ...data,
      responsibilities: toArray(data.responsibilities, '\n'),
      requirements: toArray(data.requirements, '\n'),
      skills: toArray(data.skills, ','),
    };
  };

  const submitHandler = (data) => {
    const payload = transformData(data);

    if (payload.deadline) {
      payload.deadline = new Date(
        `${payload.deadline}T23:59:59`
      ).toISOString();
    } else {
      delete payload.deadline;
    }

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
      <div className="mx-auto my-8 max-w-5xl rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">

        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-slate-900/95 px-6 py-5 backdrop-blur">
          <h2 className="text-xl font-semibold text-white">
            {initialData ? 'Edit Job' : 'Create New Job'}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(submitHandler)} className="space-y-8 p-6">
          <section>
            <h3 className="mb-4 text-lg font-semibold text-white">
              Basic Info
            </h3>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className={labelClass}>Job title</label>
                <input
                  {...register('title')}
                  placeholder="MERN Stack Developer"
                  className={inputClass}
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-red-400">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label className={labelClass}>Department</label>
                <input
                  {...register('department')}
                  placeholder="Engineering"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Location</label>
                <input
                  {...register('location')}
                  placeholder="Bengaluru / Noida / Remote"
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Description</label>
                <textarea
                  {...register('description')}
                  rows={6}
                  placeholder="Describe the role..."
                  className={textareaClass}
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-red-400">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-4 text-lg font-semibold text-white">
              Job Details
            </h3>

            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <label className={labelClass}>Experience level</label>
                <select {...register('experienceLevel')} className={inputClass}>
                  <option value="ENTRY_LEVEL">Entry Level</option>
                  <option value="JUNIOR">Junior</option>
                  <option value="MID_LEVEL">Mid Level</option>
                  <option value="SENIOR">Senior</option>
                  <option value="LEAD">Lead</option>
                  <option value="EXECUTIVE">Executive</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Employment type</label>
                <select {...register('employmentType')} className={inputClass}>
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="CONTRACT">Contract</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Work mode</label>
                <select {...register('workMode')} className={inputClass}>
                  <option value="REMOTE">Remote</option>
                  <option value="HYBRID">Hybrid</option>
                  <option value="ONSITE">Onsite</option>
                </select>
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-4 text-lg font-semibold text-white">Skills</h3>
            <textarea
              {...register('skills')}
              rows={3}
              placeholder="React, Node.js, MongoDB, AWS (comma separated)"
              className={textareaClass}
            />
          </section>

          <section>
            <h3 className="mb-4 text-lg font-semibold text-white">
              Responsibilities
            </h3>
            <textarea
              {...register('responsibilities')}
              rows={6}
              placeholder={
                'Build React applications\nDevelop REST APIs\nCollaborate with engineers'
              }
              className={textareaClass}
            />
          </section>

          <section>
            <h3 className="mb-4 text-lg font-semibold text-white">
              Requirements
            </h3>
            <textarea
              {...register('requirements')}
              rows={6}
              placeholder={
                'Strong JavaScript knowledge\nReact experience\nNode.js experience'
              }
              className={textareaClass}
            />
          </section>

          <section>
            <h3 className="mb-4 text-lg font-semibold text-white">
              Salary & Openings
            </h3>

            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <label className={labelClass}>Minimum salary</label>
                <input
                  type="number"
                  {...register('salary.min')}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Maximum salary</label>
                <input
                  type="number"
                  {...register('salary.max')}
                  className={inputClass}
                />
                {errors.salary?.max && (
                  <p className="mt-1 text-xs text-red-400">
                    {errors.salary.max.message}
                  </p>
                )}
              </div>

              <div>
                <label className={labelClass}>Currency</label>
                <select {...register('salary.currency')} className={inputClass}>
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Salary period</label>
                <select {...register('salary.period')} className={inputClass}>
                  <option value="YEARLY">Yearly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="HOURLY">Hourly</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Openings</label>
                <input
                  type="number"
                  {...register('openings')}
                  className={inputClass}
                />
                {errors.openings && (
                  <p className="mt-1 text-xs text-red-400">
                    {errors.openings.message}
                  </p>
                )}
              </div>

              <div>
                <label className={labelClass}>Application deadline</label>
                <input
                  type="date"
                  {...register('deadline')}
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Interview rounds
              </h3>

              <button
                type="button"
                onClick={() =>
                  appendInterview({
                    name: '',
                    type: 'TECHNICAL',
                    order: interviewFields.length + 1,
                  })
                }
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10 cursor-pointer"
              >
                <Plus size={16} />
                Add round
              </button>
            </div>

            <div className="space-y-4">
              {interviewFields.map((field, index) => (
                <div
                  key={field.id}
                  className="rounded-2xl border border-white/10 bg-slate-950/40 p-5"
                >
                  <div className="grid gap-4 md:grid-cols-[1fr_200px_100px_auto]">
                    <div>
                      <label className={labelClass}>Round name</label>
                      <input
                        {...register(`interviewRounds.${index}.name`)}
                        placeholder="Technical Interview"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Type</label>
                      <select
                        {...register(`interviewRounds.${index}.type`)}
                        className={inputClass}
                      >
                        <option value="TECHNICAL">Technical</option>
                        <option value="SYSTEM_DESIGN">System Design</option>
                        <option value="BEHAVIORAL">Behavioral</option>
                        <option value="HR">HR</option>
                        <option value="FINAL">Final</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>Order</label>
                      <input
                        type="number"
                        {...register(`interviewRounds.${index}.order`)}
                        className={inputClass}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeInterview(index)}
                      className="mt-7 rounded-xl p-3 text-slate-500 hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-slate-300 hover:bg-white/10 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {submitting
                ? 'Saving...'
                : initialData
                ? 'Update Job'
                : 'Create Draft'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobForm;
