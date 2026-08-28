import { Router } from 'express';
import { processPayment } from '../controllers/payment.controller.js';

const router = Router();

router.post('/', processPayment);

export default router;
