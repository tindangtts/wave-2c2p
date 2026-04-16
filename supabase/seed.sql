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
-- AUTH USER RESOLUTION:
--   The seed looks up auth.users by phone (+66992345678) to find the real UUID.
--   If no auth user exists yet, it creates one with a well-known ID so the
--   seed can run before first login.
--
-- HOW TO RUN:
--   Option A — Supabase SQL Editor: paste this entire file and click Run.
--   Option B — CLI: psql $DATABASE_URL -f supabase/seed.sql
--
-- IDEMPOTENT: Uses ON CONFLICT upserts — safe to re-run.
-- =============================================================================

DO $$
DECLARE
  demo_phone    CONSTANT text := '+66992345678';
  fallback_id   CONSTANT uuid := '00000000-0000-0000-0000-000000000001';
  demo_user_id  uuid;
  demo_wallet_uuid uuid;
BEGIN
  -- =========================================================================
  -- Resolve the demo auth user ID (lookup by phone, create if missing)
  -- =========================================================================
  SELECT id INTO demo_user_id
    FROM auth.users
   WHERE phone = demo_phone
   LIMIT 1;

  IF demo_user_id IS NULL THEN
    -- No auth user yet — create one with well-known ID
    INSERT INTO auth.users (
      id, instance_id, aud, role, phone,
      encrypted_password, phone_confirmed_at,
      created_at, updated_at, confirmation_token,
      email_change, email_change_token_new, recovery_token
    ) VALUES (
      fallback_id, '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated', demo_phone,
      '', now(), now(), now(), '', '', '', ''
    ) ON CONFLICT DO NOTHING;
    demo_user_id := fallback_id;
  END IF;

  RAISE NOTICE 'Seeding for user_id: %', demo_user_id;

  -- =========================================================================
  -- 1. user_profiles
  -- =========================================================================
  INSERT INTO public.user_profiles (
    id, full_name, first_name, last_name, phone, country_code, wallet_id,
    kyc_status, language, date_of_birth, registration_complete, registration_step,
    passcode_hash, passcode_attempts,
    title, gender, email, thai_first_name, thai_last_name,
    nationality, id_type, id_number, id_expiry, id_issued_country, native_country,
    laser_id, occupation, business_type, workplace,
    wallet_purpose, wallet_purpose_description,
    referrer_code, referrer_phone,
    address, province, district, subdistrict, postal_code,
    mailing_address_same, mailing_address, mailing_province,
    mailing_district, mailing_subdistrict, mailing_postal_code,
    workplace_address_same, workplace_address,
    created_at, updated_at
  ) VALUES (
    demo_user_id,
    'Lalita Tungtrakulphanich', 'Lalita', 'Tungtrakulphanich',
    demo_phone, '+66', 'WAVE-8989-9890',
    'approved', 'en', '2005-06-01', true, 6,
    'pbkdf2:7e1b8487fbed066bdd9056438a334192:c7aec0095171d9d70c1d24a5cac61efdb0a010b30fd384a0c9cf413abefac064',
    0,
    'Ms.', 'Male', 'sample@gmail.com', 'ลลิตา', 'ตั้งตระกูลพานิช',
    'Myanmar', 'passport', 'AA012345678', '2005-06-01', 'Myanmar', 'Myanmar',
    'JT0123456789', 'Private Employee', 'Company', '2C2P Thailand',
    'Bill Payment', null,
    null, null,
    '123 Sukhumvit Road', 'Bangkok', 'Watthana', 'Khlong Toei Nuea', '10110',
    true, null, null, null, null, null,
    true, null,
    '2024-06-01T10:00:00Z', '2024-12-01T10:00:00Z'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name           = EXCLUDED.full_name,
    first_name          = EXCLUDED.first_name,
    last_name           = EXCLUDED.last_name,
    wallet_id           = EXCLUDED.wallet_id,
    kyc_status          = EXCLUDED.kyc_status,
    registration_complete = EXCLUDED.registration_complete,
    registration_step   = EXCLUDED.registration_step,
    passcode_hash       = EXCLUDED.passcode_hash;

  -- =========================================================================
  -- 2. wallets
  -- =========================================================================
  -- Generate a deterministic wallet UUID from user ID
  demo_wallet_uuid := uuid_generate_v5(demo_user_id, 'wallet');

  INSERT INTO public.wallets (id, user_id, balance, currency, max_topup, created_at, updated_at)
  VALUES (
    demo_wallet_uuid, demo_user_id,
    1000000, 'THB', 2500000,
    '2024-06-01T10:00:00Z', '2024-06-01T10:00:00Z'
  )
  ON CONFLICT (id) DO UPDATE SET balance = 1000000;

  -- =========================================================================
  -- 3. recipients
  -- =========================================================================
  INSERT INTO public.recipients (id, user_id, full_name, phone, country_code, transfer_type, is_favorite, created_at, updated_at)
  VALUES
    (uuid_generate_v5(demo_user_id, 'recipient-1'), demo_user_id,
     'Min Zaw', '+959999555', '+95', 'wave_app', true,
     '2024-06-01T10:00:00Z', '2024-06-01T10:00:00Z'),
    (uuid_generate_v5(demo_user_id, 'recipient-2'), demo_user_id,
     'Sam Smith', '+959888444', '+95', 'bank_transfer', false,
     '2024-06-02T10:00:00Z', '2024-06-02T10:00:00Z'),
    (uuid_generate_v5(demo_user_id, 'recipient-3'), demo_user_id,
     'Vy Savanntepy', '+959777333', '+95', 'cash_pickup', true,
     '2024-06-03T10:00:00Z', '2024-06-03T10:00:00Z')
  ON CONFLICT (id) DO NOTHING;

  -- =========================================================================
  -- 4. transactions
  -- =========================================================================
  INSERT INTO public.transactions (
    id, user_id, type, status, amount, currency, fee, channel,
    converted_amount, converted_currency, exchange_rate,
    recipient_id, reference_number, description, created_at, updated_at
  ) VALUES
    (uuid_generate_v5(demo_user_id, 'txn-1'), demo_user_id,
     'add_money', 'success', 500000, 'THB', 0, null,
     null, null, null, null,
     'SEED-TXN-001', 'Add Money via SCB',
     '2024-06-15T10:30:00Z', '2024-06-15T10:30:00Z'),
    (uuid_generate_v5(demo_user_id, 'txn-2'), demo_user_id,
     'send_money', 'success', 120000, 'THB', 1000, 'wave_app',
     1596000, 'MMK', 133.0,
     uuid_generate_v5(demo_user_id, 'recipient-1'),
     'SEED-TXN-002', 'Send Money : Wallet Transfer',
     '2024-06-12T09:10:00Z', '2024-06-12T09:10:00Z'),
    (uuid_generate_v5(demo_user_id, 'txn-3'), demo_user_id,
     'send_money', 'rejected', 50000, 'THB', 1000, 'wave_agent',
     665000, 'MMK', 133.0,
     uuid_generate_v5(demo_user_id, 'recipient-2'),
     'SEED-TXN-003', 'Transfer to Myanmar',
     '2024-06-10T14:20:00Z', '2024-06-10T14:20:00Z'),
    (uuid_generate_v5(demo_user_id, 'txn-4'), demo_user_id,
     'withdraw', 'success', 200000, 'THB', 2500, null,
     null, null, null, null,
     'SEED-TXN-004', 'Withdrawal to Sam Smith',
     '2024-06-08T16:45:00Z', '2024-06-08T16:45:00Z'),
    (uuid_generate_v5(demo_user_id, 'txn-5'), demo_user_id,
     'add_money', 'pending', 300000, 'THB', 0, null,
     null, null, null, null,
     'SEED-TXN-005', 'Add Money via KTB',
     '2024-06-05T08:00:00Z', '2024-06-05T08:00:00Z')
  ON CONFLICT (id) DO NOTHING;

  -- =========================================================================
  -- 5. cards (virtual card)
  -- =========================================================================
  INSERT INTO public.cards (
    id, user_id, card_number_masked, expiry_month, expiry_year,
    balance, is_frozen, status, created_at
  ) VALUES (
    uuid_generate_v5(demo_user_id, 'card-1'), demo_user_id,
    '**** **** **** 8989', 12, 2027,
    250000, false, 'active', '2024-06-01T10:00:00Z'
  )
  ON CONFLICT (id) DO NOTHING;

  -- =========================================================================
  -- 6. bank_accounts
  -- =========================================================================
  INSERT INTO public.bank_accounts (id, user_id, bank_name, account_number, account_name, created_at)
  VALUES
    (uuid_generate_v5(demo_user_id, 'bank-1'), demo_user_id,
     'SCB', '123-4-56789-0', 'Lalita Tungtrakulphanich', '2024-06-01T10:00:00Z'),
    (uuid_generate_v5(demo_user_id, 'bank-2'), demo_user_id,
     'KTB', '987-6-54321-0', 'Lalita Tungtrakulphanich', '2024-06-05T10:00:00Z')
  ON CONFLICT (id) DO NOTHING;

  -- =========================================================================
  -- 7. notifications
  -- =========================================================================
  INSERT INTO public.notifications (id, user_id, type, title, body, is_read, deep_link, created_at)
  VALUES
    (uuid_generate_v5(demo_user_id, 'notif-1'), demo_user_id,
     'transfer', 'Transfer Successful',
     'Your transfer of 1,200 THB to Min Zaw has been completed.',
     false, '/history', '2024-06-12T09:11:00Z'),
    (uuid_generate_v5(demo_user_id, 'notif-2'), demo_user_id,
     'topup', 'Wallet Topped Up',
     'Your wallet has been credited with 5,000 THB.',
     false, '/history', '2024-06-15T10:31:00Z'),
    (uuid_generate_v5(demo_user_id, 'notif-3'), demo_user_id,
     'referral', 'Referral Bonus Earned',
     'Your friend joined! You earned 100 THB bonus.',
     true, '/profile/refer-friends', '2024-06-03T12:00:00Z'),
    (uuid_generate_v5(demo_user_id, 'notif-4'), demo_user_id,
     'system', 'App Update Available',
     'A new version of Wave is available. Update now for the latest features.',
     true, null, '2024-05-28T09:00:00Z')
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE 'Seed complete for user %', demo_user_id;
END $$;

-- =========================================================================
-- 8. vouchers (no user FK — global)
-- =========================================================================
INSERT INTO public.vouchers (id, code, type, amount, description, active, redeemed_by, redeemed_at, expires_at, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000071', 'WAVE2024', 'cashback', 5000,
   'Get 50 THB cashback on your next transfer', true, null, null,
   '2025-12-31T23:59:59Z', '2024-01-01T00:00:00Z'),
  ('00000000-0000-0000-0000-000000000072', 'NEWYEAR', 'cashback', 10000,
   'New Year special: 100 THB cashback', true, null, null,
   '2025-01-31T23:59:59Z', '2024-12-25T00:00:00Z'),
  ('00000000-0000-0000-0000-000000000073', 'FREETX', 'free_transfer', 0,
   'Free transfer — zero fee on your next send', true, null, null,
   null, '2024-06-01T00:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- system_config (Phase 21) — safe defaults
INSERT INTO public.system_config (key, value) VALUES
  ('maintenance_mode', 'false'),
  ('min_version', '"0.1.0"'),
  ('recommended_version', '"0.1.0"')
ON CONFLICT (key) DO NOTHING;
