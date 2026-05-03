import { asyncHandler } from "../../utils/asyncHandler.js";
import * as aiService from "./ai.service.js";

export const generateInsights = asyncHandler(async (req, res) => {
  const data = await aiService.generateInsights({
    userId: req.user.id,
    question: req.body.question,
    forceRefresh: req.body.forceRefresh,
  });

  res.json({ success: true, data });
});

export const getAnomalies = asyncHandler(async (req, res) => {
  const data = await aiService.detectAnomalies({
    userId: req.user.id,
  });

  res.json({ success: true, data });
});
