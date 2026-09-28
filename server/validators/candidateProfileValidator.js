const { z } = require('zod');

const optionalUrl = z
  .string()
  .trim()
  .url('Please provide a valid URL')
  .optional()
  .or(z.literal(''));

const optionalDate = z
  .union([
    z.string().datetime({
      message: 'Please provide a valid date',
    }),
    z.string().date({
      message: 'Please provide a valid date',
    }),
    z.date(),
  ])
  .optional();

const educationSchema = z
  .object({
    degree: z
      .string()
      .trim()
      .max(100, 'Degree cannot exceed 100 characters')
      .optional(),

    institution: z
      .string()
      .trim()
      .max(150, 'Institution cannot exceed 150 characters')
      .optional(),

    field: z
      .string()
      .trim()
      .max(100, 'Field cannot exceed 100 characters')
      .optional(),

    startYear: z
      .number()
      .int('Start year must be an integer')
      .min(1900, 'Invalid start year')
      .optional(),

    endYear: z
      .number()
      .int('End year must be an integer')
      .min(1900, 'Invalid end year')
      .optional(),
  })
  .refine(
    (data) => {
      if (data.startYear !== undefined && data.endYear !== undefined) {
        return data.endYear >= data.startYear;
      }
      return true;
    },
    {
      message: 'End year must be greater than or equal to start year',
      path: ['endYear'],
    }
  );

const experienceSchema = z
  .object({
    company: z
      .string()
      .trim()
      .max(150, 'Company name cannot exceed 150 characters')
      .optional(),

    position: z
      .string()
      .trim()
      .max(150, 'Position cannot exceed 150 characters')
      .optional(),

    role: z
      .string()
      .trim()
      .max(150, 'Role cannot exceed 150 characters')
      .optional(),

    startDate: optionalDate,

    endDate: optionalDate,

    currentlyWorking: z.boolean().optional(),

    current: z.boolean().optional(),

    description: z
      .string()
      .trim()
      .max(1000, 'Experience description cannot exceed 1000 characters')
      .optional(),
  })
  .refine(
    (data) => {
      if (data.currentlyWorking === true || data.current === true) {
        return true;
      }
      return true;
    },
    {
      message: 'Invalid experience information',
    }
  );

const certificationSchema = z.object({
  name: z
    .string()
    .trim()
    .max(150, 'Certification name cannot exceed 150 characters')
    .optional(),

  title: z
    .string()
    .trim()
    .max(150, 'Certification title cannot exceed 150 characters')
    .optional(),

  issuer: z
    .string()
    .trim()
    .max(150, 'Issuer cannot exceed 150 characters')
    .optional(),

  issueDate: optionalDate,

  expiryDate: optionalDate,

  credentialUrl: optionalUrl,
});

const salaryExpectationSchema = z
  .object({
    min: z.number().min(0, 'Minimum salary cannot be negative').optional(),

    max: z.number().min(0, 'Maximum salary cannot be negative').optional(),

    currency: z
      .string()
      .trim()
      .toUpperCase()
      .length(3, 'Currency must be a 3-letter code')
      .optional(),
  })
  .refine(
    (data) => {
      if (data.min !== undefined && data.max !== undefined) {
        return data.max >= data.min;
      }
      return true;
    },
    {
      message: 'Maximum salary must be greater than or equal to minimum salary',
      path: ['max'],
    }
  );

const candidateProfileSchema = z.object({
  headline: z
    .string()
    .trim()
    .max(150, 'Headline cannot exceed 150 characters')
    .optional(),

  bio: z
    .string()
    .trim()
    .max(1500, 'Bio cannot exceed 1500 characters')
    .optional(),

  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{7,20}$/, 'Please provide a valid phone number')
    .optional()
    .or(z.literal('')),

  location: z
    .string()
    .trim()
    .max(100, 'Location cannot exceed 100 characters')
    .optional(),

  dateOfBirth: optionalDate,

  skills: z
    .array(
      z
        .string()
        .trim()
        .min(1, 'Skill cannot be empty')
        .max(50, 'Skill cannot exceed 50 characters')
    )
    .max(50, 'You can add a maximum of 50 skills')
    .optional(),

  education: z
    .array(educationSchema)
    .max(20, 'You can add a maximum of 20 education records')
    .optional(),

  experience: z
    .array(experienceSchema)
    .max(20, 'You can add a maximum of 20 experience records')
    .optional(),

  certifications: z
    .array(certificationSchema)
    .max(20, 'You can add a maximum of 20 certifications')
    .optional(),

  portfolioUrl: optionalUrl,

  githubUrl: optionalUrl,

  linkedinUrl: optionalUrl,

  salaryExpectation: salaryExpectationSchema.optional(),

  preferredRole: z
    .string()
    .trim()
    .max(150, 'Preferred role cannot exceed 150 characters')
    .optional(),

  expectedSalary: z
    .number()
    .min(0, 'Expected salary cannot be negative')
    .optional(),

  noticePeriodDays: z
    .number()
    .int('Notice period must be an integer')
    .min(0, 'Notice period cannot be negative')
    .max(365, 'Notice period cannot exceed 365 days')
    .optional(),
});

module.exports = {
  candidateProfileSchema,
  educationSchema,
  experienceSchema,
  certificationSchema,
  salaryExpectationSchema,
};
