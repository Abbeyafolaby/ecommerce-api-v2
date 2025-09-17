import express from 'express';
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import auth from '../middleware/auth.js';
import requireAdmin from '../middleware/authorize.js';

const router = express.Router();

// Public routes
router.get('/', listProducts);
router.get('/:id', getProduct);

// Admin-only routes
router.post('/', auth(true), requireAdmin, createProduct);
router.patch('/:id', auth(true), requireAdmin, updateProduct);
router.delete('/:id', auth(true), requireAdmin, deleteProduct);

export default router;
