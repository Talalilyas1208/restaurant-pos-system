import { Router } from 'express';
import { getHotelProfile, updateHotelProfile } from '../controllers/hotel.controller.js';
import { validate } from '../middlewares/validate.js';
import { updateHotelSchema } from '../schemas/index.js';
import { mutationLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.get('/', getHotelProfile);
router.get('/:slug', getHotelProfile);
router.put('/', mutationLimiter, validate(updateHotelSchema), updateHotelProfile);

export default router;
