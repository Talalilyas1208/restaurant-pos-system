import { Router } from 'express';
import hotelRoutes from './hotel.routes.js';
import tableRoutes from './table.routes.js';
import menuRoutes from './menu.routes.js';
import orderRoutes from './order.routes.js';
import paymentRoutes from './payment.routes.js';
import analyticsRoutes from './analytics.routes.js';
import healthRoutes from './health.routes.js';
import staffRoutes from './staff.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/hotels', hotelRoutes);
router.use('/tables', tableRoutes);
router.use('/menu', menuRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/staff', staffRoutes);

export default router;


