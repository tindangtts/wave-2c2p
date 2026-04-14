import { NextResponse } from "next/server";

const REJECTION_REASONS = [
  "Document is blurry or unreadable.",
  "Document is expired.",
  "Name on document does not match registration.",
  "Document type not accepted.",
  "Photo unclear or face not visible.",
] as const;

export async function POST(request: Request) {
  const body = await request.json();
  const { document_type } = body;

  // Read env vars at request time (per D-04)
  const autoApprove = process.env.MOCK_KYC_AUTO_APPROVE !== 'false'; // default: true
  const delayMs = parseInt(process.env.MOCK_KYC_DELAY_MS ?? '1500', 10);

  await new Promise((resolve) => setTimeout(resolve, delayMs));

  if (!autoApprove) {
    const reason = REJECTION_REASONS[Math.floor(Math.random() * REJECTION_REASONS.length)];
    return NextResponse.json({
      success: false,
      status: "rejected",
      rejection_reason: reason,
      document_type,
      extracted_data: null,
    });
  }

  return NextResponse.json({
    success: true,
    status: "approved",
    document_type,
    extracted_data: {
      full_name: "Lalita Tungtrakul",
      document_number: "1-1001-12345-67-8",
      date_of_birth: "1990-05-15",
      nationality: document_type === "work_permit" ? "Myanmar" : "Thailand",
      expiry_date: "2026-12-31",
    },
    confidence_score: 0.95,
  });
}
