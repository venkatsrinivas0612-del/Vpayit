-- Performance indexes for Vpayit
-- Run once in the Supabase SQL editor (safe to re-run — uses IF NOT EXISTS)

CREATE INDEX IF NOT EXISTS idx_transactions_user_date
  ON transactions(user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_user_bill
  ON transactions(user_id, is_bill);

CREATE INDEX IF NOT EXISTS idx_bills_user_status
  ON bills(user_id, status);

CREATE INDEX IF NOT EXISTS idx_bills_user_next_due
  ON bills(user_id, next_due_date);

CREATE INDEX IF NOT EXISTS idx_savings_user_status
  ON savings_opportunities(user_id, status);

CREATE INDEX IF NOT EXISTS idx_bank_connections_user
  ON bank_connections(user_id, status);
