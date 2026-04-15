-- Add T&C consent fields to user_profiles (Phase 9 COMP-02)
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS tc_accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS tc_version text;
