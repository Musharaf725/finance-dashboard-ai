import { prisma } from "../../prisma/client.js";
import { ApiError } from "../../utils/ApiError.js";

const PRIORITY_WEIGHT = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
};

const STATUS_WEIGHT = {
  BEHIND: 0,
  ON_TRACK: 1,
  COMPLETED: 2,
};

function getCurrentMonthRange(referenceDate = new Date()) {
  const year = referenceDate.getUTCFullYear();
  const month = referenceDate.getUTCMonth();
  return {
    start: new Date(Date.UTC(year, month, 1)),
    end: new Date(Date.UTC(year, month + 1, 1)),
  };
}

function addMonths(date, monthCount) {
  const nextDate = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds()
  ));
  nextDate.setUTCMonth(nextDate.getUTCMonth() + monthCount);
  return nextDate;
}

function buildForecast(goal, currentSavingsRate, now = new Date()) {
  const targetAmount = Number(goal.targetAmount ?? 0);
  const currentAmount = Number(goal.currentAmount ?? 0);
  const targetDate = new Date(goal.targetDate);
  const progressPercentage = targetAmount > 0
    ? Math.min((currentAmount / targetAmount) * 100, 100)
    : 0;
  const remainingAmount = Number(Math.max(targetAmount - currentAmount, 0).toFixed(2));
  const currentSavings = Number(currentSavingsRate.toFixed(2));
  const msPerMonth = 1000 * 60 * 60 * 24 * 30.4375;
  const monthsUntilTarget = Math.max((targetDate.getTime() - now.getTime()) / msPerMonth, 0.1);
  const monthlyRequired = remainingAmount > 0
    ? Number((remainingAmount / monthsUntilTarget).toFixed(2))
    : 0;

  let projectedCompletionDate = null;
  let status = "COMPLETED";

  if (remainingAmount > 0) {
    if (currentSavings > 0) {
      const monthsNeeded = remainingAmount / currentSavings;
      projectedCompletionDate = addMonths(now, monthsNeeded);
    }
    status = projectedCompletionDate && projectedCompletionDate <= targetDate
      ? "ON_TRACK"
      : "BEHIND";
  }

  const projectedCompletionDateIso = projectedCompletionDate
    ? projectedCompletionDate.toISOString()
    : null;

  const completionMonths = projectedCompletionDate && currentSavings > 0
    ? Math.max(Math.ceil((projectedCompletionDate.getTime() - now.getTime()) / msPerMonth), 1)
    : null;

  let forecastMessage = "";
  if (status === "COMPLETED") {
    forecastMessage = "Congratulations, goal achieved";
  } else if (status === "BEHIND") {
    const shortfall = Math.max(monthlyRequired - currentSavings, 0);
    forecastMessage = `You need ${new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(shortfall)} more per month for your ${goal.name} goal`;
  } else if (completionMonths && completionMonths > 0) {
    forecastMessage = `You can reach your ${goal.name} in ${completionMonths} months`;
  } else {
    forecastMessage = `Your ${goal.name} goal is ahead of schedule`;
  }

  return {
    ...goal,
    targetAmount,
    currentAmount,
    targetDate: goal.targetDate,
    progressPercentage: Number(progressPercentage.toFixed(2)),
    remainingAmount,
    monthlyRequired,
    currentSavingsRate: currentSavings,
    projectedCompletionDate: projectedCompletionDateIso,
    status,
    forecastMessage,
  };
}

async function getMonthlySavings(referenceDate = new Date()) {
  const { start, end } = getCurrentMonthRange(referenceDate);
  const [incomeAgg, expenseAgg] = await Promise.all([
    prisma.financialRecord.aggregate({
      where: {
        deletedAt: null,
        type: "INCOME",
        date: { gte: start, lt: end },
      },
      _sum: { amount: true },
    }),
    prisma.financialRecord.aggregate({
      where: {
        deletedAt: null,
        type: "EXPENSE",
        date: { gte: start, lt: end },
      },
      _sum: { amount: true },
    }),
  ]);

  const income = incomeAgg._sum.amount ?? 0;
  const expense = expenseAgg._sum.amount ?? 0;
  return income - expense;
}

function sortGoals(goals) {
  return [...goals].sort((a, b) => {
    const priorityDiff = (PRIORITY_WEIGHT[b.priority] ?? 0) - (PRIORITY_WEIGHT[a.priority] ?? 0);
    if (priorityDiff !== 0) return priorityDiff;
    const statusDiff = (STATUS_WEIGHT[a.status] ?? 0) - (STATUS_WEIGHT[b.status] ?? 0);
    if (statusDiff !== 0) return statusDiff;
    return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
  });
}

async function enrichGoals(goals, referenceDate = new Date()) {
  const currentSavingsRate = await getMonthlySavings(referenceDate);
  const enriched = goals.map((goal) => buildForecast(goal, currentSavingsRate, referenceDate));
  return sortGoals(enriched);
}

async function getEnrichedGoalById(id, referenceDate = new Date()) {
  const goal = await prisma.goal.findFirst({ where: { id } });
  if (!goal) {
    throw new ApiError(404, "Goal not found");
  }
  const [enriched] = await enrichGoals([goal], referenceDate);
  return enriched;
}

export async function listGoals() {
  const goals = await prisma.goal.findMany({
    orderBy: [{ createdAt: "desc" }],
  });
  return {
    items: await enrichGoals(goals),
  };
}

export async function getGoalById(id) {
  return getEnrichedGoalById(id);
}

export async function createGoal(data) {
  const goal = await prisma.goal.create({
    data: {
      name: data.name,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount ?? 0,
      targetDate: data.targetDate,
      priority: data.priority,
      category: data.category,
      status: "ON_TRACK",
    },
  });
  return getEnrichedGoalById(goal.id);
}

export async function updateGoal(id, data) {
  const existing = await prisma.goal.findFirst({ where: { id } });
  if (!existing) {
    throw new ApiError(404, "Goal not found");
  }

  await prisma.goal.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.targetAmount !== undefined && { targetAmount: data.targetAmount }),
      ...(data.currentAmount !== undefined && { currentAmount: data.currentAmount }),
      ...(data.targetDate !== undefined && { targetDate: data.targetDate }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.category !== undefined && { category: data.category }),
    },
  });

  return getEnrichedGoalById(id);
}

export async function deleteGoal(id) {
  const existing = await prisma.goal.findFirst({ where: { id } });
  if (!existing) {
    throw new ApiError(404, "Goal not found");
  }
  await prisma.goal.delete({ where: { id } });
  return { id, deleted: true };
}

export async function getGoalForecast(query = {}) {
  const goals = await prisma.goal.findMany({ orderBy: [{ createdAt: "desc" }] });
  const currentSavingsRate = await getMonthlySavings();
  const items = sortGoals(goals.map((goal) => buildForecast(goal, currentSavingsRate)));
  return items;
}
