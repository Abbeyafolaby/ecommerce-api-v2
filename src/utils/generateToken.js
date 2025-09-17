import jwt from 'jsonwebtoken';

function generateToken(payload, options = {}) {
  const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
  const expiresIn = options.expiresIn || process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, secret, { expiresIn });
}

export default generateToken;
