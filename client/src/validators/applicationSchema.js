import { z } from "zod";

export const applicationSchema = z.object({
  coverLetter: z
    .string()
    .trim()
    .max(3000, "Cover letter cannot exceed 3000 characters")
    .optional()
    .or(z.literal("")),
});
