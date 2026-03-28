-- Quote leads table
-- Run this in your Supabase SQL editor: https://app.supabase.com → SQL Editor

create table if not exists public.quote_leads (
  id          uuid primary key default gen_random_uuid(),
  services    text,
  business_name text,
  sector      text,
  employees   text,
  postcode    text,
  monthly_spend text,
  contract_end  text,
  name        text not null,
  email       text not null,
  phone       text,
  status      text not null default 'new',  -- new | contacted | quoted | converted | lost
  notes       text,
  created_at  timestamptz not null default now()
);

-- Index for date-based queries and status filtering
create index if not exists quote_leads_created_at_idx on public.quote_leads (created_at desc);
create index if not exists quote_leads_status_idx on public.quote_leads (status);

-- RLS: only service role can read/write (backend only, never exposed to frontend users)
alter table public.quote_leads enable row level security;

create policy "Service role full access"
  on public.quote_leads
  using (true)
  with check (true);
