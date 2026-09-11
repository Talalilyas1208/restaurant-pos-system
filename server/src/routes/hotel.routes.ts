import { Router } from 'express';
import { getHotelProfile, updateHotelProfile } from '../controllers/hotel.controller.js';
import { validate } from '../middlewares/validate.js';
import { updateHotelSchema } from '../schemas/index.js';
import { mutationLimiter } from '../middlewares/rateLimiter.js';
import { httpCache } from '../middlewares/httpCache.js';

const router = Router();

router.get('/', httpCache(60, 180), getHotelProfile);
router.get('/:slug', httpCache(60, 180), getHotelProfile);
router.put('/', mutationLimiter, validate(updateHotelSchema), updateHotelProfile);

export default router;
