import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { isDemoMode, DEMO_TRANSACTIONS } from "@/lib/demo";

export async function GET() {
  try {
    if (isDemoMode) {
      return NextResponse.json({ transactions: DEMO_TRANSACTIONS.slice(0, 5) });
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("transactions")
      .select("id, type, amount, currency, status, description, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch transactions" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      transactions: data ?? [],
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
