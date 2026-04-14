import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await request.json(); // consume body

  // Read env vars at request time (per D-04)
  const autoApprove = process.env.MOCK_KYC_AUTO_APPROVE !== 'false'; // default: true
  const delayMs = parseInt(process.env.MOCK_KYC_DELAY_MS ?? '2000', 10);

  await new Promise((resolve) => setTimeout(resolve, delayMs));

  if (!autoApprove) {
    return NextResponse.json({
      success: false,
      status: "rejected",
      rejection_reason: "Face does not match the document photo. Please try again.",
      liveness_score: 0.3,
      match_score: 0.2,
    });
  }

  return NextResponse.json({
    success: true,
    status: "approved",
    liveness_score: 0.98,
    match_score: 0.94,
    verification_id: `KYC-${Date.now()}`,
  });
}
