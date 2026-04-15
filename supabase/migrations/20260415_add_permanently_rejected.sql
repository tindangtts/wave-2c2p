-- =============================================================================
-- Phase 21: Add permanently_rejected column to user_profiles
-- Blocks permanently rejected users from logging in.
-- Default false — no existing users are affected.
-- Idempotent: ADD COLUMN IF NOT EXISTS.
-- =============================================================================
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS permanently_rejected boolean NOT NULL DEFAULT false;
