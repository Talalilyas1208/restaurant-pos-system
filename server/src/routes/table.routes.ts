import { Router } from 'express';
import { getAllTables, getTableByToken, updateTableStatus, createTable, deleteTable } from '../controllers/table.controller.js';

const router = Router();

router.get('/', getAllTables);
router.get('/token/:token', getTableByToken);
router.post('/', createTable);
router.patch('/:id/status', updateTableStatus);
router.delete('/:id', deleteTable);

export default router;

