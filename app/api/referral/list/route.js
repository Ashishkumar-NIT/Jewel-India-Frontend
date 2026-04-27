import { supabaseAdmin } from "../../../../lib/supabase/admin.js";
import { createClient } from "../../../../lib/supabase/server.js";
import { NextResponse } from "next/server";
import { getURL } from "../../../../lib/utils/url.js";

export const runtime = "nodejs";

/**
 * GET /api/referral/list
 *
 * Authenticated route — returns all referral links for the
 * currently logged-in wholesaler, ordered newest-first.
 *
 * Response 200: { data: [ { id, code, link, uses_count, max_uses, is_active, created_at } ] }
 */
export async function GET() {
  try {
    // ── 1. Auth check ─────────────────────────────────────────────
    const supabaseServer = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabaseServer.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (user.user_metadata?.role !== "wholesaler") {
      return NextResponse.json({ error: "Wholesalers only." }, { status: 403 });
    }

    // ── 2. Fetch wholesaler record id ──────────────────────────────
    const { data: wholesaler, error: wsError } = await supabaseAdmin
      .from("wholesalers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (wsError || !wholesaler) {
      return NextResponse.json({ error: "Wholesaler record not found." }, { status: 404 });
    }

    // ── 3. Fetch all links for this wholesaler ─────────────────────
    const { data: links, error: linksError } = await supabaseAdmin
      .from("referral_links")
      .select("id, code, uses_count, max_uses, is_active, created_at")
      .eq("wholesaler_id", wholesaler.id)
      .order("created_at", { ascending: false });

    if (linksError) {
      console.error("[referral/list] DB error:", linksError.message);
      return NextResponse.json({ error: linksError.message }, { status: 500 });
    }

    // ── 4. Attach full shareable link URL ──────────────────────────
    const siteUrl = getURL();

    const data = (links ?? []).map((l) => ({
      ...l,
      link: `${siteUrl}/join/${l.code}`,
    }));

    return NextResponse.json({ data });
  } catch (err) {
    console.error("[referral/list] Unexpected error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
