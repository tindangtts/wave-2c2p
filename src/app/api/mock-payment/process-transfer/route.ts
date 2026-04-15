import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo";
import type { TransferChannel } from "@/types";

// Duplicate transfer guard (TXN-11): same recipient+amount within 60s
const recentTransfers = new Map<string, number>();
const DEDUP_WINDOW_MS = 60_000;

function checkDuplicateTransfer(userId: string, recipientId: string, amount: number): boolean {
  const key = `${userId}:${recipientId}:${amount}`;
  const lastTime = recentTransfers.get(key);
  const now = Date.now();
  if (lastTime && now - lastTime < DEDUP_WINDOW_MS) {
    return true; // duplicate
  }
  return false;
}

function recordTransfer(userId: string, recipientId: string, amount: number) {
  const key = `${userId}:${recipientId}:${amount}`;
  recentTransfers.set(key, Date.now());
  // Cleanup old entries
  for (const [k, v] of recentTransfers) {
    if (Date.now() - v > DEDUP_WINDOW_MS) recentTransfers.delete(k);
  }
}

const channelFees: Record<TransferChannel, number> = {
  wave_agent: 1000,    // 10.00 THB in satang
  wave_app: 1000,      // 10.00 THB in satang
  bank_transfer: 5000, // 50.00 THB in satang (D-14)
  cash_pickup: 3000,   // 30.00 THB in satang (D-14)
  p2p: 0,              // 0 THB for P2P wallet-to-wallet
};

function generateReference(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `TXN-${timestamp}-${random}`;
}

export async function POST(request: Request) {
  try {
    if (isDemoMode) {
      const body = await request.json();
      const { amount, currency = "THB", channel, recipient_id, force_confirm } = body;

      // Duplicate transfer guard (TXN-11)
      if (!force_confirm && checkDuplicateTransfer("demo", recipient_id ?? "unknown", amount)) {
        return NextResponse.json(
          { error: "duplicate_transfer", message: "A similar transfer was made less than 60 seconds ago. Please confirm to proceed." },
          { status: 409 }
        );
      }

      const exchangeRate = parseFloat(process.env.MOCK_EXCHANGE_RATE ?? "133.0");
      const fee = channelFees[channel as TransferChannel] ?? 1000;
      const referenceNumber = generateReference();
      recordTransfer("demo", recipient_id ?? "unknown", amount);
      return NextResponse.json({
        success: true,
        status: "pending",
        transfer: {
          id: "demo-tx-transfer",
          reference_number: referenceNumber,
          amount,
          currency,
          fee,
          total_deducted: amount + fee,
          converted_amount: Math.round(amount * exchangeRate),
          converted_currency: "MMK",
          exchange_rate: exchangeRate,
          channel,
          recipient_id: body.recipient_id,
          estimated_arrival: "Within 30 minutes",
          created_at: new Date().toISOString(),
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

    const body = await request.json();
    const { amount, currency = "THB", recipient_id, channel, note, force_confirm } = body;

    // Duplicate transfer guard (TXN-11)
    if (!force_confirm && checkDuplicateTransfer(user.id, recipient_id ?? "unknown", amount)) {
      return NextResponse.json(
        { error: "duplicate_transfer", message: "A similar transfer was made less than 60 seconds ago. Please confirm to proceed." },
        { status: 409 }
      );
    }

    const shouldFail = process.env.MOCK_PAYMENT_FAIL === "true";
    const exchangeRate = parseFloat(
      process.env.MOCK_EXCHANGE_RATE ?? "133.0"
    );

    if (shouldFail) {
      return NextResponse.json({
        success: false,
        status: "failed",
        error: "Transfer could not be processed. Please try again later.",
        reference_number: null,
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

    const fee = channelFees[channel as TransferChannel] ?? 1000;
    const totalDeducted = amount + fee;

    if (totalDeducted > wallet.balance) {
      return NextResponse.json(
        { error: "Insufficient wallet balance" },
        { status: 400 }
      );
    }

    const referenceNumber = generateReference();
    const convertedAmount = Math.round(amount * exchangeRate);

    // Deduct balance immediately
    const { error: balanceError } = await supabase
      .from("wallets")
      .update({ balance: wallet.balance - totalDeducted })
      .eq("id", wallet.id);

    if (balanceError) {
      return NextResponse.json(
        { error: "Failed to update wallet balance" },
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
        currency,
        recipient_id,
        reference_number: referenceNumber,
        description: note || `Transfer to recipient via ${channel}`,
      })
      .select("id")
      .single();

    if (txError || !transaction) {
      // Rollback balance deduction on failure
      await supabase
        .from("wallets")
        .update({ balance: wallet.balance })
        .eq("id", wallet.id);
      return NextResponse.json(
        { error: "Failed to create transaction" },
        { status: 500 }
      );
    }

    recordTransfer(user.id, recipient_id ?? "unknown", amount);

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
        currency,
        fee,
        total_deducted: totalDeducted,
        converted_amount: convertedAmount,
        converted_currency: "MMK",
        exchange_rate: exchangeRate,
        channel,
        recipient_id,
        estimated_arrival: "Within 30 minutes",
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
