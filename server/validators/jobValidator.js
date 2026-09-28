const { z } = require('zod');

const EXPERIENCE_LEVELS = [
  'ENTRY_LEVEL',
  'JUNIOR',
  'MID_LEVEL',
  'SENIOR',
  'LEAD',
  'EXECUTIVE',
];

const EMPLOYMENT_TYPES = [
  'FULL_TIME',
  'PART_TIME',
  'INTERNSHIP',
  'CONTRACT',
];

const WORK_MODES = [
  'ONSITE',
  'REMOTE',
  'HYBRID',
];

const INTERVIEW_ROUND_TYPES = [
  'TECHNICAL',
  'SYSTEM_DESIGN',
  'BEHAVIORAL',
  'HR',
  'FINAL',
];

const JOB_STATUSES = [
  'DRAFT',
  'PUBLISHED',
  'PAUSED',
  'CLOSED',
];

const optionalTrimmedString = (max, message) =>
  z
    .string()
    .trim()
    .max(max, message)
    .optional();

const optionalNumber = z.preprocess(
  (value) => {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();

      if (!trimmed) {
        return undefined;
      }

      return Number(trimmed);
    }

    return value;
  },
  z.number()
);

const optionalInteger = z.preprocess(
  (value) => {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();

      if (!trimmed) {
        return undefined;
      }

      return Number(trimmed);
    }

    return value;
  },
  z.number().int()
);

const interviewRoundSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Interview round name must be at least 2 characters')
    .max(100, 'Interview round name cannot exceed 100 characters'),

  type: z.enum(
    INTERVIEW_ROUND_TYPES,
    {
      message:
        'Invalid interview round type',
    }
  ),

  order: z
    .number()
    .int('Interview round order must be an integer')
    .min(1, 'Interview round order must start from 1'),
});

const salaryObjectSchema = z
  .object({
    min: z
      .number()
      .min(0, 'Minimum salary cannot be negative')
      .default(0),

    max: z
      .number()
      .min(0, 'Maximum salary cannot be negative')
      .default(0),

    currency: z
      .string()
      .trim()
      .toUpperCase()
      .length(3, 'Currency must be a 3-letter code')
      .default('USD'),

    period: z.enum(
      ['YEARLY', 'MONTHLY', 'HOURLY'],
      {
        message: 'Invalid salary period',
      }
    ).default('YEARLY'),
  })
  .refine(
    (data) => data.max >= data.min,
    {
      message:
        'Maximum salary must be greater than or equal to minimum salary',
      path: ['max'],
    }
  );

const salarySchema = z.union([
  salaryObjectSchema,

  z
    .number()
    .min(0, 'Salary cannot be negative'),
]);

const jobFieldsSchema = {
  title: z
    .string()
    .trim()
    .min(2, 'Job title must be at least 2 characters')
    .max(150, 'Job title cannot exceed 150 characters'),

  department: z
    .string()
    .trim()
    .max(100, 'Department cannot exceed 100 characters')
    .optional(),

  description: z
    .string()
    .trim()
    .min(10, 'Job description must be at least 10 characters')
    .max(5000, 'Job description cannot exceed 5000 characters'),

  responsibilities: z
    .array(
      z
        .string()
        .trim()
        .min(2, 'Responsibility cannot be empty')
        .max(500, 'Responsibility cannot exceed 500 characters')
    )
    .max(
      50,
      'You can add a maximum of 50 responsibilities'
    )
    .optional(),

  requirements: z
    .array(
      z
        .string()
        .trim()
        .min(2, 'Requirement cannot be empty')
        .max(500, 'Requirement cannot exceed 500 characters')
    )
    .max(
      50,
      'You can add a maximum of 50 requirements'
    )
    .optional(),

  skills: z
    .array(
      z
        .string()
        .trim()
        .min(1, 'Skill cannot be empty')
        .max(50, 'Skill cannot exceed 50 characters')
    )
    .max(
      50,
      'You can add a maximum of 50 skills'
    )
    .optional(),

  experienceLevel: z
    .enum(EXPERIENCE_LEVELS, {
      message: 'Invalid experience level',
    })
    .optional(),

  employmentType: z
    .enum(EMPLOYMENT_TYPES, {
      message: 'Invalid employment type',
    }),

  location: z
    .string()
    .trim()
    .max(150, 'Location cannot exceed 150 characters')
    .optional(),

  workMode: z
    .enum(WORK_MODES, {
      message: 'Invalid work mode',
    })
    .optional(),

  salary: salarySchema.optional(),

  openings: z
    .number()
    .int('Openings must be a whole number')
    .min(1, 'At least one opening is required')
    .max(
      10000,
      'Openings cannot exceed 10,000'
    ),

  deadline: z
    .string()
    .datetime({
      message: 'Deadline must be a valid ISO date',
    })
    .optional(),

  interviewRounds: z
    .array(interviewRoundSchema)
    .max(
      20,
      'You can add a maximum of 20 interview rounds'
    )
    .optional(),
};

const validateInterviewRoundOrder = (rounds) => {
  if (!rounds || rounds.length === 0) {
    return true;
  }

  const orders = rounds.map((round) => round.order);

  return new Set(orders).size === orders.length;
};

const createJobSchema = z
  .object(jobFieldsSchema)
  .superRefine((data, ctx) => {

    if (
      data.interviewRounds &&
      !validateInterviewRoundOrder(data.interviewRounds)
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['interviewRounds'],
        message:
          'Interview round order values must be unique',
      });
    }

    if (data.deadline) {
      const deadline = new Date(data.deadline);

      if (Number.isNaN(deadline.getTime())) {
        ctx.addIssue({
          code: 'custom',
          path: ['deadline'],
          message: 'Invalid deadline',
        });
      }
    }

    if (
      data.salary &&
      typeof data.salary === 'object'
    ) {
      if (data.salary.max < data.salary.min) {
        ctx.addIssue({
          code: 'custom',
          path: ['salary', 'max'],
          message:
            'Maximum salary must be greater than or equal to minimum salary',
        });
      }
    }
  });

const updateJobSchema = z
  .object({
    title: jobFieldsSchema.title.optional(),

    department:
      jobFieldsSchema.department,

    description:
      jobFieldsSchema.description.optional(),

    responsibilities:
      jobFieldsSchema.responsibilities,

    requirements:
      jobFieldsSchema.requirements,

    skills:
      jobFieldsSchema.skills,

    experienceLevel:
      jobFieldsSchema.experienceLevel,

    employmentType:
      jobFieldsSchema.employmentType.optional(),

    location:
      jobFieldsSchema.location,

    workMode:
      jobFieldsSchema.workMode,

    salary:
      jobFieldsSchema.salary,

    openings:
      jobFieldsSchema.openings.optional(),

    deadline:
      jobFieldsSchema.deadline,

    interviewRounds:
      jobFieldsSchema.interviewRounds,
  })
  .superRefine((data, ctx) => {
    if (
      data.interviewRounds &&
      !validateInterviewRoundOrder(data.interviewRounds)
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['interviewRounds'],
        message:
          'Interview round order values must be unique',
      });
    }
  });

const emptyBodySchema = z
  .object()
  .strict()
  .default();

const publishJobSchema = emptyBodySchema;

const jobStatusSchema = z.enum(
  JOB_STATUSES,
  {
    message: 'Invalid job status',
  }
);

const allowedStatusTransitions = {
  DRAFT: ['PUBLISHED', 'CLOSED'],

  PUBLISHED: ['PAUSED', 'CLOSED'],

  PAUSED: ['PUBLISHED', 'CLOSED'],

  CLOSED: [],
};

const isValidJobStatusTransition = (
  currentStatus,
  nextStatus
) => {
  if (!JOB_STATUSES.includes(currentStatus)) {
    return false;
  }

  if (!JOB_STATUSES.includes(nextStatus)) {
    return false;
  }

  return allowedStatusTransitions[
    currentStatus
  ].includes(nextStatus);
};

module.exports = {
  EXPERIENCE_LEVELS,
  EMPLOYMENT_TYPES,
  WORK_MODES,
  INTERVIEW_ROUND_TYPES,
  JOB_STATUSES,

  interviewRoundSchema,
  salaryObjectSchema,
  salarySchema,

  createJobSchema,
  updateJobSchema,
  emptyBodySchema,
  publishJobSchema,
  jobStatusSchema,

  allowedStatusTransitions,
  isValidJobStatusTransition,
};
