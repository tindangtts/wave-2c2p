import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { wallets, transactions } from "@/db/schema";
import { eq } from "drizzle-orm";

// Duplicate transfer guard (TXN-11): same wallet+amount within 60s
const recentTransfers = new Map<string, number>();
const DEDUP_WINDOW_MS = 60_000;

function checkDuplicateTransfer(userId: string, receiverWalletId: string, amount: number): boolean {
  const key = `${userId}:${receiverWalletId}:${amount}`;
  const lastTime = recentTransfers.get(key);
  if (lastTime && Date.now() - lastTime < DEDUP_WINDOW_MS) return true;
  return false;
}

function recordTransfer(userId: string, receiverWalletId: string, amount: number) {
  const key = `${userId}:${receiverWalletId}:${amount}`;
  recentTransfers.set(key, Date.now());
  for (const [k, v] of recentTransfers) {
    if (Date.now() - v > DEDUP_WINDOW_MS) recentTransfers.delete(k);
  }
}

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
    const { receiver_wallet_id, amount, force_confirm } = body as {
      receiver_wallet_id: string;
      amount: number;
      force_confirm?: boolean;
    };

    // Duplicate transfer guard (TXN-11)
    if (!force_confirm && checkDuplicateTransfer(user.id, receiver_wallet_id, amount)) {
      return NextResponse.json(
        { error: "duplicate_transfer", message: "A similar transfer was made less than 60 seconds ago. Please confirm to proceed." },
        { status: 409 }
      );
    }

    if (!receiver_wallet_id || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Fetch sender wallet via Drizzle
    const [senderWallet] = await db
      .select({ id: wallets.id, balance: wallets.balance, userId: wallets.userId })
      .from(wallets)
      .where(eq(wallets.userId, user.id))
      .limit(1);

    if (!senderWallet) {
      return NextResponse.json(
        { error: "Sender wallet not found" },
        { status: 404 }
      );
    }

    // Fetch receiver wallet via Drizzle (receiver_wallet_id is the wallet's id column)
    const [receiverWallet] = await db
      .select({ id: wallets.id, balance: wallets.balance, userId: wallets.userId })
      .from(wallets)
      .where(eq(wallets.id, receiver_wallet_id))
      .limit(1);

    if (!receiverWallet) {
      return NextResponse.json(
        { error: "Receiver wallet not found" },
        { status: 404 }
      );
    }

    // Validate sender !== receiver
    if (senderWallet.userId === receiverWallet.userId) {
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

    // Atomic transaction: deduct sender, credit receiver, insert transaction
    let txId: string;
    try {
      txId = await db.transaction(async (tx) => {
        await tx.update(wallets)
          .set({ balance: senderWallet.balance - totalDeducted, updatedAt: new Date() })
          .where(eq(wallets.id, senderWallet.id));
        await tx.update(wallets)
          .set({ balance: receiverWallet.balance + amount, updatedAt: new Date() })
          .where(eq(wallets.id, receiverWallet.id));
        const [inserted] = await tx.insert(transactions)
          .values({
            userId: user.id,
            type: "transfer",
            status: "pending",
            amount: totalDeducted,
            fee,
            currency: "THB",
            channel: "p2p",
            referenceNumber,
            description: `P2P transfer to wallet ${receiver_wallet_id}`,
            metadata: null,
          })
          .returning({ id: transactions.id });
        return inserted.id;
      });
    } catch {
      return NextResponse.json(
        { error: "Failed to process P2P transfer" },
        { status: 500 }
      );
    }

    recordTransfer(user.id, receiver_wallet_id, amount);

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
