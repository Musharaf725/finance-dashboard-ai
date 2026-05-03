import { prisma } from "../../prisma/client.js";
import { ApiError } from "../../utils/ApiError.js";

function buildWhere({ from, to, category, type }) {
  const where = { deletedAt: null };
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = from;
    if (to) where.date.lte = to;
  }
  if (category) {
    where.category = category;
  }
  if (type) {
    where.type = type;
  }
  return where;
}

export async function listRecords(query) {
  const { page, limit, from, to, category, type } = query;
  const skip = (page - 1) * limit;
  const where = buildWhere({ from, to, category, type });
  const [items, total] = await Promise.all([
    prisma.financialRecord.findMany({
      where,
      skip,
      take: limit,
      orderBy: { date: "desc" },
      include: {
        createdBy: {
          select: { id: true, email: true, name: true },
        },
      },
    }),
    prisma.financialRecord.count({ where }),
  ]);
  return {
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getRecordById(id) {
  const record = await prisma.financialRecord.findFirst({
    where: { id, deletedAt: null },
    include: {
      createdBy: {
        select: { id: true, email: true, name: true },
      },
    },
  });
  if (!record) {
    throw new ApiError(404, "Record not found");
  }
  return record;
}

export async function createRecord(data, createdById) {
  return prisma.financialRecord.create({
    data: {
      amount: data.amount,
      type: data.type,
      category: data.category,
      date: data.date,
      notes: data.notes ?? null,
      createdById,
    },
    include: {
      createdBy: {
        select: { id: true, email: true, name: true },
      },
    },
  });
}

export async function updateRecord(id, data) {
  const existing = await prisma.financialRecord.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) {
    throw new ApiError(404, "Record not found");
  }
  return prisma.financialRecord.update({
    where: { id },
    data: {
      ...(data.amount !== undefined && { amount: data.amount }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.date !== undefined && { date: data.date }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
    include: {
      createdBy: {
        select: { id: true, email: true, name: true },
      },
    },
  });
}

export async function deleteRecord(id) {
  const existing = await prisma.financialRecord.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) {
    throw new ApiError(404, "Record not found");
  }
  await prisma.financialRecord.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  return { id, deleted: true };
}