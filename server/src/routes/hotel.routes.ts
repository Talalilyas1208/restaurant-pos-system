import { Router } from 'express';
import { getHotelProfile, updateHotelProfile } from '../controllers/hotel.controller.js';

const router = Router();

router.get('/', getHotelProfile);
router.get('/:slug', getHotelProfile);
router.put('/', updateHotelProfile);

export default router;
