import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { wallets, userProfiles } from "@/db/schema";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [walletRows, profileRows] = await Promise.all([
      db.select({
        id: wallets.id,
        balance: wallets.balance,
        currency: wallets.currency,
        max_topup: wallets.maxTopup,
      }).from(wallets).where(eq(wallets.userId, user.id)).limit(1),
      db.select({
        first_name: userProfiles.firstName,
        wallet_id: userProfiles.walletId,
      }).from(userProfiles).where(eq(userProfiles.id, user.id)).limit(1),
    ]);

    const wallet = walletRows[0] ?? null;
    const profile = profileRows[0];

    if (!profile) {
      return NextResponse.json(
        { error: "Failed to fetch wallet" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      wallet,
      profile,
    });
  } catch (err) {
    console.error("[wallet] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch wallet" },
      { status: 500 }
    );
  }
}
