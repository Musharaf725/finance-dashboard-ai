import { Router } from "express";
import { z } from "zod";
import * as usersController from "./users.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { requireRole } from "../../middleware/requireRole.js";
import { validate } from "../../middleware/validate.js";

const router = Router();

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const idParamSchema = z.object({
  id: z.string().min(1),
});

const patchRoleSchema = z.object({
  role: z.enum(["VIEWER", "ANALYST", "ADMIN"]),
});

const patchStatusSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

router.use(authenticate, requireRole("ADMIN"));

router.get("/", validate(listQuerySchema, "query"), usersController.listUsers);

router.patch(
  "/:id/role",
  validate(idParamSchema, "params"),
  validate(patchRoleSchema),
  usersController.patchRole
);

router.patch(
  "/:id/status",
  validate(idParamSchema, "params"),
  validate(patchStatusSchema),
  usersController.patchStatus
);

router.delete(
  "/:id",
  validate(idParamSchema, "params"),
  usersController.removeUser
);

export default router;
