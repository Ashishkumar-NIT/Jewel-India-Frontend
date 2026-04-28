import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { supabaseAdmin } from "../../../../lib/supabase/admin";
import { generateEmployeeCredentials } from "../../../../lib/utils/credentials";

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: retailer } = await supabase
      .from("retailers")
      .select("id, business_name")
      .eq("user_id", user.id)
      .single();

    if (!retailer) {
      return NextResponse.json({ error: "Retailer profile not found" }, { status: 404 });
    }

    const { full_name } = await request.json();

    const fullName = typeof full_name === "string" ? full_name.trim() : "";
    if (!fullName) {
      return NextResponse.json({ error: "Full name is required" }, { status: 400 });
    }

    // Get existing emails to prevent duplicates
    const { data: existingEmployees } = await supabaseAdmin
      .from("employees")
      .select("email")
      .eq("retailer_id", retailer.id);
      
    const existingEmails = existingEmployees?.map(e => e.email) || [];

    // Generate credentials
    const { email } = generateEmployeeCredentials(
      fullName,
      retailer.business_name,
      existingEmails
    );

    return NextResponse.json({ email });

  } catch (error) {
    console.error("Generate email error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
