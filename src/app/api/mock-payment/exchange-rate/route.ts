import { NextResponse } from "next/server";

export async function GET() {
  // Mock exchange rates matching the prototype
  return NextResponse.json({
    rates: [
      {
        from: "THB",
        to: "MMK",
        rate: 58.148,
        inverse_rate: 0.0172,
        updated_at: new Date().toISOString(),
      },
    ],
    info: {
      description: "1 THB = 133.0 MMK (promotional rate shown in prototype)",
      max_transfer: "100,000 MMK = 751.88 THB",
    },
  });
}
