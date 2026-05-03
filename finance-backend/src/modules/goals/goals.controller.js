import * as goalsService from "./goals.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const listGoals = asyncHandler(async (req, res) => {
  const data = await goalsService.listGoals(req.query);
  res.json({ success: true, data });
});

export const getGoal = asyncHandler(async (req, res) => {
  const data = await goalsService.getGoalById(req.params.id);
  res.json({ success: true, data });
});

export const createGoal = asyncHandler(async (req, res) => {
  const data = await goalsService.createGoal(req.body);
  res.status(201).json({ success: true, data });
});

export const updateGoal = asyncHandler(async (req, res) => {
  const data = await goalsService.updateGoal(req.params.id, req.body);
  res.json({ success: true, data });
});

export const deleteGoal = asyncHandler(async (req, res) => {
  const data = await goalsService.deleteGoal(req.params.id);
  res.json({ success: true, data });
});

export const forecast = asyncHandler(async (req, res) => {
  const data = await goalsService.getGoalForecast(req.query);
  res.json({ success: true, data });
});
