/**
 * Simple admin guard — checks Authorization: Bearer <ADMIN_SECRET>.
 * Set ADMIN_SECRET in env. If unset the endpoint is unavailable.
 */
function adminMiddleware(req, res, next) {
  const secret = process.env.ADMIN_SECRET;

  if (!secret) {
    return res.status(503).json({ error: 'Admin endpoints not configured', code: 'ADMIN_DISABLED' });
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!token || token !== secret) {
    return res.status(401).json({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
  }

  next();
}

module.exports = adminMiddleware;
