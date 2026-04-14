import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  // Mock delay for face verification
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const shouldFail = body.mock_fail === true;

  if (shouldFail) {
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
