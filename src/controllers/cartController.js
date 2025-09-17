import mongoose from 'mongoose';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// POST /cart/add
export async function addToCart(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    let { productId, quantity } = req.body || {};
    if (!productId) return res.status(400).json({ message: 'productId is required' });
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: 'Invalid product id' });
    }
    quantity = Number.isInteger(quantity) ? quantity : Number(quantity);
    if (!quantity || quantity < 1) quantity = 1;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (!product.isActive) return res.status(400).json({ message: 'Product is not available' });
    if (product.stock <= 0) return res.status(400).json({ message: 'Product is out of stock' });

    // Get or create cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    // Find existing item
    const existing = cart.items.find((it) => String(it.product) === String(productId));
    const currentQty = existing ? existing.quantity : 0;
    const newQty = currentQty + quantity;

    if (newQty > product.stock) {
      return res.status(400).json({ message: `Cannot add more than stock (${product.stock})` });
    }

    if (existing) {
      existing.quantity = newQty;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    const populated = await cart.populate({ path: 'items.product' });
    return res.status(200).json({ cart: populated });
  } catch (err) {
    return next(err);
  }
}

// GET /cart
export async function getCart(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    return res.json({ cart: cart || { user: userId, items: [] } });
  } catch (err) {
    return next(err);
  }
}

// DELETE /cart/remove/:id (id = productId)
export async function removeFromCart(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid product id' });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const before = cart.items.length;
    cart.items = cart.items.filter((it) => String(it.product) !== String(id));
    if (cart.items.length === before) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    await cart.save();
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}
