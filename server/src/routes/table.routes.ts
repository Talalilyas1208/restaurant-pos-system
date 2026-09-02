import { Router } from 'express';
import { getAllTables, getTableByToken, updateTableStatus, createTable, deleteTable } from '../controllers/table.controller.js';
import { validate } from '../middlewares/validate.js';
import { createTableSchema, updateTableStatusSchema } from '../schemas/index.js';
import { mutationLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.get('/', getAllTables);
router.get('/token/:token', getTableByToken);
router.post('/', mutationLimiter, validate(createTableSchema), createTable);
router.patch('/:id/status', mutationLimiter, validate(updateTableStatusSchema), updateTableStatus);
router.delete('/:id', mutationLimiter, deleteTable);

export default router;
