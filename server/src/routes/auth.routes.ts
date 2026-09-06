import { Router } from 'express';
import { loginWithPin, createGuestSession, getMe } from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewares/auth.js';
import { mutationLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.post('/pin-login', mutationLimiter, loginWithPin);
router.post('/guest-session', mutationLimiter, createGuestSession);
router.get('/me', verifyToken, getMe);

export default router;
