import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError.js";

/**
 * @param {import("zod").ZodSchema} schema
 * @param {"body" | "query" | "params"} source
 */
export function validate(schema, source = "body") {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(
          new ApiError(400, "Validation failed", err.flatten().fieldErrors)
        );
      }
      next(err);
    }
  };
}
