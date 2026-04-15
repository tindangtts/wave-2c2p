import { createClient } from "@/lib/supabase/server"
import { NextResponse, NextRequest } from "next/server"
import { isDemoMode } from "@/lib/demo"
import { db } from '@/db'
import { eq, and, desc } from 'drizzle-orm'
import { notifications } from '@/db/schema'

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

    const rows = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, user.id))
      .orderBy(desc(notifications.createdAt))
      .limit(50)

    return NextResponse.json({ notifications: rows ?? [] })
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
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(and(eq(notifications.userId, user.id), eq(notifications.isRead, false)))
    } else if (body.id) {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(and(eq(notifications.id, body.id), eq(notifications.userId, user.id)))
    } else {
      return NextResponse.json({ error: "Provide id or all:true" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 })
  }
}
