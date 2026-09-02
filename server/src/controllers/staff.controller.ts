import { Request, Response } from 'express';
import { storeService } from '../services/store.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

export const getAllStaff = asyncHandler(async (_req: Request, res: Response) => {
  const staff = await storeService.getStaffUsers();
  sendSuccess(res, staff, 'Staff retrieved successfully');
});

export const createStaff = asyncHandler(async (req: Request, res: Response) => {
  const newStaff = await storeService.addStaffUser(req.body);
  sendSuccess(res, newStaff, 'Staff created successfully', 201);
});

export const deleteStaff = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = await storeService.deleteStaffUser(id);
  if (!deleted) {
    sendError(res, 'Staff member not found', 404);
    return;
  }
  sendSuccess(res, { success: true }, 'Staff member deleted successfully');
});

