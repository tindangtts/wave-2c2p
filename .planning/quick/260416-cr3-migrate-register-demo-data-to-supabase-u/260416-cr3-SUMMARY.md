---
phase: quick
plan: 260416-cr3
subsystem: database/schema
tags: [schema, migration, seed, registration, drizzle]
dependency_graph:
  requires: []
  provides: [user_profiles.register_flow_columns, seed.lalita_full_data]
  affects: [src/db/schema.ts, supabase/seed.sql, supabase/migrations]
tech_stack:
  added: []
  patterns: [ADD COLUMN IF NOT EXISTS (idempotent migration), nullable columns for backfill safety]
key_files:
  created: []
  modified:
    - supabase/migrations/20260414_init_schema.sql
    - src/db/schema.ts
    - supabase/seed.sql
decisions:
  - All 28 new columns are nullable — no DEFAULT NOT NULL to avoid breaking existing rows
  - Boolean defaults (mailing_address_same, workplace_address_same) set to true in both SQL and Drizzle
  - Seed uses 48-column INSERT with ON CONFLICT DO NOTHING for idempotency
metrics:
  duration: ~4min
  completed: "2026-04-16T02:16:12Z"
  tasks_completed: 2
  files_modified: 3
---

# Phase quick Plan 260416-cr3: Migrate Register Demo Data to Supabase Summary

**One-liner:** 28 Pencil-design registration fields added to user_profiles via idempotent SQL migration and Drizzle schema, with full demo seed data for Lalita Tungtrakulphanich.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add 28 registration columns to SQL migration and Drizzle schema | afc65d5 | supabase/migrations/20260414_init_schema.sql, src/db/schema.ts |
| 2 | Update demo seed data to match Pencil design | 075ca60 | supabase/seed.sql |

## What Was Built

### Task 1 — SQL Migration + Drizzle Schema

Added an ALTER TABLE block to `supabase/migrations/20260414_init_schema.sql` with 28 new `ADD COLUMN IF NOT EXISTS` statements for the Pencil design register flow fields:

- Personal: `title`, `gender`, `email`
- Thai names: `thai_first_name`, `thai_last_name`
- Identity: `id_issued_country`, `native_country`, `laser_id`
- Employment: `occupation`, `business_type`, `workplace`
- Wallet: `wallet_purpose`, `wallet_purpose_description`
- Referrer: `referrer_code`, `referrer_phone`
- Home address: `address`, `province`, `district`, `subdistrict`, `postal_code`
- Mailing address: `mailing_address_same` (bool, default true), `mailing_address`, `mailing_province`, `mailing_district`, `mailing_subdistrict`, `mailing_postal_code`
- Workplace address: `workplace_address_same` (bool, default true), `workplace_address`

Matching Drizzle columns added to `userProfiles` in `src/db/schema.ts` under a `// Register flow fields (Pencil design)` comment block. All columns are nullable with no `.notNull()`.

### Task 2 — Seed Data

Updated the `user_profiles` INSERT in `supabase/seed.sql`:

- Full name updated to `Lalita Tungtrakulphanich` (correct Pencil design surname)
- Date of birth updated to `2005-06-01` (01/06/2005 as shown in Pencil screens)
- All 28 new columns included with Pencil-matching values:
  - Myanmar passport holder: `id_type=passport`, `id_number=AA012345678`, `nationality=Myanmar`
  - Thai name: `ลลิตา / ตั้งตระกูลพานิช`
  - Laser ID: `JT0123456789`
  - Occupation: `Private Employee` at `2C2P Thailand`
  - Bangkok home address: 123 Sukhumvit Road, Watthana, Khlong Toei Nuea, 10110
  - Mailing/workplace address same flags: `true`
- 48 columns / 48 values — balanced, verified with Python count check
- `bank_accounts` account_name updated to `Lalita Tungtrakulphanich` (2 rows)

## Verification

- SQL migration: 50 total `ADD COLUMN IF NOT EXISTS` statements (22 pre-existing + 28 new)
- Drizzle schema: 10 grep matches for register flow column names across schema.ts
- Seed column/value balance: 48/48 confirmed by Python script
- TypeScript errors found were all pre-existing in `bank-accounts/__tests__/route.test.ts` — out of scope

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all new columns have real values in seed data.

## Self-Check: PASSED

- `supabase/migrations/20260414_init_schema.sql` — FOUND (afc65d5)
- `src/db/schema.ts` — FOUND (afc65d5)
- `supabase/seed.sql` — FOUND (075ca60)
- Commits afc65d5 and 075ca60 verified in git log
