import { createClient } from "@/lib/supabase/server"
import { NextResponse, NextRequest } from "next/server"
import { db } from '@/db'
import { eq, and, desc } from 'drizzle-orm'
import { notifications } from '@/db/schema'

export async function GET() {
  try {
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

    // Alias to snake_case for UI compatibility
    const mapped = (rows ?? []).map(n => ({
      id: n.id,
      user_id: n.userId,
      type: n.type,
      title: n.title,
      body: n.body,
      is_read: n.isRead,
      deep_link: n.deepLink,
      created_at: n.createdAt,
    }))

    return NextResponse.json({ notifications: mapped })
  } catch {
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json() as { id?: string; all?: boolean }

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
