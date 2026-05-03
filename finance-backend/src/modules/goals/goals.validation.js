import { z } from "zod";

const currentYear = new Date().getUTCFullYear();

export const idParamSchema = z.object({
  id: z.string().min(1),
});

export const createGoalSchema = z.object({
  name: z.string().trim().min(1).max(150),
  targetAmount: z.number().positive(),
  currentAmount: z.number().min(0).default(0),
  targetDate: z.coerce.date(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  category: z.string().trim().min(1).max(100),
});

export const updateGoalSchema = z
  .object({
    name: z.string().trim().min(1).max(150).optional(),
    targetAmount: z.number().positive().optional(),
    currentAmount: z.number().min(0).optional(),
    targetDate: z.coerce.date().optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    category: z.string().trim().min(1).max(100).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const forecastQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(currentYear + 10).optional(),
});
