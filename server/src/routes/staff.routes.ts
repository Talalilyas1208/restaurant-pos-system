import { Router } from 'express';
import { getAllStaff, createStaff, deleteStaff } from '../controllers/staff.controller.js';
import { validate } from '../middlewares/validate.js';
import { createStaffSchema } from '../schemas/index.js';
import { mutationLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.get('/', getAllStaff);
router.post('/', mutationLimiter, validate(createStaffSchema), createStaff);
router.delete('/:id', mutationLimiter, deleteStaff);

export default router;
