import { z } from "zod";

const currentYear = new Date().getUTCFullYear();

export const budgetsQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(currentYear + 10).optional(),
});

export const idParamSchema = z.object({
  id: z.string().min(1),
});

export const createBudgetSchema = z.object({
  category: z.string().trim().min(1).max(100),
  monthlyLimit: z.number().positive(),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(currentYear + 10),
});

export const updateBudgetSchema = z
  .object({
    category: z.string().trim().min(1).max(100).optional(),
    monthlyLimit: z.number().positive().optional(),
    month: z.coerce.number().int().min(1).max(12).optional(),
    year: z.coerce.number().int().min(2000).max(currentYear + 10).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });
