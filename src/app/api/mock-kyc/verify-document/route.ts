import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { document_type, front_image, back_image } = body;

  // Mock delay to simulate processing
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Mock configurable pass/fail (default: pass)
  const shouldFail = body.mock_fail === true;

  if (shouldFail) {
    return NextResponse.json({
      success: false,
      status: "rejected",
      rejection_reason: "Document is blurry or unreadable. Please retake the photo.",
      document_type,
      extracted_data: null,
    });
  }

  // Mock extracted data from OCR
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
