-- Phase 20 DATA-05: Vouchers table
-- Idempotent: safe to re-run
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

-- Vouchers are read-only for users (redemption goes through service role / API route)
create policy "Users can view active vouchers" on public.vouchers
  for select using (active = true);

create index if not exists idx_vouchers_code on public.vouchers(code);
