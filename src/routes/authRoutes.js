import express from 'express';
import rateLimit from 'express-rate-limit';
import { signup, login, me } from '../controllers/authController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per window on auth endpoints
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);

// Protected route example
router.get('/me', auth(true), me);

export default router;
