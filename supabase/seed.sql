-- =============================================================================
-- 2C2P Wave — Demo Seed Data
-- =============================================================================
-- Purpose: Populate a fresh Supabase project with demo data for local dev and
--          testing. All app screens should render without empty-state fallbacks
--          after running this seed.
--
-- MONETARY CONVENTION:
--   All amounts stored as bigint in smallest currency unit.
--   THB: satang (1 THB = 100 satang)  → 10,000 THB = 1,000,000 satang
--   MMK: pya    (1 MMK = 100 pya)     → 15,960 MMK = 1,596,000 pya
--
-- FK DEPENDENCY ORDER (inserts in this order to satisfy constraints):
--   1. user_profiles  ← auth.users FK anchor
--   2. wallets        ← references user_profiles
--   3. recipients     ← references user_profiles
--   4. transactions   ← references user_profiles + recipients
--   5. cards          ← references user_profiles
--   6. bank_accounts  ← references user_profiles
--   7. notifications  ← references user_profiles
--   8. vouchers       ← no user FK (unredeemed)
--
-- PREREQUISITE — Demo auth user:
--   user_profiles.id is a FK to auth.users. Before running this seed you must
--   create the demo auth user so the FK is satisfied. Run this first:
--
--     insert into auth.users (id, phone, created_at, updated_at)
--     values (
--       '00000000-0000-0000-0000-000000000001',
--       '+66992345678',
--       now(), now()
--     ) on conflict do nothing;
--
-- HOW TO RUN:
--   Option A — Supabase SQL Editor: paste this entire file and click Run.
--   Option B — CLI: supabase db push (if configured as seed.sql in config.toml)
--   Option C — psql: psql $DATABASE_URL -f supabase/seed.sql
--
-- IDEMPOTENT: All inserts use ON CONFLICT DO NOTHING — safe to re-run.
-- =============================================================================

-- =============================================================================
-- 1. user_profiles
-- =============================================================================
insert into public.user_profiles (
  id,
  full_name,
  first_name,
  last_name,
  phone,
  country_code,
  wallet_id,
  kyc_status,
  language,
  date_of_birth,
  registration_complete,
  registration_step,
  passcode_hash,
  passcode_attempts,
  created_at,
  updated_at
)
values (
  '00000000-0000-0000-0000-000000000001',
  'Lalita Tungtrakul',
  'Lalita',
  'Tungtrakul',
  '+66992345678',
  '+66',
  'WAVE-8989-9890',
  'approved',
  'en',
  '1995-03-15',
  true,
  6,
  'pbkdf2:7e1b8487fbed066bdd9056438a334192:c7aec0095171d9d70c1d24a5cac61efdb0a010b30fd384a0c9cf413abefac064',
  0,
  '2024-06-01T10:00:00Z',
  '2024-12-01T10:00:00Z'
)
on conflict do nothing;

-- =============================================================================
-- 2. wallets
-- =============================================================================
insert into public.wallets (
  id,
  user_id,
  balance,
  currency,
  max_topup,
  created_at,
  updated_at
)
values (
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000001',
  1000000,   -- 10,000.00 THB in satang
  'THB',
  2500000,   -- 25,000.00 THB max topup
  '2024-06-01T10:00:00Z',
  '2024-06-01T10:00:00Z'
)
on conflict do nothing;

-- =============================================================================
-- 3. recipients
-- =============================================================================
insert into public.recipients (
  id,
  user_id,
  full_name,
  phone,
  country_code,
  transfer_type,
  is_favorite,
  created_at,
  updated_at
)
values
  (
    '00000000-0000-0000-0000-000000000021',
    '00000000-0000-0000-0000-000000000001',
    'Min Zaw',
    '+959999555',
    '+95',
    'wave_app',
    true,
    '2024-06-01T10:00:00Z',
    '2024-06-01T10:00:00Z'
  ),
  (
    '00000000-0000-0000-0000-000000000022',
    '00000000-0000-0000-0000-000000000001',
    'Sam Smith',
    '+959888444',
    '+95',
    'bank_transfer',
    false,
    '2024-06-02T10:00:00Z',
    '2024-06-02T10:00:00Z'
  ),
  (
    '00000000-0000-0000-0000-000000000023',
    '00000000-0000-0000-0000-000000000001',
    'Vy Savanntepy',
    '+959777333',
    '+95',
    'cash_pickup',
    true,
    '2024-06-03T10:00:00Z',
    '2024-06-03T10:00:00Z'
  )
on conflict do nothing;

-- =============================================================================
-- 4. transactions
-- reference_number values are unique hard-coded strings for idempotency
-- =============================================================================
insert into public.transactions (
  id,
  user_id,
  type,
  status,
  amount,
  currency,
  fee,
  channel,
  converted_amount,
  converted_currency,
  exchange_rate,
  recipient_id,
  reference_number,
  description,
  created_at,
  updated_at
)
values
  (
    '00000000-0000-0000-0000-000000000031',
    '00000000-0000-0000-0000-000000000001',
    'add_money',
    'success',
    500000,    -- 5,000.00 THB
    'THB',
    0,
    null,
    null,
    null,
    null,
    null,
    'SEED-TXN-001',
    'Add Money via SCB',
    '2024-06-15T10:30:00Z',
    '2024-06-15T10:30:00Z'
  ),
  (
    '00000000-0000-0000-0000-000000000032',
    '00000000-0000-0000-0000-000000000001',
    'send_money',
    'success',
    120000,    -- 1,200.00 THB
    'THB',
    1000,      -- 10.00 THB fee
    'wave_app',
    1596000,   -- 15,960.00 MMK
    'MMK',
    133.0,
    '00000000-0000-0000-0000-000000000021',
    'SEED-TXN-002',
    'Send Money : Wallet Transfer',
    '2024-06-12T09:10:00Z',
    '2024-06-12T09:10:00Z'
  ),
  (
    '00000000-0000-0000-0000-000000000033',
    '00000000-0000-0000-0000-000000000001',
    'send_money',
    'rejected',
    50000,     -- 500.00 THB
    'THB',
    1000,      -- 10.00 THB fee
    'wave_agent',
    665000,    -- 6,650.00 MMK
    'MMK',
    133.0,
    '00000000-0000-0000-0000-000000000022',
    'SEED-TXN-003',
    'Transfer to Myanmar',
    '2024-06-10T14:20:00Z',
    '2024-06-10T14:20:00Z'
  ),
  (
    '00000000-0000-0000-0000-000000000034',
    '00000000-0000-0000-0000-000000000001',
    'withdraw',
    'success',
    200000,    -- 2,000.00 THB
    'THB',
    2500,      -- 25.00 THB fee
    null,
    null,
    null,
    null,
    null,
    'SEED-TXN-004',
    'Withdrawal to Sam Smith',
    '2024-06-08T16:45:00Z',
    '2024-06-08T16:45:00Z'
  ),
  (
    '00000000-0000-0000-0000-000000000035',
    '00000000-0000-0000-0000-000000000001',
    'add_money',
    'pending',
    300000,    -- 3,000.00 THB
    'THB',
    0,
    null,
    null,
    null,
    null,
    null,
    'SEED-TXN-005',
    'Add Money via KTB',
    '2024-06-05T08:00:00Z',
    '2024-06-05T08:00:00Z'
  )
on conflict do nothing;

-- =============================================================================
-- 5. cards (virtual card)
-- =============================================================================
insert into public.cards (
  id,
  user_id,
  card_number_masked,
  expiry_month,
  expiry_year,
  balance,
  is_frozen,
  status,
  created_at
)
values (
  '00000000-0000-0000-0000-000000000041',
  '00000000-0000-0000-0000-000000000001',
  '**** **** **** 8989',
  12,
  2027,
  250000,   -- 2,500.00 THB
  false,
  'active',
  '2024-06-01T10:00:00Z'
)
on conflict do nothing;

-- =============================================================================
-- 6. bank_accounts
-- =============================================================================
insert into public.bank_accounts (
  id,
  user_id,
  bank_name,
  account_number,
  account_name,
  created_at
)
values
  (
    '00000000-0000-0000-0000-000000000051',
    '00000000-0000-0000-0000-000000000001',
    'SCB',
    '123-4-56789-0',
    'Lalita Tungtrakul',
    '2024-06-01T10:00:00Z'
  ),
  (
    '00000000-0000-0000-0000-000000000052',
    '00000000-0000-0000-0000-000000000001',
    'KTB',
    '987-6-54321-0',
    'Lalita Tungtrakul',
    '2024-06-05T10:00:00Z'
  )
on conflict do nothing;

-- =============================================================================
-- 7. notifications
-- =============================================================================
insert into public.notifications (
  id,
  user_id,
  type,
  title,
  body,
  is_read,
  deep_link,
  created_at
)
values
  (
    '00000000-0000-0000-0000-000000000061',
    '00000000-0000-0000-0000-000000000001',
    'transfer',
    'Transfer Successful',
    'Your transfer of 1,200 THB to Min Zaw has been completed.',
    false,
    '/history',
    '2024-06-12T09:11:00Z'
  ),
  (
    '00000000-0000-0000-0000-000000000062',
    '00000000-0000-0000-0000-000000000001',
    'topup',
    'Wallet Topped Up',
    'Your wallet has been credited with 5,000 THB.',
    false,
    '/history',
    '2024-06-15T10:31:00Z'
  ),
  (
    '00000000-0000-0000-0000-000000000063',
    '00000000-0000-0000-0000-000000000001',
    'referral',
    'Referral Bonus Earned',
    'Your friend joined! You earned 100 THB bonus.',
    true,
    '/profile/refer-friends',
    '2024-06-03T12:00:00Z'
  ),
  (
    '00000000-0000-0000-0000-000000000064',
    '00000000-0000-0000-0000-000000000001',
    'system',
    'App Update Available',
    'A new version of Wave is available. Update now for the latest features.',
    true,
    null,
    '2024-05-28T09:00:00Z'
  )
on conflict do nothing;

-- =============================================================================
-- 8. vouchers (unredeemed — no redeemed_by / redeemed_at)
-- =============================================================================
insert into public.vouchers (
  id,
  code,
  type,
  amount,
  description,
  active,
  redeemed_by,
  redeemed_at,
  expires_at,
  created_at
)
values
  (
    '00000000-0000-0000-0000-000000000071',
    'WAVE2024',
    'cashback',
    5000,     -- 50.00 THB
    'Get 50 THB cashback on your next transfer',
    true,
    null,
    null,
    '2025-12-31T23:59:59Z',
    '2024-01-01T00:00:00Z'
  ),
  (
    '00000000-0000-0000-0000-000000000072',
    'NEWYEAR',
    'cashback',
    10000,    -- 100.00 THB
    'New Year special: 100 THB cashback',
    true,
    null,
    null,
    '2025-01-31T23:59:59Z',
    '2024-12-25T00:00:00Z'
  ),
  (
    '00000000-0000-0000-0000-000000000073',
    'FREETX',
    'free_transfer',
    0,
    'Free transfer — zero fee on your next send',
    true,
    null,
    null,
    null,
    '2024-06-01T00:00:00Z'
  )
on conflict do nothing;

-- system_config (Phase 21) — safe defaults
insert into public.system_config (key, value) values
  ('maintenance_mode', 'false'),
  ('min_version', '"0.1.0"'),
  ('recommended_version', '"0.1.0"')
on conflict (key) do nothing;
