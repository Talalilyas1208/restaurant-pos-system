import { Router } from 'express';
import { getAllTables, getTableByToken, updateTableStatus, createTable } from '../controllers/table.controller.js';

const router = Router();

router.get('/', getAllTables);
router.get('/token/:token', getTableByToken);
router.post('/', createTable);
router.patch('/:id/status', updateTableStatus);

export default router;
