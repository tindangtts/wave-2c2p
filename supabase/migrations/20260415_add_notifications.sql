-- Phase 20 DATA-04: Notifications table
-- Idempotent: safe to re-run
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
