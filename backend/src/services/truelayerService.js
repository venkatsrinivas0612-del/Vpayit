const axios = require('axios');
const { encrypt, decrypt } = require('./encryptionService');
const { serviceClient } = require('../config/supabase');

const AUTH_BASE = process.env.TRUELAYER_AUTH_BASE || 'https://auth.truelayer-sandbox.com';
const API_BASE  = process.env.TRUELAYER_API_BASE  || 'https://api.truelayer-sandbox.com';

/**
 * Builds the TrueLayer OAuth2 authorisation URL.
 */
function getAuthUrl(userId) {
  const url = AUTH_BASE + '/' +
    '?response_type=code' +
    '&client_id=' + process.env.TRUELAYER_CLIENT_ID +
    '&scope=info%20accounts%20balance%20cards%20transactions%20direct_debits%20standing_orders%20offline_access' +
    '&redirect_uri=' + encodeURIComponent(process.env.TRUELAYER_REDIRECT_URI) +
    '&providers=uk-cs-mock%20uk-ob-all%20uk-oauth-all' +
    '&state=' + userId;
  return url;
}

/**
 * Exchanges the authorisation code for access + refresh tokens.
 */
async function exchangeCodeForTokens(code) {
  const params = new URLSearchParams({
    grant_type:    'authorization_code',
    client_id:     process.env.TRUELAYER_CLIENT_ID,
    client_secret: process.env.TRUELAYER_CLIENT_SECRET,
    redirect_uri:  process.env.TRUELAYER_REDIRECT_URI,
    code,
  });

  const { data } = await axios.post(
    `${AUTH_BASE}/connect/token`,
    params.toString(),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  return {
    access_token:  data.access_token,
    refresh_token: data.refresh_token,
    expires_in:    data.expires_in,
  };
}

/**
 * Refreshes an expired access token.
 */
async function refreshToken(encryptedRefreshToken) {
  const rt = decrypt(encryptedRefreshToken);

  const params = new URLSearchParams({
    grant_type:    'refresh_token',
    client_id:     process.env.TRUELAYER_CLIENT_ID,
    client_secret: process.env.TRUELAYER_CLIENT_SECRET,
    refresh_token: rt,
  });

  const { data } = await axios.post(
    `${AUTH_BASE}/connect/token`,
    params.toString(),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  return {
    access_token:  data.access_token,
    refresh_token: data.refresh_token,
  };
}

/**
 * Fetches all accounts for the connected bank.
 */
async function getAccounts(accessToken) {
  const { data } = await axios.get(
    `${API_BASE}/data/v1/accounts`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return data.results;
}

/**
 * Fetches transactions for a specific account.
 */
async function getTransactions(accessToken, accountId, from, to) {
  const params = new URLSearchParams({ from, to });
  const { data } = await axios.get(
    `${API_BASE}/data/v1/accounts/${accountId}/transactions?${params.toString()}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return data.results;
}

/**
 * Returns a valid (possibly refreshed) access token for a bank connection record.
 * Updates the database if a refresh was required.
 */
async function getValidAccessToken(connection) {
  const accessToken = decrypt(connection.access_token_enc);

  try {
    // Quick probe to test token validity
    await axios.get(`${API_BASE}/data/v1/accounts`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return accessToken;
  } catch (err) {
    if (err.response?.status !== 401) throw err;

    // Token expired - refresh
    const newTokens = await refreshToken(connection.refresh_token_enc);

    await serviceClient
      .from('bank_connections')
      .update({
        access_token_enc:  encrypt(newTokens.access_token),
        refresh_token_enc: encrypt(newTokens.refresh_token),
      })
      .eq('id', connection.id);

    return newTokens.access_token;
  }
}

module.exports = {
  getAuthUrl,
  exchangeCodeForTokens,
  refreshToken,
  getAccounts,
  getTransactions,
  getValidAccessToken,
};