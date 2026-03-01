const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL         = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SUPABASE_ANON_KEY    = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing required env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY, SUPABASE_ANON_KEY'
  );
}

/**
 * Service-role client.
 * Uses the service_role JWT → PostgREST sets role = service_role → BYPASSRLS.
 * Use for:
 *   - TrueLayer callback (no user session available)
 *   - Background jobs (bill detection, token refresh)
 *   - Reading public/shared data (suppliers table in billClassifier)
 */
const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/**
 * Creates a per-request authenticated Supabase client.
 * Passes the anon key as the project API key + the user's JWT as the
 * Authorization header.  PostgREST decodes the JWT → sets role = authenticated
 * and auth.uid() = JWT sub → all RLS policies evaluate correctly.
 *
 * Use for: every route handler that is protected by authMiddleware
 * (bills, transactions, savings, banks listing, profile).
 *
 * @param {string} jwt  The raw Bearer token from the Authorization header
 */
function createUserClient(jwt) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });
}

module.exports = { serviceClient, createUserClient };
