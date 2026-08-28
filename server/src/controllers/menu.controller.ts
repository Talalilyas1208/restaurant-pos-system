import { Request, Response, NextFunction } from 'express';
import { storeService } from '../services/store.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await storeService.getCategories();
    sendSuccess(res, categories, 'Categories retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await storeService.addCategory(req.body);
    sendSuccess(res, category, 'Category created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getMenuItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categoryId } = req.query;
    const items = await storeService.getMenuItems(undefined, categoryId as string | undefined);
    sendSuccess(res, items, 'Menu items retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getMenuItemById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const item = await storeService.getMenuItemById(id);
    if (!item) {
      sendError(res, 'Menu item not found', 404);
      return;
    }
    sendSuccess(res, item, 'Menu item retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await storeService.addMenuItem(req.body);
    sendSuccess(res, item, 'Menu item created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const item = await storeService.updateMenuItem(id, req.body);
    if (!item) {
      sendError(res, 'Menu item not found', 404);
      return;
    }
    sendSuccess(res, item, 'Menu item updated successfully');
  } catch (error) {
    next(error);
  }
};
