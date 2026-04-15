import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { isDemoMode, DEMO_TRANSACTIONS } from "@/lib/demo";
import { db } from "@/db";
import { eq, desc } from "drizzle-orm";
import { transactions } from "@/db/schema";

export async function GET() {
  try {
    if (isDemoMode) {
      return NextResponse.json({ transactions: DEMO_TRANSACTIONS.slice(0, 5) });
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await db.select({
      id: transactions.id,
      type: transactions.type,
      amount: transactions.amount,
      currency: transactions.currency,
      status: transactions.status,
      description: transactions.description,
      created_at: transactions.createdAt,
    }).from(transactions)
      .where(eq(transactions.userId, user.id))
      .orderBy(desc(transactions.createdAt))
      .limit(5);

    return NextResponse.json({
      transactions: data ?? [],
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
