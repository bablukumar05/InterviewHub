import { z } from 'zod';

const interviewRoundSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Round name is required')
    .max(100, 'Round name cannot exceed 100 characters'),

  type: z.enum([
    'TECHNICAL',
    'SYSTEM_DESIGN',
    'BEHAVIORAL',
    'HR',
    'FINAL',
  ]),

  order: z.coerce
    .number()
    .int()
    .min(1, 'Order must be at least 1'),
});

const salarySchema = z
  .object({
    min: z.coerce
      .number()
      .min(0, 'Minimum salary cannot be negative'),

    max: z.coerce
      .number()
      .min(0, 'Maximum salary cannot be negative'),

    currency: z
      .string()
      .trim()
      .length(3, 'Currency must be 3 characters'),

    period: z.enum([
      'YEARLY',
      'MONTHLY',
      'HOURLY',
    ]),
  })
  .refine(
    (data) => data.max >= data.min,
    {
      message:
        'Maximum salary must be greater than or equal to minimum salary',
      path: ['max'],
    }
  );

export const jobSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'Job title is required')
    .max(150, 'Job title cannot exceed 150 characters'),

  department: z
    .string()
    .trim()
    .max(100, 'Department cannot exceed 100 characters')
    .optional()
    .or(z.literal('')),

  description: z
    .string()
    .trim()
    .min(10, 'Job description must be at least 10 characters')
    .max(5000, 'Job description cannot exceed 5000 characters'),

  responsibilities: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        return val
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean);
      }
      return val;
    },
    z.array(z.string().trim().min(1)).max(50).optional()
  ),

  requirements: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        return val
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean);
      }
      return val;
    },
    z.array(z.string().trim().min(1)).max(50).optional()
  ),

  skills: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        return val
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
      return val;
    },
    z.array(z.string().trim().min(1).max(50)).max(50).optional()
  ),

  experienceLevel: z.enum([
    'ENTRY_LEVEL',
    'JUNIOR',
    'MID_LEVEL',
    'SENIOR',
    'LEAD',
    'EXECUTIVE',
  ]),

  employmentType: z.enum([
    'FULL_TIME',
    'PART_TIME',
    'INTERNSHIP',
    'CONTRACT',
  ]),

  location: z
    .string()
    .trim()
    .max(150)
    .optional()
    .or(z.literal('')),

  workMode: z.enum([
    'ONSITE',
    'REMOTE',
    'HYBRID',
  ]),

  salary: salarySchema,

  openings: z.coerce
    .number()
    .int()
    .min(1, 'At least one opening is required')
    .max(10000),

  deadline: z
    .string()
    .optional()
    .or(z.literal('')),

  interviewRounds: z
    .array(interviewRoundSchema)
    .max(20)
    .optional(),
});
