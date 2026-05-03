import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { requireRole } from "../../middleware/requireRole.js";
import { validate } from "../../middleware/validate.js";
import { generateInsightSchema } from "./ai.validation.js";
import * as aiController from "./ai.controller.js";

const router = Router();

router.use(authenticate);

router.post(
  "/insights",
  requireRole("VIEWER"),
  validate(generateInsightSchema),
  aiController.generateInsights
);

router.get(
  "/anomalies",
  requireRole("VIEWER"),
  aiController.getAnomalies
);

export default router;
