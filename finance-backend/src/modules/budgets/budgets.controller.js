import * as budgetsService from "./budgets.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const listBudgets = asyncHandler(async (req, res) => {
  const data = await budgetsService.listBudgets(req.query);
  res.json({ success: true, data });
});

export const createBudget = asyncHandler(async (req, res) => {
  const data = await budgetsService.createBudget(req.body);
  res.status(201).json({ success: true, data });
});

export const updateBudget = asyncHandler(async (req, res) => {
  const data = await budgetsService.updateBudget(req.params.id, req.body);
  res.json({ success: true, data });
});

export const deleteBudget = asyncHandler(async (req, res) => {
  const data = await budgetsService.deleteBudget(req.params.id);
  res.json({ success: true, data });
});

export const budgetStatus = asyncHandler(async (req, res) => {
  const data = await budgetsService.getBudgetStatus(req.query);
  res.json({ success: true, data });
});
