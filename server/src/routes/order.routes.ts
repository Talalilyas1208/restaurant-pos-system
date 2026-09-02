import { Router } from 'express';
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
} from '../controllers/order.controller.js';
import { validate } from '../middlewares/validate.js';
import { createOrderSchema, updateOrderStatusSchema } from '../schemas/index.js';
import { mutationLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.get('/', getOrders);
router.get('/:id', getOrderById);
router.post('/', mutationLimiter, validate(createOrderSchema), createOrder);
router.patch('/:id/status', mutationLimiter, validate(updateOrderStatusSchema), updateOrderStatus);

export default router;
