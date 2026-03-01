-- ============================================================
-- Vpayit Database Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLES
-- ============================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id            UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT        NOT NULL,
  business_name TEXT,
  business_type TEXT,
  postcode      TEXT,
  plan          TEXT        DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'growth', 'enterprise')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Suppliers reference table
CREATE TABLE IF NOT EXISTS public.suppliers (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT         NOT NULL,
  category         TEXT         NOT NULL,
  patterns         TEXT[]       NOT NULL DEFAULT '{}',
  logo_url         TEXT,
  avg_monthly_rate NUMERIC(10,2),
  created_at       TIMESTAMPTZ  DEFAULT NOW()
);

-- Bank connections
CREATE TABLE IF NOT EXISTS public.bank_connections (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider            TEXT        NOT NULL,
  account_id          TEXT,
  access_token_enc    TEXT,
  refresh_token_enc   TEXT,
  last_synced         TIMESTAMPTZ,
  status              TEXT        DEFAULT 'active' CHECK (status IN ('active', 'expired', 'error', 'disconnected')),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  bank_connection_id  UUID        REFERENCES public.bank_connections(id) ON DELETE SET NULL,
  truelayer_txn_id    TEXT        UNIQUE,
  description         TEXT,
  amount              NUMERIC(10,2) NOT NULL,
  currency            TEXT        DEFAULT 'GBP',
  date                DATE        NOT NULL,
  category            TEXT,
  is_bill             BOOLEAN     DEFAULT false,
  bill_category       TEXT,
  supplier_id         UUID        REFERENCES public.suppliers(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Bills
CREATE TABLE IF NOT EXISTS public.bills (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  supplier_id      UUID        REFERENCES public.suppliers(id) ON DELETE SET NULL,
  category         TEXT        NOT NULL,
  current_amount   NUMERIC(10,2),
  previous_amount  NUMERIC(10,2),
  frequency        TEXT        CHECK (frequency IN ('weekly', 'monthly', 'quarterly', 'annual', 'irregular')),
  next_due_date    DATE,
  renewal_date     DATE,
  status           TEXT        DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'overdue', 'pending')),
  savings_available BOOLEAN    DEFAULT false,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Savings opportunities
CREATE TABLE IF NOT EXISTS public.savings_opportunities (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id              UUID        REFERENCES public.bills(id) ON DELETE CASCADE,
  user_id              UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  alternative_supplier TEXT,
  alternative_cost     NUMERIC(10,2),
  annual_saving        NUMERIC(10,2),
  referral_url         TEXT,
  status               TEXT        DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'applied', 'dismissed')),
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_transactions_user_id    ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date        ON public.transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_is_bill     ON public.transactions(is_bill) WHERE is_bill = true;
CREATE INDEX IF NOT EXISTS idx_transactions_supplier    ON public.transactions(supplier_id);
CREATE INDEX IF NOT EXISTS idx_bills_user_id            ON public.bills(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_next_due           ON public.bills(next_due_date);
CREATE INDEX IF NOT EXISTS idx_bills_status             ON public.bills(status);
CREATE INDEX IF NOT EXISTS idx_bank_conn_user_id        ON public.bank_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_user_id          ON public.savings_opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_annual           ON public.savings_opportunities(annual_saving DESC);

-- ============================================================
-- TRIGGERS (updated_at auto-update)
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_bank_conn_updated_at
  BEFORE UPDATE ON public.bank_connections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_bills_updated_at
  BEFORE UPDATE ON public.bills
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_savings_updated_at
  BEFORE UPDATE ON public.savings_opportunities
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.users                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_connections       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_opportunities  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers              ENABLE ROW LEVEL SECURITY;

-- Users
CREATE POLICY "users: own row select"  ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users: own row insert"  ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users: own row update"  ON public.users FOR UPDATE USING (auth.uid() = id);

-- Bank connections
CREATE POLICY "bank_conn: own select"  ON public.bank_connections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bank_conn: own insert"  ON public.bank_connections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bank_conn: own update"  ON public.bank_connections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "bank_conn: own delete"  ON public.bank_connections FOR DELETE USING (auth.uid() = user_id);

-- Transactions
CREATE POLICY "txn: own select"        ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "txn: own insert"        ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Bills
CREATE POLICY "bills: own select"      ON public.bills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bills: own insert"      ON public.bills FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bills: own update"      ON public.bills FOR UPDATE USING (auth.uid() = user_id);

-- Savings
CREATE POLICY "savings: own select"    ON public.savings_opportunities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "savings: own update"    ON public.savings_opportunities FOR UPDATE USING (auth.uid() = user_id);

-- Suppliers (public read, service role write)
CREATE POLICY "suppliers: public read" ON public.suppliers FOR SELECT USING (true);
