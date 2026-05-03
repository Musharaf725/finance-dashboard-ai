import { env } from "../../config/env.js";
import * as dashboardService from "../dashboard/dashboard.service.js";
import * as recordsService from "../records/records.service.js";
import * as budgetsService from "../budgets/budgets.service.js";
import * as goalsService from "../goals/goals.service.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const insightCache = new Map();
const AI_CACHE_ENABLED = true;

/* ================= CACHE ================= */

function cacheKey(userId, question) {
  return `${userId}:${(question || "overview").trim().toLowerCase()}`;
}

function getCachedInsight(key) {
  const cached = insightCache.get(key);
  if (!cached) return null;
  if (cached.expiresAt <= Date.now()) {
    insightCache.delete(key);
    return null;
  }
  return cached.data;
}

function saveCachedInsight(key, data) {
  insightCache.set(key, {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

/* ================= NORMALIZATION ================= */

function normalizeSuggestions(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((s) => String(s).trim()).filter(Boolean).slice(0, 5);
}

function normalizeSeverity(severity) {
  const val = String(severity || "").toLowerCase();
  if (["warning", "success"].includes(val)) return val;
  return "info";
}

function normalizeInsight(insight, fallback) {
  return {
    insightTitle: insight?.insightTitle || fallback.insightTitle,
    insightMessage: insight?.insightMessage || fallback.insightMessage,
    severity: normalizeSeverity(insight?.severity),
    suggestions:
      normalizeSuggestions(insight?.suggestions).length > 0
        ? normalizeSuggestions(insight?.suggestions)
        : fallback.suggestions,
  };
}

/* ================= DATA LOADER ================= */

async function loadFinanceSnapshot(userId) {
  const query = { userId };

  const [summary, recordsResult, budgets, goals] = await Promise.all([
    dashboardService.getSummary(query),
    recordsService.listRecords({ ...query, page: 1, limit: 20 }),
    budgetsService.getBudgetStatus(query),
    goalsService.getGoalForecast(query),
  ]);

  return {
    summary,
    recentTransactions: (recordsResult?.items || []).slice(0, 10),
    budgets: budgets || [],
    goals: (goals || []).slice(0, 8),
  };
}

/* ================= FALLBACK ================= */

function buildFallbackInsight(snapshot) {
  const income = Number(snapshot.summary?.totalIncome || 0);
  const expense = Number(snapshot.summary?.totalExpense || 0);
  const balance = income - expense;

  return {
    insightTitle: "Financial Overview",
    insightMessage:
      balance >= 0
        ? `You're saving ${balance.toFixed(2)} this period. Keep consistency.`
        : `You're overspending by ${Math.abs(balance).toFixed(2)}. Review expenses.`,
    severity: balance >= 0 ? "success" : "warning",
    suggestions: [
      "Track top spending categories",
      "Reduce unnecessary subscriptions",
      "Set a fixed monthly savings goal",
    ],
  };
}

/* ================= GEMINI ================= */

async function requestGeminiInsight(snapshot, question) {
  const allowedModels = [
  "gemini-flash-latest",
  "gemini-1.0-pro",
];

  let modelName = (env.geminiModel || "").trim();

  if (!allowedModels.includes(modelName)) {
    console.warn("[ai] Invalid model → fallback to default");
    modelName = "gemini-flash-latest";
  }

  console.info("[ai] Gemini request", {
    model: modelName,
    hasKey: !!env.geminiApiKey,
  });

  if (!env.geminiApiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const client = new GoogleGenerativeAI(env.geminiApiKey);

  try {
    const model = client.getGenerativeModel({ model: modelName });

    const prompt = `
You are a financial advisor AI.

Return ONLY valid JSON (no markdown, no explanation).

User Question:
${question || "Give a useful financial insight"}

Financial Data:
${JSON.stringify(snapshot, null, 2)}

Format:
{
  "insightTitle": "string",
  "insightMessage": "string",
  "severity": "info|warning|success",
  "suggestions": ["string"]
}
`;

    const result = await model.generateContent(prompt);
    const response = result.response;

    if (!response) {
      throw new Error("No response from Gemini");
    }

    let text = response.text();

    console.info("[ai] Raw Gemini output:", text);

    // Clean markdown if exists
    text = text
      .replace(/^```json/i, "")
      .replace(/^```/, "")
      .replace(/```$/, "")
      .trim();

    const parsed = JSON.parse(text);

    return parsed;

  } catch (error) {
    console.error("[ai] Gemini FULL error:", error);
    throw error;
  }
}

/* ================= MAIN ================= */

export async function generateInsights({ userId, question }) {
  const key = cacheKey(userId, question);

  if (AI_CACHE_ENABLED) {
    const cached = getCachedInsight(key);
    if (cached) return cached;
  }

  const snapshot = await loadFinanceSnapshot(userId);
  const fallback = buildFallbackInsight(snapshot);

  let result = fallback;

  if (env.aiProvider === "gemini" && env.geminiApiKey) {
    try {
      const ai = await requestGeminiInsight(snapshot, question);
      result = normalizeInsight(ai, fallback);
      console.log("[ai] ✅ Gemini success");
    } catch (err) {
      console.warn("[ai] ❌ Gemini failed → using fallback");
    }
  } else {
    console.warn("[ai] No AI provider configured → fallback");
  }

  if (AI_CACHE_ENABLED) {
    saveCachedInsight(key, result);
  }

  return result;
}

/* ================= ANOMALY DETECTION (Rule-based) ================= */

export async function detectAnomalies({ userId }) {
  console.info('[ai] detectAnomalies start', { userId });

  const snapshot = await loadFinanceSnapshot(userId);
  const anomalies = [];
  const seen = new Set();

  const recent = Array.isArray(snapshot.recentTransactions) ? snapshot.recentTransactions : [];

  // A. HIGH_EXPENSE
  const expenseTx = recent.filter((t) => String(t.type).toUpperCase() === 'EXPENSE');
  const expenseAmounts = expenseTx.map((t) => Number(t.amount || 0)).filter((n) => Number.isFinite(n) && n > 0);
  const avgExpense = expenseAmounts.length > 0 ? expenseAmounts.reduce((a, b) => a + b, 0) / expenseAmounts.length : 0;
  console.debug('[ai] average expense', { avgExpense, expenseCount: expenseAmounts.length });

  if (avgExpense > 0) {
    for (const t of expenseTx) {
      const amt = Number(t.amount || 0);
      if (amt > 2 * avgExpense) {
        const key = `HIGH_EXPENSE:${t.id || t._id || amt}`;
        if (!seen.has(key)) {
          seen.add(key);
          anomalies.push({
            type: 'HIGH_EXPENSE',
            title: 'Unusually high expense',
            message: `A recent ${t.category || 'expense'} of ${Number(amt).toFixed(2)} is more than twice your average expense (${avgExpense.toFixed(2)}).`,
            severity: 'warning',
            meta: { transactionId: t.id || t._id, category: t.category },
          });
        }
      }
      if (anomalies.length >= 5) break;
    }
  }

  // B. MISCLASSIFIED_TRANSACTION
  const suspectCategories = new Set(['Groceries', 'Rent', 'Food', 'Bills']);
  for (const t of recent) {
    if (String(t.type).toUpperCase() === 'INCOME' && suspectCategories.has(t.category)) {
      const key = `MISCLASSIFIED:${t.id || t._id || t.category}`;
      if (!seen.has(key)) {
        seen.add(key);
        anomalies.push({
          type: 'MISCLASSIFIED',
          title: 'Possible misclassified transaction',
          message: `Transaction in category '${t.category}' is marked as INCOME. It may be misclassified.`,
          severity: 'info',
          meta: { transactionId: t.id || t._id, category: t.category, currentType: 'INCOME' },
        });
      }
    }
    if (anomalies.length >= 5) break;
  }

  // C. BUDGET_THRESHOLD
  const budgets = Array.isArray(snapshot.budgets) ? snapshot.budgets : [];
  for (const b of budgets) {
    const pct = Number(b.percentageUsed ?? b.percentage ?? 0);
    if (Number.isFinite(pct) && pct >= 90) {
      const key = `BUDGET:${b.category || pct}`;
      if (!seen.has(key)) {
        seen.add(key);
        anomalies.push({
          type: 'BUDGET_ALERT',
          title: 'Budget nearing limit',
          message: `You've used ${pct}% of your ${b.category || 'budget'}. Consider adjusting spending or budget.`,
          severity: 'warning',
          meta: { category: b.category },
        });
      }
    }
    if (anomalies.length >= 5) break;
  }

  // D. GOAL_BEHIND
  const goals = Array.isArray(snapshot.goals) ? snapshot.goals : [];
  for (const g of goals) {
    if (String(g.status).toUpperCase() === 'BEHIND') {
      const key = `GOAL:${g.id || g._id || g.title}`;
      if (!seen.has(key)) {
        seen.add(key);
        anomalies.push({
          type: 'GOAL_ALERT',
          title: 'Goal behind schedule',
          message: `Your goal '${g.title || g.name || 'Unnamed'}' is behind schedule. Review progress and adjust contributions.`,
          severity: 'warning',
          meta: { goalId: g.id || g._id },
        });
      }
    }
    if (anomalies.length >= 5) break;
  }

  // Limit and dedupe already enforced by seen + break checks
  const final = anomalies.slice(0, 5);
  console.info('[ai] detectAnomalies result count', final.length);
  return final;
}