const { z } = require('zod');
const { APPLICATION_STATUS } = require('../constants/status');

const objectIdSchema = z
  .string()
  .trim()
  .regex(
    /^[a-fA-F0-9]{24}$/,
    'Please provide a valid ID'
  );

const applicationStatuses = Object.values(
  APPLICATION_STATUS
);

const applicationStatusSchema = z.enum(
  applicationStatuses,
  {
    message: 'Invalid application status',
  }
);

const allowedStatusTransitions = {
  APPLIED: ['SCREENING', 'SHORTLISTED', 'REJECTED'],
  SCREENING: ['SHORTLISTED', 'UNDER_REVIEW', 'REJECTED'],
  SHORTLISTED: [
    'INTERVIEW_SCHEDULED',
    'INTERVIEW',
    'UNDER_REVIEW',
    'SELECTED',
    'REJECTED',
  ],
  INTERVIEW_SCHEDULED: ['INTERVIEW_COMPLETED', 'REJECTED'],
  INTERVIEW: ['INTERVIEW_COMPLETED', 'SELECTED', 'REJECTED'],
  INTERVIEW_COMPLETED: [
    'UNDER_REVIEW',
    'SHORTLISTED',
    'SELECTED',
    'REJECTED',
  ],
  UNDER_REVIEW: ['SELECTED', 'SHORTLISTED', 'REJECTED'],
  SELECTED: ['OFFER_SENT', 'OFFER', 'REJECTED'],
  OFFER_SENT: ['OFFER_ACCEPTED', 'OFFER_REJECTED', 'HIRED', 'REJECTED'],
  OFFER: ['OFFER_ACCEPTED', 'OFFER_REJECTED', 'HIRED', 'REJECTED'],
  OFFER_ACCEPTED: ['HIRED', 'REJECTED'],
  OFFER_REJECTED: [],
  HIRED: [],
  REJECTED: [],
};

const isValidApplicationStatusTransition = (
  currentStatus,
  nextStatus
) => {
  if (!applicationStatuses.includes(currentStatus)) {
    return false;
  }

  if (!applicationStatuses.includes(nextStatus)) {
    return false;
  }

  return (
    allowedStatusTransitions[currentStatus] || []
  ).includes(nextStatus);
};

const createApplicationSchema = z
  .object({
    jobId: objectIdSchema,

    coverLetter: z
      .string()
      .trim()
      .max(
        3000,
        'Cover letter cannot exceed 3000 characters'
      )
      .optional()
      .default(''),
  })
  .strict();

const applyJobSchema = createApplicationSchema;

const updateApplicationStatusSchema = z
  .object({
    status: applicationStatusSchema,

    note: z
      .string()
      .trim()
      .max(
        1000,
        'Status note cannot exceed 1000 characters'
      )
      .optional()
      .default(''),

    recruiterNotes: z
      .string()
      .trim()
      .max(
        3000,
        'Recruiter notes cannot exceed 3000 characters'
      )
      .optional(),

    rejectionReason: z
      .string()
      .trim()
      .max(
        1000,
        'Rejection reason cannot exceed 1000 characters'
      )
      .optional(),
  })
  .strict()
  .superRefine((data, ctx) => {

    if (
      data.status === APPLICATION_STATUS.REJECTED &&
      !data.rejectionReason
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['rejectionReason'],
        message:
          'Rejection reason is required when rejecting an application',
      });
    }
  });

const generateOfferSchema = z.object({
  position: z
    .string({
      required_error: 'Position title is required',
    })
    .trim()
    .min(2, 'Position title must be at least 2 characters')
    .max(150, 'Position title cannot exceed 150 characters'),

  salaryPackage: z
    .number({
      required_error: 'Salary package is required',
    })
    .min(0, 'Salary package cannot be negative'),

  joiningDate: z
    .string({
      required_error: 'Joining date is required',
    })
    .datetime({
      message: 'Joining date must be a valid ISO date string',
    }),

  benefits: z
    .string()
    .trim()
    .max(2000, 'Benefits description cannot exceed 2000 characters')
    .optional()
    .default(''),

  offerLetterUrl: z
    .string()
    .trim()
    .max(500, 'Offer letter URL cannot exceed 500 characters')
    .optional()
    .default(''),
});

const respondToOfferSchema = z.object({
  accept: z.boolean({
    required_error: 'Please indicate whether you accept or decline the offer',
  }),

  note: z
    .string()
    .trim()
    .max(1000, 'Note cannot exceed 1000 characters')
    .optional()
    .default(''),
});

const applicationListQuerySchema = z.object({
  page: z.preprocess(
    (value) => {
      if (
        value === undefined ||
        value === ''
      ) {
        return 1;
      }

      return Number(value);
    },
    z
      .number()
      .int()
      .min(1)
      .default(1)
  ),

  limit: z.preprocess(
    (value) => {
      if (
        value === undefined ||
        value === ''
      ) {
        return 10;
      }

      return Number(value);
    },
    z
      .number()
      .int()
      .min(1)
      .max(100)
      .default(10)
  ),

  status: applicationStatusSchema.optional(),

  jobId: objectIdSchema.optional(),

  candidateId: objectIdSchema.optional(),

  search: z
    .string()
    .trim()
    .max(
      100,
      'Search cannot exceed 100 characters'
    )
    .optional(),
});

module.exports = {
  objectIdSchema,
  applicationStatuses,
  applicationStatusSchema,
  allowedStatusTransitions,
  isValidApplicationStatusTransition,

  createApplicationSchema,
  applyJobSchema,
  updateApplicationStatusSchema,
  generateOfferSchema,
  respondToOfferSchema,
  applicationListQuerySchema,
};
