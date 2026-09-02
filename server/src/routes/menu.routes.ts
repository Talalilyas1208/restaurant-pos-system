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

const router = Router();

// Categories
router.get('/categories', getCategories);
router.post('/categories', createCategory);

// Items
router.get('/items', getMenuItems);
router.get('/items/:id', getMenuItemById);
router.post('/items', createMenuItem);
router.put('/items/:id', updateMenuItem);
router.patch('/items/:id', updateMenuItem);
router.delete('/items/:id', deleteMenuItem);

export default router;

