import { z } from 'zod';

const optionalUrl = z
  .string()
  .trim()
  .url('Enter a valid URL')
  .or(z.literal(''))
  .optional();

const educationSchema = z
  .object({
    degree: z
      .string()
      .trim()
      .max(100, 'Degree must be 100 characters or less')
      .optional(),

    institution: z
      .string()
      .trim()
      .max(150, 'Institution must be 150 characters or less')
      .optional(),

    field: z
      .string()
      .trim()
      .max(100, 'Field must be 100 characters or less')
      .optional(),

    startYear: z
      .number()
      .int('Start year must be a whole number')
      .min(1900, 'Invalid start year')
      .optional(),

    endYear: z
      .number()
      .int('End year must be a whole number')
      .min(1900, 'Invalid end year')
      .optional(),
  })
  .refine(
    (data) =>
      data.startYear === undefined ||
      data.endYear === undefined ||
      data.endYear >= data.startYear,
    {
      message: 'End year must be >= start year',
      path: ['endYear'],
    }
  );

const experienceSchema = z.object({
  company: z
    .string()
    .trim()
    .max(150, 'Company must be 150 characters or less')
    .optional(),

  position: z
    .string()
    .trim()
    .max(150, 'Position must be 150 characters or less')
    .optional(),

  role: z
    .string()
    .trim()
    .max(150, 'Role must be 150 characters or less')
    .optional(),

  startDate: z.string().optional(),

  endDate: z.string().optional(),

  currentlyWorking: z.boolean().optional(),

  current: z.boolean().optional(),

  description: z
    .string()
    .trim()
    .max(1000, 'Description must be 1000 characters or less')
    .optional(),
});

const certificationSchema = z.object({
  name: z
    .string()
    .trim()
    .max(150, 'Name must be 150 characters or less')
    .optional(),

  title: z
    .string()
    .trim()
    .max(150, 'Title must be 150 characters or less')
    .optional(),

  issuer: z
    .string()
    .trim()
    .max(150, 'Issuer must be 150 characters or less')
    .optional(),

  issueDate: z.string().optional(),

  expiryDate: z.string().optional(),

  credentialUrl: optionalUrl,
});

const salaryExpectationSchema = z
  .object({
    min: z
      .number()
      .min(0, 'Minimum salary cannot be negative')
      .optional(),

    max: z
      .number()
      .min(0, 'Maximum salary cannot be negative')
      .optional(),

    currency: z
      .string()
      .trim()
      .length(3, 'Currency must be a 3-letter code')
      .optional(),
  })
  .refine(
    (data) =>
      data.min === undefined ||
      data.max === undefined ||
      data.max >= data.min,
    {
      message: 'Maximum salary must be >= minimum salary',
      path: ['max'],
    }
  );

export const candidateProfileSchema = z.object({
  headline: z
    .string()
    .trim()
    .max(150, 'Headline must be 150 characters or less')
    .optional(),

  bio: z
    .string()
    .trim()
    .max(1500, 'Bio must be 1500 characters or less')
    .optional(),

  phone: z
    .string()
    .trim()
    .regex(
      /^[0-9+\-\s()]{7,20}$/,
      'Enter a valid phone number'
    )
    .or(z.literal(''))
    .optional(),

  location: z
    .string()
    .trim()
    .max(100, 'Location must be 100 characters or less')
    .optional(),

  dateOfBirth: z.string().optional(),

  skills: z
    .array(
      z
        .string()
        .trim()
        .min(1, 'Skill cannot be empty')
        .max(50, 'Skill must be 50 characters or less')
    )
    .max(50, 'You can add up to 50 skills')
    .optional(),

  education: z
    .array(educationSchema)
    .max(20, 'You can add up to 20 education records')
    .optional(),

  experience: z
    .array(experienceSchema)
    .max(20, 'You can add up to 20 experience records')
    .optional(),

  certifications: z
    .array(certificationSchema)
    .max(20, 'You can add up to 20 certifications')
    .optional(),

  portfolioUrl: optionalUrl,

  githubUrl: optionalUrl,

  linkedinUrl: optionalUrl,

  salaryExpectation: salaryExpectationSchema.optional(),

  preferredRole: z
    .string()
    .trim()
    .max(150, 'Preferred role must be 150 characters or less')
    .optional(),

  expectedSalary: z
    .number()
    .min(0, 'Expected salary cannot be negative')
    .optional(),

  noticePeriodDays: z
    .number()
    .int('Notice period must be a whole number')
    .min(0, 'Notice period cannot be negative')
    .max(365, 'Notice period cannot exceed 365 days')
    .optional(),
});
