import { NextResponse } from "next/server";

export async function GET() {
  // Read exchange rate from env var at request time (per D-06)
  const rate = parseFloat(process.env.MOCK_EXCHANGE_RATE_THB_MMK ?? '58.148');

  return NextResponse.json({
    rates: [
      {
        from: "THB",
        to: "MMK",
        rate,
        inverse_rate: Math.round((1 / rate) * 10000) / 10000,
        updated_at: new Date().toISOString(),
      },
    ],
  });
}
