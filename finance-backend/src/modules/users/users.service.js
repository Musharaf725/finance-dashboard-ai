import { prisma } from "../../prisma/client.js";
import { ApiError } from "../../utils/ApiError.js";

export async function listUsers({ page, limit }) {
  const skip = (page - 1) * limit;
  const where = { deletedAt: null };
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);
  return {
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function updateUserRole(userId, role) {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      updatedAt: true,
    },
  });
  return updated;
}

export async function updateUserStatus(userId, status) {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { status },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      updatedAt: true,
    },
  });
  return updated;
}

export async function softDeleteUser(userId) {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date(), status: "INACTIVE" },
    }),
    prisma.financialRecord.updateMany({
      where: { createdById: userId, deletedAt: null },
      data: { deletedAt: new Date() },
    }),
  ]);
  return { id: userId, deleted: true };
}
