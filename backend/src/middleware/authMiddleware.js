const { serviceClient, createUserClient } = require('../config/supabase');

/**
 * Validates the Supabase JWT from the Authorization header.
 * Attaches:
 *   req.user     — Supabase auth user object
 *   req.token    — raw JWT string
 *   req.supabase — per-request authenticated client (anon key + user JWT)
 *                  Use req.supabase for all DB queries in route handlers so
 *                  RLS policies evaluate with the correct auth.uid().
 */
async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.replace('Bearer ', '').trim();

  try {
    // Use the service client to validate the token — this doesn't touch any
    // user table, it just calls Supabase Auth and is safe with the service key.
    const { data: { user }, error } = await serviceClient.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user     = user;
    req.token    = token;
    req.supabase = createUserClient(token);   // authenticated client for this request
    next();
  } catch {
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

module.exports = authMiddleware;
