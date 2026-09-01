import { Router } from 'express';
import { getHealth } from '../controllers/health.controller.js';
import { noCache } from '../middlewares/cacheControl.js';

const router = Router();

// Health checks should always return fresh realtime metrics (no caching)
router.get('/', noCache, getHealth);

export default router;

