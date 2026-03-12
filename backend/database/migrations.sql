-- Sprint 7.1 migrations
-- Run once in the Supabase SQL editor

-- Add Stripe customer ID to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS stripe_customer_id text;

-- Ensure plan column exists with a default of 'free'
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free';
