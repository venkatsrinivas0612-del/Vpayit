const { serviceClient } = require('../config/supabase');
const truelayer = require('../services/truelayerService');
const { encrypt } = require('../services/encryptionService');
const { classifyTransaction, detectRecurringBills } = require('../services/billClassifier');
const logger = require('../utils/logger');

const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:5173';

// ── Shared helpers (db = either serviceClient or req.supabase) ───────────────

/**
 * Fetches, classifies, and upserts transactions for one bank account.
 * @param {object} db          Supabase client to use for writes
 * @param {string} connectionId
 * @param {string} userId
 * @param {string} accessToken  TrueLayer access token
 * @param {string} accountId    TrueLayer account ID
 * @param {string} from         YYYY-MM-DD
 * @param {string} to           YYYY-MM-DD
 * @returns {number} rows saved
 */
async function _syncAccountTransactions(db, connectionId, userId, accessToken, accountId, from, to) {
  const rawTxns = await truelayer.getTransactions(accessToken, accountId, from, to);
  let saved = 0;

  for (const txn of rawTxns) {
    const classification = await classifyTransaction(txn.description);

    const { error } = await db
      .from('transactions')
      .upsert({
        user_id:            userId,
        bank_connection_id: connectionId,
        truelayer_txn_id:   txn.transaction_id,
        description:        txn.description,
        amount:             txn.amount,
        currency:           txn.currency || 'GBP',
        date:               txn.timestamp.split('T')[0],
        category:           txn.transaction_category,
        is_bill:            classification.isBill,
        bill_category:      classification.billCategory,
        supplier_id:        classification.supplier?.id ?? null,
      }, { onConflict: 'truelayer_txn_id', ignoreDuplicates: true });

    if (!error) saved++;
  }

  return saved;
}

/**
 * Runs recurring-bill detection over all bill-tagged transactions for a user
 * and upserts the results into the bills table.
 * @param {object} db     Supabase client to use for reads and writes
 * @param {string} userId
 * @returns {number} bills created or updated
 */
async function _detectBillsForUser(db, userId) {
  const { data: billTxns, error } = await db
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_bill', true)
    .order('date', { ascending: true });

  if (error || !billTxns || billTxns.length === 0) return 0;

  const recurring = detectRecurringBills(billTxns);
  let upserted = 0;

  for (const bill of recurring) {
    let existingId = null;

    if (bill.supplierId) {
      const { data: existing } = await db
        .from('bills')
        .select('id')
        .eq('user_id', userId)
        .eq('supplier_id', bill.supplierId)
        .eq('status', 'active')
        .maybeSingle();
      existingId = existing?.id ?? null;
    } else {
      const { data: existing } = await db
        .from('bills')
        .select('id')
        .eq('user_id', userId)
        .eq('category', bill.category)
        .is('supplier_id', null)
        .eq('status', 'active')
        .maybeSingle();
      existingId = existing?.id ?? null;
    }

    if (existingId) {
      await db
        .from('bills')
        .update({
          current_amount:  bill.currentAmount,
          previous_amount: bill.previousAmount,
          next_due_date:   bill.nextDueDate,
          frequency:       bill.frequency,
        })
        .eq('id', existingId);
      upserted++;
      continue;
    }

    const { error: insertErr } = await db
      .from('bills')
      .insert({
        user_id:         userId,
        supplier_id:     bill.supplierId,
        category:        bill.category,
        current_amount:  bill.currentAmount,
        previous_amount: bill.previousAmount,
        frequency:       bill.frequency,
        next_due_date:   bill.nextDueDate,
        status:          'active',
      });

    if (!insertErr) upserted++;
  }

  return upserted;
}

// ── Route handlers ────────────────────────────────────────────────────────────

const getAuthUrl = async (req, res, next) => {
  try {
    const url = truelayer.getAuthUrl(req.user.id);
    res.json({ url });
  } catch (err) { next(err); }
};

/**
 * GET /banks/callback  — public, no auth middleware
 * Called by TrueLayer's browser redirect: ?code=XXX&state=USER_ID
 *
 * Uses serviceClient throughout because there is no user JWT available here.
 * The service_role key bypasses RLS, so it can write to any table on behalf
 * of the user identified by the `state` parameter.
 */
const handleCallback = async (req, res) => {
  const { code, state: userId, error: oauthError } = req.query;

  if (oauthError) {
    logger.warn('TrueLayer OAuth error', { oauthError });
    return res.redirect(`${FRONTEND}/settings?bank_error=${encodeURIComponent(oauthError)}`);
  }

  if (!code || !userId) {
    return res.redirect(`${FRONTEND}/settings?bank_error=missing_params`);
  }

  try {
    // 1. Exchange code → tokens
    const tokens = await truelayer.exchangeCodeForTokens(code);

    // 2. Get all accounts
    const accounts = await truelayer.getAccounts(tokens.access_token);
    if (!accounts || accounts.length === 0) {
      return res.redirect(`${FRONTEND}/settings?bank_error=no_accounts`);
    }

    // 3. Upsert each account as a bank_connection row
    const connections = [];

    for (const account of accounts) {
      const { data: existing } = await serviceClient
        .from('bank_connections')
        .select('id')
        .eq('user_id', userId)
        .eq('account_id', account.account_id)
        .maybeSingle();

      let conn;
      if (existing) {
        const { data } = await serviceClient
          .from('bank_connections')
          .update({
            access_token_enc:  encrypt(tokens.access_token),
            refresh_token_enc: encrypt(tokens.refresh_token),
            status:            'active',
          })
          .eq('id', existing.id)
          .select()
          .single();
        conn = data;
      } else {
        const { data } = await serviceClient
          .from('bank_connections')
          .insert({
            user_id:           userId,
            provider:          account.provider?.display_name || 'Unknown Bank',
            account_id:        account.account_id,
            access_token_enc:  encrypt(tokens.access_token),
            refresh_token_enc: encrypt(tokens.refresh_token),
            status:            'active',
          })
          .select()
          .single();
        conn = data;
      }

      if (conn) connections.push({ conn, accountId: account.account_id });
    }

    // 4 & 5. Fetch + classify + store transactions (last 6 months)
    const to   = new Date().toISOString().split('T')[0];
    const from = (() => {
      const d = new Date();
      d.setMonth(d.getMonth() - 6);
      return d.toISOString().split('T')[0];
    })();

    for (const { conn, accountId } of connections) {
      try {
        await _syncAccountTransactions(
          serviceClient, conn.id, userId, tokens.access_token, accountId, from, to
        );
        await serviceClient
          .from('bank_connections')
          .update({ last_synced: new Date().toISOString() })
          .eq('id', conn.id);
      } catch (syncErr) {
        logger.error('Transaction sync failed', { accountId, message: syncErr.message });
      }
    }

    // 6. Run bill detection
    await _detectBillsForUser(serviceClient, userId);

    // 7. Redirect to dashboard
    res.redirect(`${FRONTEND}/dashboard?connected=1`);

  } catch (err) {
    logger.error('Bank callback error', { message: err.message });
    res.redirect(`${FRONTEND}/settings?bank_error=connection_failed`);
  }
};

const getConnections = async (req, res, next) => {
  try {
    const { data, error } = await req.supabase
      .from('bank_connections')
      .select('id, provider, account_id, last_synced, status, created_at')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ data });
  } catch (err) { next(err); }
};

const deleteConnection = async (req, res, next) => {
  try {
    const { error } = await req.supabase
      .from('bank_connections')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.status(204).send();
  } catch (err) { next(err); }
};

const syncTransactions = async (req, res, next) => {
  try {
    const { id: connectionId } = req.params;

    // Use req.supabase — RLS ensures the user can only sync their own connection
    const { data: conn, error: connErr } = await req.supabase
      .from('bank_connections')
      .select('*')
      .eq('id', connectionId)
      .eq('user_id', req.user.id)
      .single();

    if (connErr || !conn) return res.status(404).json({ error: 'Bank connection not found' });

    // Token refresh hits TrueLayer + updates DB — use serviceClient so the
    // encrypted token update isn't blocked by an RLS policy on access_token_enc
    const accessToken = await truelayer.getValidAccessToken(conn);

    const to   = new Date().toISOString().split('T')[0];
    const from = (() => {
      const d = new Date();
      d.setDate(d.getDate() - 90);
      return d.toISOString().split('T')[0];
    })();

    // Writes go through req.supabase so RLS is enforced consistently
    const saved = await _syncAccountTransactions(
      req.supabase, connectionId, req.user.id, accessToken, conn.account_id, from, to
    );

    await req.supabase
      .from('bank_connections')
      .update({ last_synced: new Date().toISOString() })
      .eq('id', connectionId);

    await _detectBillsForUser(req.supabase, req.user.id);

    res.json({ data: { saved, syncedAt: new Date().toISOString() } });
  } catch (err) { next(err); }
};

module.exports = { getAuthUrl, handleCallback, getConnections, deleteConnection, syncTransactions };
