import { Router } from 'express';
import { getAllStaff, createStaff, deleteStaff } from '../controllers/staff.controller.js';

const router = Router();

router.get('/', getAllStaff);
router.post('/', createStaff);
router.delete('/:id', deleteStaff);

export default router;

