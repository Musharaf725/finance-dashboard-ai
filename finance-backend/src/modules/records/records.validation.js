import { z } from "zod";

export const listRecordsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  category: z.string().min(1).optional(),
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
});

export const idParamSchema = z.object({
  id: z.string().min(1),
});

export const createRecordSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().min(1).max(100),
  date: z.coerce.date(),
  notes: z.string().max(2000).optional().nullable(),
});

export const updateRecordSchema = z
  .object({
    amount: z.number().positive().optional(),
    type: z.enum(["INCOME", "EXPENSE"]).optional(),
    category: z.string().min(1).max(100).optional(),
    date: z.coerce.date().optional(),
    notes: z.string().max(2000).optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });
