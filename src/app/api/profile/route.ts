import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { userProfiles } from "@/db/schema";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = await db
      .select({
        first_name: userProfiles.firstName,
        last_name: userProfiles.lastName,
        phone: userProfiles.phone,
        date_of_birth: userProfiles.dateOfBirth,
        kyc_status: userProfiles.kycStatus,
        webauthn_credential_id: userProfiles.webauthnCredentialId,
      })
      .from(userProfiles)
      .where(eq(userProfiles.id, user.id))
      .limit(1);

    return NextResponse.json({ profile: rows[0] ?? null });
  } catch (err) {
    console.error("[profile] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
