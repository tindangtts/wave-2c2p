import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { isDemoMode, DEMO_WALLET, DEMO_PROFILE } from "@/lib/demo";

export async function GET() {
  try {
    if (isDemoMode) {
      return NextResponse.json({
        wallet: {
          id: DEMO_WALLET.id,
          balance: DEMO_WALLET.balance,
          currency: DEMO_WALLET.currency,
          max_topup: 2500000,
        },
        profile: {
          first_name: DEMO_PROFILE.full_name.split(' ')[0],
          wallet_id: DEMO_WALLET.wallet_id,
        },
      });
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [walletResult, profileResult] = await Promise.all([
      supabase
        .from("wallets")
        .select("id, balance, currency, max_topup")
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("user_profiles")
        .select("first_name, wallet_id")
        .eq("id", user.id)
        .single(),
    ]);

    if (profileResult.error) {
      return NextResponse.json(
        { error: "Failed to fetch wallet" },
        { status: 500 }
      );
    }

    // Missing wallet row is not an error — return null wallet for zero state
    const wallet = walletResult.error ? null : walletResult.data;

    return NextResponse.json({
      wallet,
      profile: profileResult.data,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch wallet" },
      { status: 500 }
    );
  }
}
