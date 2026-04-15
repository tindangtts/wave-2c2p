import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function generateReference(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `TXN-${timestamp}-${random}`;
}

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

    const shouldFail = process.env.MOCK_PAYMENT_FAIL === "true";
    if (shouldFail) {
      return NextResponse.json({
        success: false,
        status: "failed",
        error: "Transfer could not be processed. Please try again later.",
        reference_number: null,
      });
    }

    const body = await request.json();
    const { receiver_wallet_id, amount } = body as {
      receiver_wallet_id: string;
      amount: number;
    };

    if (!receiver_wallet_id || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Fetch sender wallet
    const { data: senderWallet, error: senderWalletError } = await supabase
      .from("wallets")
      .select("id, balance, user_id")
      .eq("user_id", user.id)
      .single();

    if (senderWalletError || !senderWallet) {
      return NextResponse.json(
        { error: "Sender wallet not found" },
        { status: 404 }
      );
    }

    // Fetch receiver wallet
    const { data: receiverWallet, error: receiverWalletError } = await supabase
      .from("wallets")
      .select("id, balance, user_id")
      .eq("id", receiver_wallet_id)
      .single();

    if (receiverWalletError || !receiverWallet) {
      return NextResponse.json(
        { error: "Receiver wallet not found" },
        { status: 404 }
      );
    }

    // Validate sender !== receiver
    if (senderWallet.user_id === receiverWallet.user_id) {
      return NextResponse.json(
        { error: "Cannot transfer to your own wallet" },
        { status: 400 }
      );
    }

    // P2P fee is 0 (wallet-to-wallet, instant)
    const fee = 0;
    const totalDeducted = amount + fee;

    if (totalDeducted > senderWallet.balance) {
      return NextResponse.json(
        { error: "Insufficient wallet balance" },
        { status: 400 }
      );
    }

    const referenceNumber = generateReference();

    // Deduct sender balance
    const { error: senderBalanceError } = await supabase
      .from("wallets")
      .update({ balance: senderWallet.balance - totalDeducted })
      .eq("id", senderWallet.id);

    if (senderBalanceError) {
      return NextResponse.json(
        { error: "Failed to update sender wallet balance" },
        { status: 500 }
      );
    }

    // Add to receiver balance
    const { error: receiverBalanceError } = await supabase
      .from("wallets")
      .update({ balance: receiverWallet.balance + amount })
      .eq("id", receiverWallet.id);

    if (receiverBalanceError) {
      // Rollback sender deduction
      await supabase
        .from("wallets")
        .update({ balance: senderWallet.balance })
        .eq("id", senderWallet.id);
      return NextResponse.json(
        { error: "Failed to update receiver wallet balance" },
        { status: 500 }
      );
    }

    // Insert pending transaction
    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        type: "transfer",
        status: "pending",
        amount: totalDeducted,
        currency: "THB",
        reference_number: referenceNumber,
        description: `P2P transfer to wallet ${receiver_wallet_id}`,
      })
      .select("id")
      .single();

    if (txError || !transaction) {
      // Rollback both balance changes
      await supabase
        .from("wallets")
        .update({ balance: senderWallet.balance })
        .eq("id", senderWallet.id);
      await supabase
        .from("wallets")
        .update({ balance: receiverWallet.balance })
        .eq("id", receiverWallet.id);
      return NextResponse.json(
        { error: "Failed to create transaction" },
        { status: 500 }
      );
    }

    // Auto-complete after 2s (mock behavior)
    setTimeout(async () => {
      try {
        const { createClient: createBgClient } = await import(
          "@/lib/supabase/server"
        );
        const bgSupabase = await createBgClient();
        await bgSupabase
          .from("transactions")
          .update({ status: "success", updated_at: new Date().toISOString() })
          .eq("id", transaction.id);
      } catch {
        // Background update failure — not critical
      }
    }, 2000);

    return NextResponse.json({
      success: true,
      status: "pending",
      transfer: {
        id: transaction.id,
        reference_number: referenceNumber,
        amount,
        fee,
        channel: "p2p",
        created_at: new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
