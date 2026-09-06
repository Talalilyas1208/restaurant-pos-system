import { Router } from 'express';
import { getDashboardAnalytics } from '../controllers/analytics.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.js';

const router = Router();

router.get('/dashboard', verifyToken, requireRole('admin', 'manager'), getDashboardAnalytics);

export default router;
