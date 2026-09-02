import { Router } from 'express';
import {
  getCategories,
  createCategory,
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../controllers/menu.controller.js';
import { validate } from '../middlewares/validate.js';
import { createCategorySchema, createMenuItemSchema, updateMenuItemSchema } from '../schemas/index.js';
import { mutationLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

// Categories
router.get('/categories', getCategories);
router.post('/categories', mutationLimiter, validate(createCategorySchema), createCategory);

// Items
router.get('/items', getMenuItems);
router.get('/items/:id', getMenuItemById);
router.post('/items', mutationLimiter, validate(createMenuItemSchema), createMenuItem);
router.put('/items/:id', mutationLimiter, validate(updateMenuItemSchema), updateMenuItem);
router.patch('/items/:id', mutationLimiter, validate(updateMenuItemSchema), updateMenuItem);
router.delete('/items/:id', mutationLimiter, deleteMenuItem);

export default router;
