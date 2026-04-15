import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { delivery_address, address_line, amount_satang, fee_satang } = body;

    if (!delivery_address || (delivery_address !== "current" && delivery_address !== "mailing")) {
      return NextResponse.json(
        { error: "delivery_address required" },
        { status: 400 }
      );
    }

    const shouldFail = process.env.MOCK_PAYMENT_FAIL === "true";

    if (shouldFail) {
      return NextResponse.json({
        success: false,
        error: "Card payment could not be processed. Please try again later.",
      });
    }

    // Fetch wallet and validate balance
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("id, balance")
      .eq("user_id", user.id)
      .single();

    if (walletError || !wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    const totalSatang = (amount_satang ?? 0) + (fee_satang ?? 0);

    if (totalSatang > wallet.balance) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    // Deduct balance
    const { error: balanceError } = await supabase
      .from("wallets")
      .update({ balance: wallet.balance - totalSatang })
      .eq("id", wallet.id);

    if (balanceError) {
      return NextResponse.json(
        { error: "Failed to update wallet balance" },
        { status: 500 }
      );
    }

    // Insert transaction record
    const { error: txError } = await supabase.from("transactions").insert({
      user_id: user.id,
      type: "card_payment",
      status: "success",
      amount: totalSatang,
      currency: "THB",
      description: "Visa card request",
    });

    if (txError) {
      // Rollback balance deduction on tx insert failure
      await supabase
        .from("wallets")
        .update({ balance: wallet.balance })
        .eq("id", wallet.id);
      return NextResponse.json(
        { error: "Failed to create transaction" },
        { status: 500 }
      );
    }

    const cardReference = `VISA-${Date.now()}`;

    return NextResponse.json({
      success: true,
      card_reference: cardReference,
      delivery_address: address_line ?? "",
      estimated_delivery: "5-7 business days",
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
