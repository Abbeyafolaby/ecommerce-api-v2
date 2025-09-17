import express from 'express';
import { signup, login, me } from '../controllers/authController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

// Protected route example
router.get('/me', auth(true), me);

export default router;
