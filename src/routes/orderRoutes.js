import express from 'express';
import auth from '../middleware/auth.js';
import { checkout, listOrders, getOrder } from '../controllers/orderController.js';

const router = express.Router();

router.use(auth(true));

// Create order from cart OR confirm payment (same endpoint, different body)
router.post('/checkout', checkout);

// Get user's orders
router.get('/', listOrders);

// Get specific order
router.get('/:id', getOrder);

export default router;
