import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { simulatePayment } from '../utils/payment.js';

// Helper to build order items snapshot from cart
async function buildOrderFromCart(userId) {
  const cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart || !cart.items || cart.items.length === 0) {
    const err = new Error('Cart is empty');
    err.status = 400;
    throw err;
  }

  const items = [];
  let total = 0;
  for (const it of cart.items) {
    const prod = it.product;
    if (!prod || !prod.isActive) {
      const err = new Error('One or more products are not available');
      err.status = 400;
      throw err;
    }
    if (prod.stock < it.quantity) {
      const err = new Error(`Insufficient stock for ${prod.name}`);
      err.status = 400;
      throw err;
    }
    const subtotal = prod.price * it.quantity;
    items.push({
      product: prod._id,
      name: prod.name,
      price: prod.price,
      quantity: it.quantity,
      subtotal,
    });
    total += subtotal;
  }

  return { items, total };
}

// POST /orders/checkout
// If body has { orderId }, treat as confirmation; otherwise create order from cart
export async function checkout(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { orderId } = req.body || {};

    if (orderId) {
      if (!mongoose.isValidObjectId(orderId)) {
        return res.status(400).json({ message: 'Invalid order id' });
      }
      const order = await Order.findOne({ _id: orderId, user: userId });
      if (!order) return res.status(404).json({ message: 'Order not found' });
      if (order.status !== 'pending') {
        return res.status(400).json({ message: `Order is already ${order.status}` });
      }

      // Optionally re-validate stock before taking payment
      for (const item of order.items) {
        const prod = await Product.findById(item.product);
        if (!prod || !prod.isActive || prod.stock < item.quantity) {
          order.status = 'failed';
          order.payment.status = 'failed';
          await order.save();
          return res.status(400).json({ message: `Product unavailable: ${item.name}` });
        }
      }

      const payment = await simulatePayment(order.total);
      if (!payment.success) {
        order.status = 'failed';
        order.payment = { status: 'failed', reference: payment.reference };
        await order.save();
        return res.status(402).json({ message: 'Payment failed', order });
      }

      // Payment succeeded: decrement stock and clear cart
      for (const item of order.items) {
        await Product.updateOne(
          { _id: item.product, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
        );
      }

      // Clear user's cart
      await Cart.updateOne({ user: userId }, { $set: { items: [] } });

      order.status = 'paid';
      order.payment = { status: 'succeeded', reference: payment.reference };
      order.paidAt = new Date();
      await order.save();
      return res.json({ message: 'Payment succeeded', order });
    }

    // Create order
    const { items, total } = await buildOrderFromCart(userId);
    const order = await Order.create({
      user: userId,
      items,
      total,
      status: 'pending',
      payment: { status: 'pending' },
    });
    return res.status(201).json({ message: 'Order created. Proceed to confirm payment.', order });
  } catch (err) {
    return next(err);
  }
}

// GET /orders
export async function listOrders(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    return res.json({ orders });
  } catch (err) {
    return next(err);
  }
}

// GET /orders/:id
export async function getOrder(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid order id' });
    }
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (String(order.user) !== String(userId) && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    return res.json({ order });
  } catch (err) {
    return next(err);
  }
}
