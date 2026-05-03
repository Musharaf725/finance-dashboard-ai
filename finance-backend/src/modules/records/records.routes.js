import { Router } from "express";
import * as recordsController from "./records.controller.js";
import {
  listRecordsQuerySchema,
  idParamSchema,
  createRecordSchema,
  updateRecordSchema,
} from "./records.validation.js";
import { authenticate } from "../../middleware/authenticate.js";
import { requireRole } from "../../middleware/requireRole.js";
import { validate } from "../../middleware/validate.js";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  requireRole("VIEWER"),
  validate(listRecordsQuerySchema, "query"),
  recordsController.listRecords
);

router.get(
  "/:id",
  requireRole("VIEWER"),
  validate(idParamSchema, "params"),
  recordsController.getRecord
);

router.post(
  "/",
  requireRole("ANALYST"),
  validate(createRecordSchema),
  recordsController.createRecord
);

router.patch(
  "/:id",
  requireRole("ANALYST"),
  validate(idParamSchema, "params"),
  validate(updateRecordSchema),
  recordsController.updateRecord
);

router.delete(
  "/:id",
  requireRole("ADMIN"),
  validate(idParamSchema, "params"),
  recordsController.deleteRecord
);

export default router;
