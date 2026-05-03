import { ApiError } from "../utils/ApiError.js";
import { ZodError } from "zod";

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      details: err.flatten().fieldErrors,
    });
  }

  const status = err.statusCode ?? err.status ?? 500;
  const message =
    status >= 500 ? "Internal server error" : err.message || "Request failed";

  if (status >= 500) {
    console.error(err);
  }

  return res.status(status).json({
    success: false,
    message,
  });
}
