import { prisma } from "../../prisma/client.js";

function recordDateFilter({ from, to }) {
  const filter = {};
  if (from || to) {
    filter.date = {};
    if (from) filter.date.gte = from;
    if (to) filter.date.lte = to;
  }
  return filter;
}

function baseWhere(query) {
  const dateFilter = recordDateFilter(query);
  return {
    deletedAt: null,
    ...dateFilter,
  };
}

function monthKey(date) {
  const d = new Date(date);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function getSummary(query) {
  const where = baseWhere(query);
  const [incomeAgg, expenseAgg] = await Promise.all([
    prisma.financialRecord.aggregate({
      where: { ...where, type: "INCOME" },
      _sum: { amount: true },
    }),
    prisma.financialRecord.aggregate({
      where: { ...where, type: "EXPENSE" },
      _sum: { amount: true },
    }),
  ]);
  const totalIncome = incomeAgg._sum.amount ?? 0;
  const totalExpense = expenseAgg._sum.amount ?? 0;
  return {
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense,
  };
}

export async function getCategoryBreakdown(query) {
  const where = baseWhere(query);
  const grouped = await prisma.financialRecord.groupBy({
    by: ["category", "type"],
    where,
    _sum: { amount: true },
  });
  const map = new Map();
  for (const row of grouped) {
    if (!map.has(row.category)) {
      map.set(row.category, { category: row.category, income: 0, expense: 0 });
    }
    const entry = map.get(row.category);
    if (row.type === "INCOME") {
      entry.income = row._sum.amount ?? 0;
    } else {
      entry.expense = row._sum.amount ?? 0;
    }
  }
  return Array.from(map.values()).map((c) => ({
    ...c,
    net: c.income - c.expense,
  }));
}

export async function getRecent(query) {
  const where = baseWhere(query);
  const limit = Number(query.limit) || 5;

  const items = await prisma.financialRecord.findMany({
    where,
    take: limit,
    orderBy: {
      date: "desc",
    },
    select: {
      id: true,
      amount: true,
      type: true,
      category: true,
      notes: true,
      date: true,
      createdBy: {
        select: {
          name: true,
        },
      },
    },
  });

  return items;
}

export async function getMonthlyTrends(query) {
  const where = baseWhere(query);
  const records = await prisma.financialRecord.findMany({
    where,
    select: { date: true, type: true, amount: true },
  });
  const byMonth = new Map();
  for (const r of records) {
    const key = monthKey(r.date);
    if (!byMonth.has(key)) {
      byMonth.set(key, { month: key, income: 0, expense: 0, net: 0 });
    }
    const entry = byMonth.get(key);
    if (r.type === "INCOME") {
      entry.income += r.amount;
    } else {
      entry.expense += r.amount;
    }
    entry.net = entry.income - entry.expense;
  }
  return Array.from(byMonth.values()).sort((a, b) =>
    a.month.localeCompare(b.month)
  );
}
