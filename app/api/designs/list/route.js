import { createClient } from "../../../../lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * GET /api/designs/list
 *
 * Returns the current retailer's designs.
 * Query params:
 *   - archived: "true" to include archived designs (default: false, only non-archived)
 *   - category: filter by category name (case-insensitive)
 */
export async function GET(req) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.user_metadata?.role !== "retailer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: retailer, error: retailerError } = await supabase
      .from("retailers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (retailerError || !retailer) {
      return NextResponse.json({ error: "Retailer profile not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const includeArchived = searchParams.get("archived") === "true";
    const categoryFilter = (searchParams.get("category") || "").trim().toLowerCase();

    let query = supabase
      .from("retailer_designs")
      .select("id, image_url, title, category, tags, is_archived, created_at")
      .eq("retailer_id", retailer.id)
      .order("created_at", { ascending: false });

    if (!includeArchived) {
      query = query.eq("is_archived", false);
    }

    const { data: designs, error: designsError } = await query;

    if (designsError) {
      console.error("[designs/list] DB error:", designsError.message);
      return NextResponse.json({ error: "Failed to load designs" }, { status: 500 });
    }

    let filteredDesigns = designs || [];

    // Apply category filter in-memory (case-insensitive)
    if (categoryFilter && categoryFilter !== "all") {
      filteredDesigns = filteredDesigns.filter(
        (d) => (d.category || "").toLowerCase() === categoryFilter
      );
    }

    return NextResponse.json({
      data: filteredDesigns,
      meta: {
        total: (designs || []).length,
        active: (designs || []).filter((d) => !d.is_archived).length,
        archived: (designs || []).filter((d) => d.is_archived).length,
      },
    });
  } catch (err) {
    console.error("[designs/list] Unexpected error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
