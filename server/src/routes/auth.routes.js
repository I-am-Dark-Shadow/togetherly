import express from 'express';
import { register, login, logout, getMe } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimiter.js'; // <--- NEW

const router = express.Router();

// Apply stricter rate limiting to registration and login to prevent brute force
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);

router.get('/me', protectRoute, getMe);

export default router;