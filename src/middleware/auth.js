import jwt from 'jsonwebtoken';

function auth(required = true) {
  return (req, res, next) => {
    try {
      const header = req.headers.authorization || '';
      const [scheme, token] = header.split(' ');
      if (!token || scheme !== 'Bearer') {
        if (required) return res.status(401).json({ message: 'Authorization token missing' });
        req.user = null;
        return next();
      }

      const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
      const payload = jwt.verify(token, secret);
      req.user = { id: payload.sub, role: payload.role };
      return next();
    } catch (err) {
      if (required) return res.status(401).json({ message: 'Invalid or expired token' });
      console.error(err);
      req.user = null;
      return next();
    }
  };
}

export default auth;
