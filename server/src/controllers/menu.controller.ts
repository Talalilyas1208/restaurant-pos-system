import { Request, Response } from 'express';
import { storeService } from '../services/store.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await storeService.getCategories();
  sendSuccess(res, categories, 'Categories retrieved successfully');
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await storeService.addCategory(req.body);
  sendSuccess(res, category, 'Category created successfully', 201);
});

export const getMenuItems = asyncHandler(async (req: Request, res: Response) => {
  const { categoryId } = req.query;
  const items = await storeService.getMenuItems(undefined, categoryId as string | undefined);
  sendSuccess(res, items, 'Menu items retrieved successfully');
});

export const getMenuItemById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const item = await storeService.getMenuItemById(id);
  if (!item) {
    sendError(res, 'Menu item not found', 404);
    return;
  }
  sendSuccess(res, item, 'Menu item retrieved successfully');
});

export const createMenuItem = asyncHandler(async (req: Request, res: Response) => {
  const item = await storeService.addMenuItem(req.body);
  sendSuccess(res, item, 'Menu item created successfully', 201);
});

export const updateMenuItem = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const item = await storeService.updateMenuItem(id, req.body);
  if (!item) {
    sendError(res, 'Menu item not found', 404);
    return;
  }
  sendSuccess(res, item, 'Menu item updated successfully');
});

export const deleteMenuItem = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = await storeService.deleteMenuItem(id);
  if (!deleted) {
    sendError(res, 'Menu item not found', 404);
    return;
  }
  sendSuccess(res, { success: true }, 'Menu item deleted successfully');
});


