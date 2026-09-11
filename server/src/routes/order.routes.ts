import { Router } from 'express';
import {
  getOrders,
  getOrderById,
  createOrder,
  checkoutOrder,
  updateOrderStatus,
  createMockOrder,
  clearOrders,
} from '../controllers/order.controller.js';
import { validate } from '../middlewares/validate.js';
import { createOrderSchema, updateOrderStatusSchema, checkoutOrderSchema } from '../schemas/index.js';
import { mutationLimiter } from '../middlewares/rateLimiter.js';
import { verifyToken, requireRole } from '../middlewares/auth.js';
import { idempotency } from '../middlewares/idempotency.js';

const router = Router();

router.get('/', getOrders);
router.post('/mock', mutationLimiter, createMockOrder);
router.delete('/clear', mutationLimiter, clearOrders);
router.get('/:id', getOrderById);
router.post('/', mutationLimiter, idempotency, validate(createOrderSchema), createOrder);
router.post('/checkout', mutationLimiter, idempotency, validate(checkoutOrderSchema), checkoutOrder);
router.patch(
  '/:id/status',
  mutationLimiter,
  verifyToken,
  requireRole('admin', 'manager', 'cashier', 'kitchen', 'waiter'),
  validate(updateOrderStatusSchema),
  updateOrderStatus
);

export default router;
