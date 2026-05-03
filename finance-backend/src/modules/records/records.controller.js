import * as recordsService from "./records.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const listRecords = asyncHandler(async (req, res) => {
  const result = await recordsService.listRecords(req.query);
  res.json({ success: true, data: result });
});

export const getRecord = asyncHandler(async (req, res) => {
  const record = await recordsService.getRecordById(req.params.id);
  res.json({ success: true, data: record });
});

export const createRecord = asyncHandler(async (req, res) => {
  const record = await recordsService.createRecord(req.body, req.user.id);
  res.status(201).json({ success: true, data: record });
});

export const updateRecord = asyncHandler(async (req, res) => {
  const record = await recordsService.updateRecord(req.params.id, req.body);
  res.json({ success: true, data: record });
});

export const deleteRecord = asyncHandler(async (req, res) => {
  const result = await recordsService.deleteRecord(req.params.id);
  res.json({ success: true, data: result });
});
