import { NextResponse } from "next/server";
import type { TransferChannel } from "@/types";

export async function POST(request: Request) {
  const body = await request.json();
  const { amount, channels } = body as {
    amount: number;
    channels: TransferChannel[];
  };

  // Fee schedule per D-14: wave_agent=10, wave_app=10, bank_transfer=50, cash_pickup=30
  const feeTable: Record<TransferChannel, number> = {
    wave_agent: 10.0,
    wave_app: 10.0,
    bank_transfer: 50.0,
    cash_pickup: 30.0,
  };

  // Read exchange rate from env var at request time (per D-06)
  const exchangeRate = parseFloat(process.env.MOCK_EXCHANGE_RATE_THB_MMK ?? '58.148');

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
