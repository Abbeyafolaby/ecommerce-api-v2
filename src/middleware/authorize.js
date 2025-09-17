// Requires auth middleware to have populated req.user
export default function requireAdmin(req, res, next) {
  const role = req.user?.role;
  if (role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  return next();
}
