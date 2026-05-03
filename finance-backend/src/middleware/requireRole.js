import { ApiError } from "../utils/ApiError.js";

const ROLE_ORDER = {
  VIEWER: 0,
  ANALYST: 1,
  ADMIN: 2,
};

/**
 * Minimum role required (hierarchy: VIEWER < ANALYST < ADMIN).
 * @param {keyof typeof ROLE_ORDER} minRole
 */
export function requireRole(minRole) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required"));
    }
    const userLevel = ROLE_ORDER[req.user.role];
    const required = ROLE_ORDER[minRole];
    if (userLevel === undefined || required === undefined) {
      return next(new ApiError(500, "Invalid role configuration"));
    }
    if (userLevel < required) {
      return next(new ApiError(403, "Insufficient permissions"));
    }
    next();
  };
}
