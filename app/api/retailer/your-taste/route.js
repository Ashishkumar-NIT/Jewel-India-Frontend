import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";

export async function POST(request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { product_id, selected } = await request.json();

    if (!product_id || typeof selected !== "boolean") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Get retailer ID
    const { data: retailer, error: retailerError } = await supabase
      .from("retailers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (retailerError || !retailer) {
      return NextResponse.json({ error: "Retailer profile not found" }, { status: 404 });
    }

    if (selected) {
      // Insert selection
      const { error: insertError } = await supabase
        .from("retailer_selections")
        .insert({ retailer_id: retailer.id, product_id })
        .select()
        .single();
      
      // Ignore conflict error if they already selected it
      if (insertError && insertError.code !== '23505') {
        console.error("Insert selection error:", insertError);
        return NextResponse.json({ error: "Failed to select" }, { status: 500 });
      }
    } else {
      // Delete selection
      const { error: deleteError } = await supabase
        .from("retailer_selections")
        .delete()
        .eq("retailer_id", retailer.id)
        .eq("product_id", product_id);

      if (deleteError) {
        console.error("Delete selection error:", deleteError);
        return NextResponse.json({ error: "Failed to unselect" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/retailer/your-taste]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
