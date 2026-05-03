import { z } from "zod";

export const generateInsightSchema = z.object({
  question: z.string().trim().min(1).max(400).optional(),
  forceRefresh: z.coerce.boolean().optional().default(false),
});
