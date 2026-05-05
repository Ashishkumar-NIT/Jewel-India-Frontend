import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase/admin";
import { validateIndianMobile } from "../../../../lib/utils/credentials";

/**
 * POST /api/auth/check-user
 * Body: { identity: string } — email or phone number
 * Returns: { exists: boolean }
 *
 * Uses the admin client to check both email and phone in Supabase auth.users.
 * Phone numbers should be in E.164 format (e.g. +911234567890).
 */
export async function POST(request) {
  try {
    const { identity } = await request.json();

    if (!identity || typeof identity !== "string") {
      return NextResponse.json({ error: "Identity is required" }, { status: 400 });
    }

    const trimmed = identity.trim();
    const normalized = trimmed.toLowerCase();

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
    const mobileCheck = validateIndianMobile(trimmed);
    const isPhone = mobileCheck.valid;

    if (!isEmail && !isPhone) {
      return NextResponse.json(
        { error: "Please enter a valid email address or 10-digit Indian mobile number." },
        { status: 400 }
      );
    }

    // Use admin client to list users filtered by email or phone
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (error) {
      console.error("[check-user] listUsers error:", error);
      return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
    }

    let exists = false;
    let provider = null;

    if (isEmail) {
      const userMatch = data.users.find(
        (u) => u.email?.toLowerCase() === normalized
      );
      if (userMatch) {
        exists = true;
        provider = userMatch.app_metadata?.provider || null;
      }
    } else {
      // Use validated normalized E.164 phone for comparison
      // Supabase stores phone numbers like '911234567890' without the '+'
      const normalizedPhone = mobileCheck.normalized.replace(/[+]/g, "");
      const userMatch = data.users.find(
        (u) => u.phone?.replace(/[\s\-.()+]/g, "") === normalizedPhone
      );
      if (userMatch) {
        exists = true;
        provider = userMatch.app_metadata?.provider || null;
      }
    }

    return NextResponse.json({ exists, provider, isEmail, isPhone: !isEmail });
  } catch (err) {
    console.error("[check-user] unexpected error:", err);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}
