import { Request, Response, NextFunction } from 'express';
import { storeService } from '../services/store.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getAllTables = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tables = await storeService.getTables();
    sendSuccess(res, tables, 'Tables retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getTableByToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.params.token as string;
    const table = await storeService.getTableByTokenOrId(token);
    if (!table) {
      sendError(res, 'Dining table not found', 404);
      return;
    }
    sendSuccess(res, table, 'Table details retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateTableStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, activeOrderId } = req.body;
    const updated = await storeService.updateTableStatus(id, status, activeOrderId);
    if (!updated) {
      sendError(res, 'Table not found', 404);
      return;
    }
    sendSuccess(res, updated, 'Table status updated successfully');
  } catch (error) {
    next(error);
  }
};

export const createTable = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newTable = await storeService.addTable(req.body);
    sendSuccess(res, newTable, 'Table created successfully', 201);
  } catch (error) {
    next(error);
  }
};
