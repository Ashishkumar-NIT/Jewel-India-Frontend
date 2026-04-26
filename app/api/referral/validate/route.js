import { supabaseAdmin } from "../../../../lib/supabase/admin.js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * GET /api/referral/validate?code=PJ-a8k3x2
 *
 * Public route — no auth required (used on the referral landing page
 * before the user has signed up).
 *
 * Returns wholesaler info so the landing page can show the referrer name.
 *
 * Response 200:
 * {
 *   valid: true,
 *   code: "PJ-a8k3x2",
 *   wholesaler_name: "Ananya Mehta",
 *   business_name: "Pine Jewels",
 *   business_logo_url: "https://..."
 * }
 *
 * Response 404:
 * { valid: false, reason: "not_found" | "inactive" | "maxed_out" }
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code")?.trim();

    if (!code) {
      return NextResponse.json(
        { valid: false, reason: "no_code", error: "Referral code is required." },
        { status: 400 }
      );
    }

    // ── 1. Fetch referral link record (admin bypasses RLS) ─────────
    const { data: link, error: linkError } = await supabaseAdmin
      .from("referral_links")
      .select("id, wholesaler_id, code, is_active, uses_count, max_uses")
      .eq("code", code)
      .maybeSingle(); // maybeSingle returns null instead of error when no row

    if (linkError) {
      console.error("[referral/validate] DB error:", linkError.message);
      return NextResponse.json({ valid: false, reason: "db_error" }, { status: 500 });
    }

    if (!link) {
      return NextResponse.json({ valid: false, reason: "not_found" }, { status: 404 });
    }

    // ── 2. Check active status ─────────────────────────────────────
    if (!link.is_active) {
      return NextResponse.json({ valid: false, reason: "inactive" }, { status: 404 });
    }

    // ── 3. Check usage limit ───────────────────────────────────────
    if (link.max_uses !== null && link.uses_count >= link.max_uses) {
      return NextResponse.json({ valid: false, reason: "maxed_out" }, { status: 404 });
    }

    // ── 4. Fetch wholesaler info to display on landing page ─────────
    const { data: wholesaler, error: wsError } = await supabaseAdmin
      .from("wholesalers")
      .select("full_name, business_name, business_logo_url, verification_status")
      .eq("id", link.wholesaler_id)
      .single();

    if (wsError || !wholesaler) {
      console.error("[referral/validate] Wholesaler not found:", wsError?.message);
      return NextResponse.json({ valid: false, reason: "wholesaler_not_found" }, { status: 404 });
    }

    // Extra safety — don't allow referrals from non-verified wholesalers
    if (wholesaler.verification_status !== "verified") {
      return NextResponse.json({ valid: false, reason: "inactive" }, { status: 404 });
    }

    return NextResponse.json({
      valid: true,
      code: link.code,
      wholesaler_name: wholesaler.full_name,
      business_name: wholesaler.business_name,
      business_logo_url: wholesaler.business_logo_url || null,
    });
  } catch (err) {
    console.error("[referral/validate] Unexpected error:", err);
    return NextResponse.json(
      { valid: false, reason: "server_error", error: err.message },
      { status: 500 }
    );
  }
}
