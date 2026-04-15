import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { TransferChannel } from "@/types";
import { db } from "@/db";
import { wallets, transactions } from "@/db/schema";
import { eq } from "drizzle-orm";

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

    // Fetch wallet via Drizzle and validate balance
    const [wallet] = await db
      .select({ id: wallets.id, balance: wallets.balance })
      .from(wallets)
      .where(eq(wallets.userId, user.id))
      .limit(1);

    if (!wallet) {
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
    const newBalance = wallet.balance - totalDeducted;

    let txId: string;
    try {
      txId = await db.transaction(async (tx) => {
        await tx.update(wallets)
          .set({ balance: newBalance, updatedAt: new Date() })
          .where(eq(wallets.id, wallet.id));
        const [inserted] = await tx.insert(transactions)
          .values({
            userId: user.id,
            type: "transfer",
            status: "pending",
            amount: totalDeducted,
            fee,
            currency,
            convertedAmount,
            convertedCurrency: "MMK",
            exchangeRate: String(exchangeRate),
            recipientId: recipient_id ?? null,
            channel,
            referenceNumber,
            description: note || `Transfer to recipient via ${channel}`,
            metadata: null,
          })
          .returning({ id: transactions.id });
        return inserted.id;
      });
    } catch {
      return NextResponse.json({ error: "Failed to process transfer" }, { status: 500 });
    }

    recordTransfer(user.id, recipient_id ?? "unknown", amount);

    // Auto-complete after 2s (mock behavior)
    setTimeout(async () => {
      try {
        await db.update(transactions)
          .set({ status: "success", updatedAt: new Date() })
          .where(eq(transactions.id, txId));
      } catch {
        // Background update failure — not critical
      }
    }, 2000);

    return NextResponse.json({
      success: true,
      status: "pending",
      transfer: {
        id: txId,
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
