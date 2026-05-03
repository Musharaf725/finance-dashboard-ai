import { Router } from "express";
import * as budgetsController from "./budgets.controller.js";
import {
  budgetsQuerySchema,
  idParamSchema,
  createBudgetSchema,
  updateBudgetSchema,
} from "./budgets.validation.js";
import { authenticate } from "../../middleware/authenticate.js";
import { requireRole } from "../../middleware/requireRole.js";
import { validate } from "../../middleware/validate.js";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  requireRole("VIEWER"),
  validate(budgetsQuerySchema, "query"),
  budgetsController.listBudgets
);

router.get(
  "/status",
  requireRole("VIEWER"),
  validate(budgetsQuerySchema, "query"),
  budgetsController.budgetStatus
);

router.post(
  "/",
  requireRole("ANALYST"),
  validate(createBudgetSchema),
  budgetsController.createBudget
);

router.put(
  "/:id",
  requireRole("ANALYST"),
  validate(idParamSchema, "params"),
  validate(updateBudgetSchema),
  budgetsController.updateBudget
);

router.delete(
  "/:id",
  requireRole("ADMIN"),
  validate(idParamSchema, "params"),
  budgetsController.deleteBudget
);

export default router;
