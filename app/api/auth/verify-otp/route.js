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

    // ── Referral Link Expiration ──────────────────────────────────
    if (referralCode) {
      try {
        // Increment use count and expire the link immediately
        await supabaseAdmin
          .from("referral_links")
          .update({ 
            is_active: false,
            // We can also increment uses_count if we want to be thorough
            // but is_active: false is enough to "expire" it.
          })
          .eq("code", referralCode);
        
        console.log(`[verify-otp] Expired referral code: ${referralCode}`);
      } catch (err) {
        console.error("[verify-otp] Failed to expire referral code:", err);
        // Don't fail the whole login if just the referral expiration fails
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
