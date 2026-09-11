import { Router } from 'express';
import { processPayment } from '../controllers/payment.controller.js';
import { validate } from '../middlewares/validate.js';
import { processPaymentSchema } from '../schemas/index.js';
import { mutationLimiter } from '../middlewares/rateLimiter.js';
import { idempotency } from '../middlewares/idempotency.js';

const router = Router();

router.post('/', mutationLimiter, idempotency, validate(processPaymentSchema), processPayment);

export default router;
