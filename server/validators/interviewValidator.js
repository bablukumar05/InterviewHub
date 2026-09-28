const { z } = require('zod');
const { INTERVIEW_STATUS, INTERVIEW_TYPES } = require('../constants/status');

const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[a-fA-F0-9]{24}$/, 'Please provide a valid MongoDB ID');

const roundNumberSchema = z
  .coerce
  .number()
  .int()
  .min(1, 'Round number must be at least 1');

const interviewStatusSchema = z.enum([
  'SCHEDULED',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
]);

const interviewTypeSchema = z.enum([
  'TECHNICAL',
  'SYSTEM_DESIGN',
  'BEHAVIORAL',
  'HR',
  'FINAL',
]);

const interviewMeetingTypeSchema = z.enum(['VIDEO', 'PHONE', 'ONSITE']);

const interviewerRoleSchema = z.enum(['PRIMARY', 'PANEL']);

const emptyBodySchema = z.object().passthrough();

const createInterviewSchema = z
  .object({
    applicationId: objectIdSchema,
    roundNumber: roundNumberSchema,
    scheduledAt: z.string().min(1, 'Scheduled date and time is required'),
    durationMinutes: z.coerce
      .number()
      .int()
      .min(15, 'Duration must be at least 15 minutes')
      .max(240, 'Duration cannot exceed 240 minutes')
      .default(60),
    timezone: z.string().trim().default('Asia/Kolkata'),
    meetingType: interviewMeetingTypeSchema.default('VIDEO'),
    meetingUrl: z.string().trim().optional().default(''),
    location: z.string().trim().optional().default(''),
    instructions: z.string().trim().max(2000).optional().default(''),
    candidateNotes: z.string().trim().max(2000).optional().default(''),
  })
  .refine(
    (data) => {
      if (data.meetingType === 'VIDEO' && (!data.meetingUrl || !data.meetingUrl.trim())) {
        return false;
      }
      return true;
    },
    {
      message: 'meetingUrl is required for video interviews',
      path: ['meetingUrl'],
    }
  )
  .refine(
    (data) => {
      if (data.meetingType === 'ONSITE' && (!data.location || !data.location.trim())) {
        return false;
      }
      return true;
    },
    {
      message: 'location is required for onsite interviews',
      path: ['location'],
    }
  );

const updateInterviewSchema = z.object({
  scheduledAt: z.string().min(1).optional(),
  durationMinutes: z.coerce
    .number()
    .int()
    .min(15, 'Duration must be at least 15 minutes')
    .max(240, 'Duration cannot exceed 240 minutes')
    .optional(),
  timezone: z.string().trim().optional(),
  meetingType: interviewMeetingTypeSchema.optional(),
  meetingUrl: z.string().trim().optional(),
  location: z.string().trim().optional(),
  instructions: z.string().trim().max(2000).optional(),
  candidateNotes: z.string().trim().max(2000).optional(),
});

const rescheduleInterviewSchema = z.object({
  scheduledAt: z.string().min(1, 'New scheduled date and time is required'),
  reason: z
    .string()
    .trim()
    .min(3, 'Reschedule reason must be at least 3 characters')
    .max(1000, 'Reschedule reason is too long'),
  durationMinutes: z.coerce
    .number()
    .int()
    .min(15)
    .max(240)
    .optional(),
  timezone: z.string().trim().optional(),
});

const assignInterviewersSchema = z.object({
  interviewerIds: z
    .array(objectIdSchema)
    .min(1, 'Please select at least one interviewer'),
});

const setInterviewPanelSchema = assignInterviewersSchema;

const cancelInterviewSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, 'Cancellation reason is required and must be at least 3 characters')
    .max(1000),
});

const confirmInterviewSchema = emptyBodySchema;
const startInterviewSchema = emptyBodySchema;
const completeInterviewSchema = z.object({
  note: z.string().trim().max(1000).optional().default(''),
}).passthrough();
const noShowInterviewSchema = emptyBodySchema;

const updateInterviewStatusSchema = z.object({
  status: interviewStatusSchema,
  note: z.string().trim().max(1000).optional().default(''),
  reason: z.string().trim().max(1000).optional().default(''),
});

const interviewListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  status: interviewStatusSchema.optional(),
});

const interviewQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  status: interviewStatusSchema.optional(),
  jobId: objectIdSchema.optional(),
  applicationId: objectIdSchema.optional(),
});

module.exports = {
  objectIdSchema,
  roundNumberSchema,

  interviewTypeSchema,
  interviewStatusSchema,
  interviewMeetingTypeSchema,
  interviewerRoleSchema,

  createInterviewSchema,
  updateInterviewSchema,
  rescheduleInterviewSchema,

  assignInterviewersSchema,
  setInterviewPanelSchema,

  cancelInterviewSchema,

  emptyBodySchema,
  confirmInterviewSchema,
  startInterviewSchema,
  completeInterviewSchema,
  noShowInterviewSchema,

  updateInterviewStatusSchema,

  interviewListQuerySchema,
  interviewQuerySchema,
};
