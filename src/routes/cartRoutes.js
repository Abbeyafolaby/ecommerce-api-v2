import express from 'express';
import auth from '../middleware/auth.js';
import { addToCart, getCart, removeFromCart } from '../controllers/cartController.js';
import { validateBody, addToCartSchema } from '../utils/validators.js';

const router = express.Router();

router.use(auth(true));

router.post('/add', validateBody(addToCartSchema), addToCart);
router.get('/', getCart);
router.delete('/remove/:id', removeFromCart);

export default router;
