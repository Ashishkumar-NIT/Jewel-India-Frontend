import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: retailer } = await supabase
      .from("retailers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!retailer) {
      return NextResponse.json({ error: "Retailer profile not found" }, { status: 404 });
    }
    const { data: employees, error: fetchError } = await supabase
      .from("employees")
      .select("*")
      .eq("retailer_id", retailer.id)
      .order("created_at", { ascending: false });

    if (fetchError) throw fetchError;

    return NextResponse.json({ data: employees });
  } catch (error) {
    console.error("List employees error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
