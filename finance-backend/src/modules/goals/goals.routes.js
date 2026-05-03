import { Router } from "express";
import * as goalsController from "./goals.controller.js";
import {
  idParamSchema,
  createGoalSchema,
  updateGoalSchema,
  forecastQuerySchema,
} from "./goals.validation.js";
import { authenticate } from "../../middleware/authenticate.js";
import { requireRole } from "../../middleware/requireRole.js";
import { validate } from "../../middleware/validate.js";

const router = Router();

router.use(authenticate);

router.get(
  "/forecast",
  requireRole("VIEWER"),
  validate(forecastQuerySchema, "query"),
  goalsController.forecast
);

router.get(
  "/",
  requireRole("VIEWER"),
  goalsController.listGoals
);

router.get(
  "/:id",
  requireRole("VIEWER"),
  validate(idParamSchema, "params"),
  goalsController.getGoal
);

router.post(
  "/",
  requireRole("ANALYST"),
  validate(createGoalSchema),
  goalsController.createGoal
);

router.put(
  "/:id",
  requireRole("ANALYST"),
  validate(idParamSchema, "params"),
  validate(updateGoalSchema),
  goalsController.updateGoal
);

router.patch(
  "/:id",
  requireRole("ANALYST"),
  validate(idParamSchema, "params"),
  validate(updateGoalSchema),
  goalsController.updateGoal
);

router.delete(
  "/:id",
  requireRole("ADMIN"),
  validate(idParamSchema, "params"),
  goalsController.deleteGoal
);

export default router;
