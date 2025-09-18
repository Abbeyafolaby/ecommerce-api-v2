// Ensure only admins can access the route. Requires auth middleware to populate req.user
export default function roleCheck(req, res, next) {
  const role = req.user?.role;
  if (role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  return next();
}
