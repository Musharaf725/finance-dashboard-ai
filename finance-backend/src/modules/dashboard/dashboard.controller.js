import * as dashboardService from "./dashboard.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const summary = asyncHandler(async (req, res) => {
  const data = await dashboardService.getSummary(req.query);
  res.json({ success: true, data });
});

export const categoryBreakdown = asyncHandler(async (req, res) => {
  const data = await dashboardService.getCategoryBreakdown(req.query);
  res.json({ success: true, data });
});

export const recent = asyncHandler(async (req, res) => {
  const data = await dashboardService.getRecent(req.query);
  res.json({ success: true, data });
});

export const monthlyTrends = asyncHandler(async (req, res) => {
  const data = await dashboardService.getMonthlyTrends(req.query);
  res.json({ success: true, data });
});
