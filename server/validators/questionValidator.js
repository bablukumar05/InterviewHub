const mongoose = require("mongoose");
const { z } = require("zod");

const {
  QUESTION_TYPES,
  QUESTION_DIFFICULTIES,
} = require("../constants/question");

const objectIdSchema = z
  .string()
  .refine(
    (value) =>
      mongoose.Types.ObjectId.isValid(value),
    {
      message: "Invalid ID",
    }
  );

const nonEmptyString = z
  .string()
  .trim()
  .min(1);

const optionalString = (
  maxLength
) =>
  z
    .string()
    .trim()
    .max(maxLength)
    .optional()
    .or(z.literal(""));

const stringArray = z
  .array(
    z
      .string()
      .trim()
      .min(1)
  )
  .max(30);

const questionTypeSchema =
  z.enum(QUESTION_TYPES);

const difficultySchema = z.enum(
  QUESTION_DIFFICULTIES
);

const createQuestionSchema =
  z
    .object({
      title: nonEmptyString.max(500),

      description:
        optionalString(2000),

      expectedAnswer:
        optionalString(5000),

      evaluationGuidance:
        optionalString(3000),

      field: nonEmptyString.max(100),

      role:
        optionalString(150),

      category:
        nonEmptyString.max(100),

      skills:
        stringArray.default([]),

      tags:
        stringArray.default([]),

      type: questionTypeSchema,

      difficulty:
        difficultySchema.default(
          "MEDIUM"
        ),
    })
    .strict();

const updateQuestionSchema =
  z
    .object({
      title:
        nonEmptyString.max(500)
          .optional(),

      description:
        optionalString(2000),

      expectedAnswer:
        optionalString(5000),

      evaluationGuidance:
        optionalString(3000),

      field:
        nonEmptyString.max(100)
          .optional(),

      role:
        optionalString(150),

      category:
        nonEmptyString.max(100)
          .optional(),

      skills:
        stringArray.optional(),

      tags:
        stringArray.optional(),

      type:
        questionTypeSchema.optional(),

      difficulty:
        difficultySchema.optional(),

      isActive:
        z.boolean().optional(),
    })
    .strict();

const questionListQuerySchema =
  z
    .object({
      page: z.coerce
        .number()
        .int()
        .min(1)
        .default(1),

      limit: z.coerce
        .number()
        .int()
        .min(1)
        .max(50)
        .default(10),

      search:
        z
          .string()
          .trim()
          .max(200)
          .optional(),

      field:
        z
          .string()
          .trim()
          .max(100)
          .optional(),

      role:
        z
          .string()
          .trim()
          .max(150)
          .optional(),

      category:
        z
          .string()
          .trim()
          .max(100)
          .optional(),

      skill:
        z
          .string()
          .trim()
          .max(100)
          .optional(),

      type:
        questionTypeSchema.optional(),

      difficulty:
        difficultySchema.optional(),

      isActive:
        z
          .enum(["true", "false"])
          .optional(),

      sortBy:
        z
          .enum([
            "createdAt",
            "title",
            "difficulty",
          ])
          .default("createdAt"),

      sortOrder:
        z
          .enum(["asc", "desc"])
          .default("desc"),
    })
    .strict();

const questionIdParamSchema =
  z
    .object({
      id: objectIdSchema,
    })
    .strict();

module.exports = {
  createQuestionSchema,
  updateQuestionSchema,
  questionListQuerySchema,
  questionIdParamSchema,
};
