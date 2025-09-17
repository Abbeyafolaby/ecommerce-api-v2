import mongoose from 'mongoose';
import Product from '../models/Product.js';

// GET /products
export async function listProducts(req, res, next) {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.json({ products });
  } catch (err) {
    return next(err);
  }
}

// GET /products/:id
export async function getProduct(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid product id' });
    }
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    return res.json({ product });
  } catch (err) {
    return next(err);
  }
}

// POST /products (admin)
export async function createProduct(req, res, next) {
  try {
    const { name, description, price, category, stock, images, isActive } = req.body;
    if (!name || typeof price === 'undefined') {
      return res.status(400).json({ message: 'Name and price are required' });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock,
      images,
      isActive,
    });
    return res.status(201).json({ product });
  } catch (err) {
    return next(err);
  }
}

// PATCH /products/:id (admin)
export async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid product id' });
    }
    const updates = req.body;
    const product = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    return res.json({ product });
  } catch (err) {
    return next(err);
  }
}

// DELETE /products/:id (admin)
export async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid product id' });
    }
    const product = await Product.findByIdAndDelete(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}
