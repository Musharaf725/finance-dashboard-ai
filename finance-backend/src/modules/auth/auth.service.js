import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { prisma } from "../../prisma/client.js";
import { ApiError } from "../../utils/ApiError.js";

const SALT_ROUNDS = 10;

function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

export async function register({ email, name, password }) {
  const existing = await prisma.user.findFirst({
    where: { email: email.toLowerCase(), deletedAt: null },
  });
  if (existing) {
    throw new ApiError(409, "Email already registered");
  }
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      name,
      passwordHash,
      role: "VIEWER",
      status: "ACTIVE",
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });
  const token = signToken(user);
  return { token, user };
}

export async function login({ email, password }) {
  const user = await prisma.user.findFirst({
    where: { email: email.toLowerCase(), deletedAt: null },
  });
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    throw new ApiError(401, "Invalid email or password");
  }
  if (user.status !== "ACTIVE") {
    throw new ApiError(403, "Account is not active");
  }
  const publicUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
  };
  const token = signToken(publicUser);
  return { token, user: publicUser };
}
