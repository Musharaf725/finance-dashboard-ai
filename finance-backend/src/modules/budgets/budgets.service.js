import { prisma } from "../../prisma/client.js";
import { ApiError } from "../../utils/ApiError.js";

function normalizePeriod(query = {}) {
  const now = new Date();
  return {
    month: Number(query.month) || now.getUTCMonth() + 1,
    year: Number(query.year) || now.getUTCFullYear(),
  };
}

function getMonthDateRange(month, year) {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  return { start, end };
}

function computeAlertLevel(percentageUsed) {
  if (percentageUsed > 100) return "exceeded";
  if (percentageUsed >= 80) return "warning";
  return "safe";
}

export async function listBudgets(query) {
  const { month, year } = normalizePeriod(query);
  const items = await prisma.budget.findMany({
    where: { month, year },
    orderBy: [{ category: "asc" }],
  });
  return { items, month, year };
}

export async function createBudget(data) {
  try {
    return await prisma.budget.create({
      data: {
        category: data.category,
        monthlyLimit: data.monthlyLimit,
        month: data.month,
        year: data.year,
      },
    });
  } catch (error) {
    if (error?.code === "P2002") {
      throw new ApiError(
        409,
        "Budget already exists for this category and month"
      );
    }
    throw error;
  }
}

export async function updateBudget(id, data) {
  const existing = await prisma.budget.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, "Budget not found");
  }

  try {
    return await prisma.budget.update({
      where: { id },
      data: {
        ...(data.category !== undefined && { category: data.category }),
        ...(data.monthlyLimit !== undefined && { monthlyLimit: data.monthlyLimit }),
        ...(data.month !== undefined && { month: data.month }),
        ...(data.year !== undefined && { year: data.year }),
      },
    });
  } catch (error) {
    if (error?.code === "P2002") {
      throw new ApiError(
        409,
        "Budget already exists for this category and month"
      );
    }
    throw error;
  }
}

export async function deleteBudget(id) {
  const existing = await prisma.budget.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, "Budget not found");
  }
  await prisma.budget.delete({ where: { id } });
  return { id, deleted: true };
}

export async function getBudgetStatus(query) {
  const { month, year } = normalizePeriod(query);
  const { start, end } = getMonthDateRange(month, year);

  const [budgets, expenses] = await Promise.all([
    prisma.budget.findMany({
      where: { month, year },
      orderBy: [{ category: "asc" }],
    }),
    prisma.financialRecord.findMany({
      where: {
        deletedAt: null,
        type: "EXPENSE",
        date: { gte: start, lt: end },
      },
      select: {
        category: true,
        amount: true,
      },
    }),
  ]);

  const spentByCategory = expenses.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] ?? 0) + item.amount;
    return acc;
  }, {});

  return budgets.map((budget) => {
    const totalSpent = Number((spentByCategory[budget.category] ?? 0).toFixed(2));
    const remaining = Number((budget.monthlyLimit - totalSpent).toFixed(2));
    const percentageUsed = budget.monthlyLimit > 0
      ? Number(((totalSpent / budget.monthlyLimit) * 100).toFixed(2))
      : 0;

    return {
      id: budget.id,
      category: budget.category,
      monthlyLimit: budget.monthlyLimit,
      month: budget.month,
      year: budget.year,
      totalSpent,
      remaining,
      percentageUsed,
      alertLevel: computeAlertLevel(percentageUsed),
    };
  });
}
