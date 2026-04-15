-- 2C2P Wave Database Schema
-- Run this in Supabase SQL Editor

-- MONETARY CONVENTION (D-07):
-- All monetary amounts are stored as bigint in smallest currency unit:
--   THB: satang (1 THB = 100 satang)
--   MMK: pya (1 MMK = 100 pya)
-- Exchange rates remain as numeric(10,4) — they are ratios, not currency amounts.
-- Use src/lib/currency.ts for display formatting.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table public.user_profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  phone text not null unique,
  country_code text not null default '+66',
  wallet_id text not null unique default ('W' || substr(md5(random()::text), 1, 16)),
  kyc_status text not null default 'not_started' check (kyc_status in ('not_started', 'pending', 'approved', 'rejected', 'expired')),
  language text not null default 'en' check (language in ('en', 'th', 'mm')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Wallets
create table public.wallets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.user_profiles(id) on delete cascade not null unique,
  balance bigint not null default 0 check (balance >= 0),
  currency text not null default 'THB',
  max_topup bigint not null default 2500000,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- KYC Documents
create table public.kyc_documents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  document_type text not null check (document_type in ('id_card', 'passport', 'work_permit', 'pink_card', 'owic', 'visa')),
  front_image_url text,
  back_image_url text,
  selfie_image_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'expired')),
  rejection_reason text,
  extracted_data jsonb,
  verified_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- Recipients
create table public.recipients (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  full_name text not null,
  phone text not null,
  country_code text not null default '+95',
  nrc text,
  occupation text,
  transfer_purpose text,
  relationship text,
  address text,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Transactions
create table public.transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  type text not null check (type in ('add_money', 'send_money', 'withdraw', 'receive', 'bill_payment')),
  amount bigint not null,
  currency text not null default 'THB',
  converted_amount bigint,
  converted_currency text,
  exchange_rate numeric(10, 4),
  fee bigint default 0,
  status text not null default 'pending' check (status in ('pending', 'processing', 'success', 'rejected', 'failed')),
  recipient_id uuid references public.recipients(id),
  channel text check (channel in ('wave_agent', 'wave_app', 'bank_transfer', 'cash_pickup')),
  reference_number text not null unique default ('TXN-' || substr(md5(random()::text), 1, 12)),
  description text not null,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Virtual Cards
create table public.cards (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  card_number_masked text not null,
  card_number_encrypted text,
  cvv_encrypted text,
  expiry_month int not null,
  expiry_year int not null,
  balance bigint not null default 0,
  is_frozen boolean not null default false,
  status text not null default 'active' check (status in ('active', 'inactive', 'ordered', 'delivered')),
  created_at timestamptz not null default now()
);

-- Referrals
create table public.referrals (
  id uuid primary key default uuid_generate_v4(),
  referrer_id uuid references public.user_profiles(id) on delete cascade not null,
  referee_id uuid references public.user_profiles(id),
  code text not null unique,
  status text not null default 'pending' check (status in ('pending', 'completed')),
  reward_amount bigint,
  created_at timestamptz not null default now()
);

-- Row Level Security Policies
alter table public.user_profiles enable row level security;
alter table public.wallets enable row level security;
alter table public.kyc_documents enable row level security;
alter table public.recipients enable row level security;
alter table public.transactions enable row level security;
alter table public.cards enable row level security;
alter table public.referrals enable row level security;

-- Users can only read/update their own profile
create policy "Users can view own profile" on public.user_profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.user_profiles
  for update using (auth.uid() = id);

-- Users can insert own profile (needed for registration)
create policy "Users can insert own profile" on public.user_profiles
  for insert with check (auth.uid() = id);

-- Wallet: users see only their own
create policy "Users can view own wallet" on public.wallets
  for select using (auth.uid() = user_id);

-- Server-side wallet balance updates (service role bypasses RLS by default,
-- but explicit policy is safer for edge cases)
create policy "Users can update own wallet" on public.wallets
  for update using (auth.uid() = user_id);

-- KYC: users see only their own
create policy "Users can view own KYC" on public.kyc_documents
  for select using (auth.uid() = user_id);
create policy "Users can insert own KYC" on public.kyc_documents
  for insert with check (auth.uid() = user_id);

-- Recipients: users manage their own
create policy "Users can manage own recipients" on public.recipients
  for all using (auth.uid() = user_id);

-- Transactions: users see their own
create policy "Users can view own transactions" on public.transactions
  for select using (auth.uid() = user_id);
create policy "Users can insert own transactions" on public.transactions
  for insert with check (auth.uid() = user_id);

-- Cards: users see their own
create policy "Users can view own cards" on public.cards
  for select using (auth.uid() = user_id);

-- Referrals: users see their own
create policy "Users can view own referrals" on public.referrals
  for select using (auth.uid() = referrer_id);
create policy "Users can create referrals" on public.referrals
  for insert with check (auth.uid() = referrer_id);

-- Indexes for performance
create index idx_transactions_user_id on public.transactions(user_id);
create index idx_transactions_created_at on public.transactions(created_at desc);
create index idx_recipients_user_id on public.recipients(user_id);
create index idx_kyc_user_id on public.kyc_documents(user_id);

-- =============================================================================
-- Phase 02 Authentication Migration
-- Add auth-related columns to user_profiles
-- All columns use ADD COLUMN IF NOT EXISTS for idempotency
-- References: D-03, D-04, D-09, D-10 in 02-CONTEXT.md
-- =============================================================================
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS date_of_birth text,
  ADD COLUMN IF NOT EXISTS nationality text,
  ADD COLUMN IF NOT EXISTS id_type text,
  ADD COLUMN IF NOT EXISTS id_number text,
  ADD COLUMN IF NOT EXISTS id_expiry text,
  ADD COLUMN IF NOT EXISTS passcode_hash text,
  ADD COLUMN IF NOT EXISTS registration_complete boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS registration_step integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS passcode_attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS passcode_locked_at timestamptz;

-- Note: full_name column is retained for backward compatibility

-- =============================================================================
-- Phase 11 Wallet Operations Migration
-- Bank Accounts table for recurring withdrawals
-- Note: bank_account_id for withdrawals is stored in metadata JSONB as metadata->>'bank_account_id'
-- This avoids a migration on transactions; the pending-withdrawal guard queries metadata
-- =============================================================================
create table public.bank_accounts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  bank_name text not null,
  account_number text not null,
  account_name text not null,
  created_at timestamptz not null default now()
);

alter table public.bank_accounts enable row level security;

create policy "Users can view own bank accounts" on public.bank_accounts
  for select using (auth.uid() = user_id);

create policy "Users can insert own bank accounts" on public.bank_accounts
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own bank accounts" on public.bank_accounts
  for delete using (auth.uid() = user_id);

-- =============================================================================
-- Phase 15 WebAuthn Migration
-- Add WebAuthn credential columns to user_profiles
-- Referenced by: api/auth/webauthn/register/, authenticate/
-- All columns nullable — no existing rows affected
-- Idempotent: safe to re-run via ADD COLUMN IF NOT EXISTS
-- =============================================================================
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS webauthn_credential_id text,
  ADD COLUMN IF NOT EXISTS webauthn_public_key text,
  ADD COLUMN IF NOT EXISTS webauthn_counter bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS webauthn_challenge text;

-- =============================================================================
-- Phase 17: Spending Limits columns
-- =============================================================================
-- Run in Supabase SQL Editor after deploying Phase 17.
-- Adds personal daily/monthly spending limit columns to user_profiles.
-- Defaults match SPENDING_TIERS.premium (highest limit tier).
-- Idempotent: safe to re-run via ADD COLUMN IF NOT EXISTS
-- =============================================================================
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS daily_limit_satang bigint DEFAULT 5000000,
  ADD COLUMN IF NOT EXISTS monthly_limit_satang bigint DEFAULT 20000000;

-- =============================================================================
-- Phase 20: New Tables — Notifications
-- =============================================================================
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  type text not null,
  title text not null,
  body text not null,
  is_read boolean not null default false,
  deep_link text,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "Users view own notifications" on public.notifications
  for select using (auth.uid() = user_id);

create policy "Users update own notifications" on public.notifications
  for update using (auth.uid() = user_id);

create index if not exists idx_notifications_user_id
  on public.notifications(user_id, created_at desc);

-- =============================================================================
-- Phase 20: New Tables — Vouchers
-- =============================================================================
create table if not exists public.vouchers (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  type text not null check (type in ('cashback', 'free_transfer')),
  amount bigint not null default 0,
  description text not null default '',
  active boolean not null default true,
  redeemed_by uuid references public.user_profiles(id),
  redeemed_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.vouchers enable row level security;

create policy "Users can view active vouchers" on public.vouchers
  for select using (active = true);

create index if not exists idx_vouchers_code on public.vouchers(code);
