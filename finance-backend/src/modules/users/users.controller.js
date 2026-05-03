import * as usersService from "./users.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const listUsers = asyncHandler(async (req, res) => {
  const result = await usersService.listUsers(req.query);
  res.json({ success: true, data: result });
});

export const patchRole = asyncHandler(async (req, res) => {
  const user = await usersService.updateUserRole(req.params.id, req.body.role);
  res.json({ success: true, data: user });
});

export const patchStatus = asyncHandler(async (req, res) => {
  const user = await usersService.updateUserStatus(
    req.params.id,
    req.body.status
  );
  res.json({ success: true, data: user });
});

export const removeUser = asyncHandler(async (req, res) => {
  const result = await usersService.softDeleteUser(req.params.id);
  res.json({ success: true, data: result });
});
