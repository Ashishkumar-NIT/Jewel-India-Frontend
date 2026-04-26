import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";

/**
 * POST /api/auth/verify-otp
 * Body: { identity: string, token: string } — email + 6-digit OTP
 *
 * Verifies the OTP via Supabase verifyOtp.
 * On success: user is now signed in (session cookie set by Supabase).
 * Returns: { success } or { error }
 */
export async function POST(request) {
  try {
    const { identity, token } = await request.json();

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
