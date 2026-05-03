import { Router } from "express";
import { z } from "zod";
import * as authController from "./auth.controller.js";
import { validate } from "../../middleware/validate.js";

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(200),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post(
  "/register",
  validate(registerSchema),
  authController.register
);
router.post("/login", validate(loginSchema), authController.login);

export default router;
