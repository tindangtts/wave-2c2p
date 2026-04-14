-- 2C2P Wave Database Schema
-- Run this in Supabase SQL Editor

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
  balance numeric(12, 2) not null default 0.00 check (balance >= 0),
  currency text not null default 'THB',
  max_topup numeric(12, 2) not null default 25000.00,
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
  amount numeric(12, 2) not null,
  currency text not null default 'THB',
  converted_amount numeric(12, 2),
  converted_currency text,
  exchange_rate numeric(10, 4),
  fee numeric(8, 2) default 0.00,
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
  balance numeric(12, 2) not null default 0.00,
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
  reward_amount numeric(8, 2),
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

-- Wallet: users see only their own
create policy "Users can view own wallet" on public.wallets
  for select using (auth.uid() = user_id);

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
