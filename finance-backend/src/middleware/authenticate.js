import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../prisma/client.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new ApiError(401, "Authentication required");
  }
  const token = header.slice(7);
  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new ApiError(401, "Invalid or expired token");
  }
  const userId = payload.sub;
  if (!userId || typeof userId !== "string") {
    throw new ApiError(401, "Invalid token payload");
  }
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: { id: true, email: true, name: true, role: true, status: true },
  });
  if (!user) {
    throw new ApiError(401, "User not found");
  }
  if (user.status !== "ACTIVE") {
    throw new ApiError(403, "Account is not active");
  }
  req.user = user;
  next();
});
