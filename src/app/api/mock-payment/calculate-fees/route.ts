import { NextResponse } from "next/server";
import type { TransferChannel } from "@/types";

export async function POST(request: Request) {
  const body = await request.json();
  const { amount, channels } = body as {
    amount: number;
    channels: TransferChannel[];
  };

  const feeTable: Record<TransferChannel, number> = {
    wave_agent: 10.0,
    wave_app: 10.0,
    bank_transfer: 15.0,
    cash_pickup: 20.0,
  };

  const exchangeRate = 58.148;

  const fees = (channels ?? Object.keys(feeTable)).map(
    (channel: TransferChannel) => ({
      channel,
      fee: feeTable[channel] ?? 10.0,
      fee_currency: "THB",
      amount,
      total_amount: amount + (feeTable[channel] ?? 10.0),
      converted_amount: amount * exchangeRate,
      converted_currency: "MMK",
    })
  );

  return NextResponse.json({ fees, exchange_rate: exchangeRate });
}
