const mongoose = require("mongoose");
const { z } = require("zod");

const {
  EVALUATION_RECOMMENDATIONS,
} = require("../constants/evaluation");

const objectIdSchema = z
  .string()
  .refine(
    (value) =>
      mongoose.Types.ObjectId.isValid(value),
    {
      message: "Invalid ID",
    }
  );

const optionalString = (maxLength) =>
  z
    .string()
    .trim()
    .max(maxLength)
    .optional()
    .or(z.literal(""));

const questionScoreInputSchema =
  z.object({
    questionId: objectIdSchema,

    score: z.coerce
      .number()
      .min(0)
      .max(5),

    skill: optionalString(100),

    notes: optionalString(1500),
  });

const skillScoreInputSchema =
  z.object({
    skill: z
      .string()
      .trim()
      .min(1)
      .max(100),

    score: z.coerce
      .number()
      .min(0)
      .max(5),

    comment: optionalString(1000),
  });

const questionScoreArraySchema =
  z
    .array(
      questionScoreInputSchema
    )
    .max(100)
    .superRefine(
      (items, ctx) => {
        const seen = new Set();

        items.forEach(
          (item, index) => {
            const id =
              String(item.questionId);

            if (seen.has(id)) {
              ctx.addIssue({
                code:
                  z.ZodIssueCode.custom,

                path: [
                  index,
                  "questionId",
                ],

                message:
                  "Duplicate question is not allowed",
              });
            }

            seen.add(id);
          }
        );
      }
    )
    .default([]);

const skillScoreArraySchema =
  z
    .array(
      skillScoreInputSchema
    )
    .max(100)
    .superRefine(
      (items, ctx) => {
        const seen = new Set();

        items.forEach(
          (item, index) => {
            const skill =
              item.skill
                .trim()
                .toLowerCase();

            if (seen.has(skill)) {
              ctx.addIssue({
                code:
                  z.ZodIssueCode.custom,

                path: [
                  index,
                  "skill",
                ],

                message:
                  "Duplicate skill is not allowed",
              });
            }

            seen.add(skill);
          }
        );
      }
    )
    .default([]);

const createEvaluationSchema =
  z
    .object({
      interviewId:
        objectIdSchema,

      questionScores:
        questionScoreArraySchema,

      skillScores:
        skillScoreArraySchema,

      recommendation:
        z
          .enum(
            EVALUATION_RECOMMENDATIONS
          )
          .optional(),

      strengths:
        optionalString(3000),

      weaknesses:
        optionalString(3000),

      feedback:
        optionalString(5000),
    })
    .strict();

const updateEvaluationSchema =
  z
    .object({
      interviewId:
        objectIdSchema.optional(),

      questionScores:
        questionScoreArraySchema
          .optional(),

      skillScores:
        skillScoreArraySchema
          .optional(),

      recommendation:
        z
          .enum(
            EVALUATION_RECOMMENDATIONS
          )
          .optional(),

      strengths:
        optionalString(3000),

      weaknesses:
        optionalString(3000),

      feedback:
        optionalString(5000),
    })
    .strict();

const submitEvaluationSchema =
  z
    .object({
      recommendation:
        z
          .enum(
            EVALUATION_RECOMMENDATIONS
          )
          .optional(),

      strengths:
        optionalString(3000),

      weaknesses:
        optionalString(3000),

      feedback:
        optionalString(5000),
    })
    .strict();

const evaluationListQuerySchema =
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

      status: z
        .enum([
          "DRAFT",
          "SUBMITTED",
          "REVIEWED",
        ])
        .optional(),

      recommendation:
        z
          .enum(
            EVALUATION_RECOMMENDATIONS
          )
          .optional(),

      interviewId:
        objectIdSchema.optional(),

      applicationId:
        objectIdSchema.optional(),

      sortOrder:
        z
          .enum(["asc", "desc"])
          .default("desc"),
    })
    .strict();

const emptyBodySchema = z
  .object({})
  .strict();

module.exports = {
  createEvaluationSchema,
  updateEvaluationSchema,
  submitEvaluationSchema,
  evaluationListQuerySchema,
  emptyBodySchema,
};
