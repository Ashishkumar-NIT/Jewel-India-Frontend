import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { supabaseAdmin } from "../../../../lib/supabase/admin";

/**
 * POST /api/auth/set-password
 * Body: { password: string }
 *
 * Called after OTP verification (user is now signed in via OTP session).
 * Updates the user's password and sets their role to 'wholesaler'.
 * Returns: { success } or { error }
 */
export async function POST(request) {
  try {
    const { password, role: requestRole } = await request.json();

    if (!password) {
      return NextResponse.json({ error: "Password is required." }, { status: 400 });
    }

    const assignedRole = requestRole === "retailer" ? "retailer" : "wholesaler";

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 8 characters and include 1 uppercase, 1 lowercase, 1 number, and 1 special character.",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify the user is currently signed in (via OTP session)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Session expired. Please restart the signup process." },
        { status: 401 }
      );
    }

    // Update the user's password and metadata
    const { error: updateError } = await supabase.auth.updateUser({
      password,
      data: { role: assignedRole }, // set role in metadata
    });

    if (updateError) {
      console.error("[set-password] updateUser error:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Since users are created without a role during the OTP step, the database triggers
    // won't fire perfectly. We manually ensure they exist in the profiles table here.
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: user.id,
        email: user.email || user.phone,
        role: assignedRole,
      }, { onConflict: "id" });

    if (profileError) {
      console.warn("[set-password] Error upserting to profiles:", profileError);
      // We don't fail the request here, but it's good to log
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[set-password] unexpected error:", err);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}

