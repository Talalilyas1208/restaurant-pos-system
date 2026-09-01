import { Request, Response } from 'express';
import { storeService } from '../services/store.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

export const getAllTables = asyncHandler(async (_req: Request, res: Response) => {
  const tables = await storeService.getTables();
  sendSuccess(res, tables, 'Tables retrieved successfully');
});

export const getTableByToken = asyncHandler(async (req: Request, res: Response) => {
  const token = req.params.token as string;
  const table = await storeService.getTableByTokenOrId(token);
  if (!table) {
    sendError(res, 'Dining table not found', 404);
    return;
  }
  sendSuccess(res, table, 'Table details retrieved successfully');
});

export const updateTableStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, activeOrderId } = req.body;
  const updated = await storeService.updateTableStatus(id, status, activeOrderId);
  if (!updated) {
    sendError(res, 'Table not found', 404);
    return;
  }
  sendSuccess(res, updated, 'Table status updated successfully');
});

export const createTable = asyncHandler(async (req: Request, res: Response) => {
  const newTable = await storeService.addTable(req.body);
  sendSuccess(res, newTable, 'Table created successfully', 201);
});

