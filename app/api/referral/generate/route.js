import { supabaseAdmin } from "../../../../lib/supabase/admin.js";
import { createClient } from "../../../../lib/supabase/server.js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Generates a unique referral code from business initials + 6 random chars.
 * e.g. "Pine Jewels" → "PJ-a8k3x2"
 */
function buildReferralCode(businessName) {
  const initials = businessName
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 4); // max 4 initials

  const chars = "abcdefghijklmnpqrstuvwxyz23456789"; // no ambiguous chars (0/O, 1/l)
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${initials || "JW"}-${suffix}`;
}

/**
 * POST /api/referral/generate
 *
 * Authenticated route — only verified wholesalers can generate links.
 *
 * Body (JSON): { max_uses?: number }   — omit for unlimited
 *
 * Returns: { id, code, link, created_at }
 */
export async function POST(req) {
  try {
    // ── 1. Auth check ─────────────────────────────────────────────
    const supabaseServer = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabaseServer.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized — please sign in." }, { status: 401 });
    }

    if (user.user_metadata?.role !== "wholesaler") {
      return NextResponse.json({ error: "Only wholesalers can generate referral links." }, { status: 403 });
    }

    // ── 2. Fetch wholesaler record ─────────────────────────────────
    const { data: wholesaler, error: wsError } = await supabaseAdmin
      .from("wholesalers")
      .select("id, business_name, verification_status")
      .eq("user_id", user.id)
      .single();

    if (wsError || !wholesaler) {
      return NextResponse.json({ error: "Wholesaler record not found." }, { status: 404 });
    }

    if (wholesaler.verification_status !== "verified") {
      return NextResponse.json(
        { error: "Only verified wholesalers can generate referral links." },
        { status: 403 }
      );
    }

    // ── 3. Parse optional body params ─────────────────────────────
    let max_uses = null;
    try {
      const body = await req.json();
      if (body?.max_uses && Number.isInteger(body.max_uses) && body.max_uses > 0) {
        max_uses = body.max_uses;
      }
    } catch {
      // Body is optional — ignore parse errors
    }

    // ── 4. Generate unique code (retry up to 5 times on collision) ─
    let code = "";
    let inserted = null;
    let dbError = null;

    for (let attempt = 0; attempt < 5; attempt++) {
      code = buildReferralCode(wholesaler.business_name || "JW");

      const result = await supabaseAdmin
        .from("referral_links")
        .insert({
          wholesaler_id: wholesaler.id,
          code,
          max_uses,
          is_active: true,
        })
        .select("id, code, max_uses, uses_count, is_active, created_at")
        .single();

      if (!result.error) {
        inserted = result.data;
        dbError = null;
        break;
      }

      // Unique constraint violation on `code` — retry with new random suffix
      if (result.error.code === "23505") {
        dbError = result.error;
        continue;
      }

      // Any other DB error — fail immediately
      console.error("[referral/generate] DB error:", result.error.message);
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    if (!inserted) {
      console.error("[referral/generate] Failed after 5 attempts:", dbError?.message);
      return NextResponse.json(
        { error: "Could not generate a unique code. Please try again." },
        { status: 500 }
      );
    }

    // ── 5. Build the full shareable link ───────────────────────────
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";

    const link = `${siteUrl}/join/${inserted.code}`;

    return NextResponse.json({
      id: inserted.id,
      code: inserted.code,
      link,
      max_uses: inserted.max_uses,
      uses_count: inserted.uses_count,
      is_active: inserted.is_active,
      created_at: inserted.created_at,
    });
  } catch (err) {
    console.error("[referral/generate] Unexpected error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
