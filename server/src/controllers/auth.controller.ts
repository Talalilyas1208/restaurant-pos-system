import { Request, Response } from 'express';
import { storeService } from '../services/store.service.js';
import { signToken } from '../utils/jwt.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { AuthenticatedRequest } from '../middlewares/auth.js';
import { StaffUser } from '../types/index.js';

export const loginWithPin = asyncHandler(async (req: Request, res: Response) => {
  const { pin } = req.body;
  if (!pin || typeof pin !== 'string') {
    sendError(res, 'A 4-digit PIN code is required for staff login.', 400);
    return;
  }

  const staffList = await storeService.getStaffUsers();
  const staff = staffList.find((s: StaffUser) => s.pinCode === pin && s.isActive);

  if (!staff) {
    sendError(res, 'Invalid PIN code or inactive staff account.', 401);
    return;
  }

  const token = signToken({
    userId: staff.id,
    name: staff.name,
    role: staff.role,
    hotelId: staff.hotelId,
  });

  sendSuccess(res, { token, user: staff }, `Welcome back, ${staff.name}!`);
});

export const createGuestSession = asyncHandler(async (req: Request, res: Response) => {
  const { tableToken } = req.body;
  if (!tableToken || typeof tableToken !== 'string') {
    sendError(res, 'Valid table token is required.', 400);
    return;
  }

  const table = await storeService.getTableByTokenOrId(tableToken);
  if (!table) {
    sendError(res, 'Dining table not found for this token.', 404);
    return;
  }

  const token = signToken({
    userId: `guest-${table.id}`,
    name: `Guest (${table.tableNumber})`,
    role: 'guest',
    hotelId: table.hotelId,
    tableId: table.id,
    tableNumber: table.tableNumber,
  });

  sendSuccess(res, { token, table }, `Guest session established for Table ${table.tableNumber}`);
});

export const getMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  sendSuccess(res, req.user, 'Current user profile retrieved.');
});
