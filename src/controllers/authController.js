import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// POST /auth/signup
async function signup(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Normalize and validate role; default to 'user'
    let normalizedRole = 'user';
    if (typeof role === 'string') {
      const r = role.toLowerCase();
      if (r === 'admin') normalizedRole = 'admin';
      else if (r !== 'user') {
        return res.status(400).json({ message: "Role must be 'user' or 'admin'" });
      }
    }

    const user = await User.create({ name, email, passwordHash, role: normalizedRole });

    const token = generateToken({ sub: user._id, role: user.role });
    return res.status(201).json({ user, token });
  } catch (err) {
    return next(err);
  }
}

// POST /auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken({ sub: user._id, role: user.role });
    return res.json({ user, token });
  } catch (err) {
    return next(err);
  }
}

// GET /auth/me
async function me(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
}

export { signup, login, me };
