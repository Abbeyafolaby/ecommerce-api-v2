import express from 'express';
import auth from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';
import { listAllOrders, updateOrderFulfillmentStatus } from '../controllers/orderController.js';

const router = express.Router();

router.use(auth(true));
router.use(roleCheck);

router.get('/', listAllOrders);
router.patch('/:id/status', updateOrderFulfillmentStatus);

export default router;

