import { NextResponse } from "next/server";
import type { TransferChannel } from "@/types";

const channelFees: Record<TransferChannel, number> = {
  wave_agent: 10.0,
  wave_app: 10.0,
  bank_transfer: 15.0,
  cash_pickup: 20.0,
};

export async function POST(request: Request) {
  const body = await request.json();
  const {
    amount,
    currency = "THB",
    recipient_id,
    channel,
    mock_fail,
  } = body;

  // Mock processing delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  if (mock_fail) {
    return NextResponse.json({
      success: false,
      status: "failed",
      error: "Transfer could not be processed. Please try again later.",
      reference_number: null,
    });
  }

  const fee = channelFees[channel as TransferChannel] ?? 10.0;
  const exchangeRate = 58.148; // Mock THB to MMK
  const convertedAmount = amount * exchangeRate;

  return NextResponse.json({
    success: true,
    status: "processing",
    transfer: {
      reference_number: `TXN-${Date.now()}`,
      amount,
      currency,
      fee,
      total_deducted: amount + fee,
      converted_amount: convertedAmount,
      converted_currency: "MMK",
      exchange_rate: exchangeRate,
      channel,
      recipient_id,
      estimated_arrival: "Within 30 minutes",
      created_at: new Date().toISOString(),
    },
  });
}
