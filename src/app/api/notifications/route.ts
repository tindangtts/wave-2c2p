// Run in Supabase SQL Editor:
// create table if not exists public.notifications (
//   id uuid primary key default uuid_generate_v4(),
//   user_id uuid references public.user_profiles(id) on delete cascade not null,
//   type text not null,
//   title text not null,
//   body text not null,
//   is_read boolean not null default false,
//   deep_link text,
//   created_at timestamptz not null default now()
// );
// alter table public.notifications enable row level security;
// create policy "Users view own notifications" on public.notifications
//   for select using (auth.uid() = user_id);
// create policy "Users update own notifications" on public.notifications
//   for update using (auth.uid() = user_id);
// create index idx_notifications_user_id on public.notifications(user_id, created_at desc);

import { createClient } from "@/lib/supabase/server"
import { NextResponse, NextRequest } from "next/server"
import { isDemoMode } from "@/lib/demo"

const DEMO_NOTIFICATIONS = [
  {
    id: '1',
    user_id: 'demo',
    type: 'transfer',
    title: 'Transfer Successful',
    body: 'Your transfer of 1,000 THB to Thida has been completed.',
    is_read: false,
    deep_link: '/history',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '2',
    user_id: 'demo',
    type: 'topup',
    title: 'Wallet Topped Up',
    body: 'Your wallet has been credited with 500 THB.',
    is_read: false,
    deep_link: '/history',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    user_id: 'demo',
    type: 'referral',
    title: 'Referral Bonus Earned',
    body: 'Your friend joined! You earned 100 THB bonus.',
    is_read: true,
    deep_link: '/profile/refer-friends',
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: '4',
    user_id: 'demo',
    type: 'system',
    title: 'App Update Available',
    body: 'A new version of Wave is available. Update now for the latest features.',
    is_read: true,
    deep_link: null,
    created_at: new Date(Date.now() - 604800000).toISOString(),
  },
]

export async function GET() {
  try {
    if (isDemoMode) {
      return NextResponse.json({ notifications: DEMO_NOTIFICATIONS })
    }

    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
    }

    return NextResponse.json({ notifications: data ?? [] })
  } catch {
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json() as { id?: string; all?: boolean }

    if (isDemoMode) {
      return NextResponse.json({ success: true })
    }

    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (body.all === true) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (error) {
        return NextResponse.json({ error: "Failed to mark notifications read" }, { status: 500 })
      }
    } else if (body.id) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', body.id)
        .eq('user_id', user.id)

      if (error) {
        return NextResponse.json({ error: "Failed to mark notification read" }, { status: 500 })
      }
    } else {
      return NextResponse.json({ error: "Provide id or all:true" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 })
  }
}
