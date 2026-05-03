import { Router } from "express";
import { z } from "zod";
import * as dashboardController from "./dashboard.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { requireRole } from "../../middleware/requireRole.js";
import { validate } from "../../middleware/validate.js";

const router = Router();

const dashboardQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

router.use(authenticate, requireRole("VIEWER"));

router.get(
  "/summary",
  validate(dashboardQuerySchema, "query"),
  dashboardController.summary
);

router.get(
  "/category-breakdown",
  validate(dashboardQuerySchema, "query"),
  dashboardController.categoryBreakdown
);

router.get(
  "/recent",
  validate(dashboardQuerySchema, "query"),
  dashboardController.recent
);

router.get(
  "/monthly-trends",
  validate(dashboardQuerySchema, "query"),
  dashboardController.monthlyTrends
);

export default router;
