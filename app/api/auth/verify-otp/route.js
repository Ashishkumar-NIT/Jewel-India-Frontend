import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { supabaseAdmin } from "../../../../lib/supabase/admin";

export async function POST(request) {
  try {
    const { identity, token, referralCode } = await request.json();

    if (!identity || !token) {
      return NextResponse.json({ error: "Identity and token are required." }, { status: 400 });
    }

    const normalized = identity.trim().toLowerCase();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);

    const supabase = await createClient();

    let data, error;
    if (isEmail) {
      const resp = await supabase.auth.verifyOtp({
        email: normalized,
        token: token.trim(),
        type: "email",
      });
      data = resp.data;
      error = resp.error;
    } else {
      const resp = await supabase.auth.verifyOtp({
        phone: normalized,
        token: token.trim(),
        type: "sms",
      });
      data = resp.data;
      error = resp.error;
    }

    if (error) {
      console.error("[verify-otp] Supabase error:", error);
      return NextResponse.json(
        { error: "Invalid OTP. Please check the code and try again." },
        { status: 401 }
      );
    }

    // ── Referral Link Usage Tracking ──────────────────────────────
    // Increment uses_count on each valid redemption and only deactivate
    // the link once uses_count reaches max_uses (multi-use links must
    // survive more than one redemption). max_uses === null means unlimited.
    if (referralCode) {
      try {
        const { data: link, error: linkFetchError } = await supabaseAdmin
          .from("referral_links")
          .select("id, uses_count, max_uses, is_active")
          .eq("code", referralCode)
          .maybeSingle();

        if (linkFetchError) {
          console.error("[verify-otp] Failed to fetch referral code:", linkFetchError.message);
        } else if (!link) {
          console.warn(`[verify-otp] Referral code not found: ${referralCode}`);
        } else if (!link.is_active || (link.max_uses !== null && link.uses_count >= link.max_uses)) {
          // Already inactive or already at capacity — don't count this as a new use.
          console.warn(`[verify-otp] Referral code already exhausted: ${referralCode}`);
        } else {
          const newUsesCount = (link.uses_count || 0) + 1;
          const reachedLimit = link.max_uses !== null && newUsesCount >= link.max_uses;

          const { error: linkUpdateError } = await supabaseAdmin
            .from("referral_links")
            .update({
              uses_count: newUsesCount,
              is_active: !reachedLimit,
            })
            .eq("id", link.id);

          if (linkUpdateError) {
            console.error("[verify-otp] Failed to update referral code usage:", linkUpdateError.message);
          } else {
            console.log(
              `[verify-otp] Referral code ${referralCode} used (${newUsesCount}${link.max_uses !== null ? `/${link.max_uses}` : ""})${reachedLimit ? " — now exhausted" : ""}`
            );
          }
        }
      } catch (err) {
        console.error("[verify-otp] Failed to process referral code:", err);
        // Don't fail the whole login if just the referral processing fails
      }
    }

    // Check if the user is completely new (has no role assigned yet).
    // A returning user will have 'wholesaler' or 'retailer' set from the SetPassword logic or an invite.
    const userRole = data.user?.user_metadata?.role;
    const isNewUser = !userRole;

    return NextResponse.json({ 
      success: true, 
      userId: data.user?.id,
      isNewUser,
      userRole
    });
  } catch (err) {
    console.error("[verify-otp] unexpected error:", err);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}
