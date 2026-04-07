import { createClient } from "../../../lib/supabase/server";
import { supabaseAdmin } from "../../../lib/supabase/admin";
import { NextResponse } from "next/server";
import { getWholesalerDestination } from "../../../lib/actions/auth";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code  = searchParams.get("code");
  const oauthError = searchParams.get("error");

  if (oauthError) {
    const description = searchParams.get("error_description") ?? oauthError;
    const url = new URL(`${origin}/entry_page/signup`);
    url.searchParams.set("error", description);
    return NextResponse.redirect(url.toString());
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Try metadata first (fastest — from JWT)
      let role = user?.user_metadata?.role;

      // Fallback: query profiles table in case metadata is outdated
      if (!role && user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();
        role = profile?.role;
      }

      if (role === "wholesaler") {
        // If the role was missing from the JWT but found in the database,
        // we MUST inject it into the JWT now, or the middleware will reject them later.
        if (!user?.user_metadata?.role) {
          await supabase.auth.updateUser({
            data: { role: "wholesaler" }
          });
        }
        
        const dest = await getWholesalerDestination(user.id);
        if (dest.includes("error=banned")) {
          await supabase.auth.signOut();
        }
        return NextResponse.redirect(`${origin}${dest}`);
      }
      
      if (role === "retailer") {
        if (!user?.user_metadata?.role) {
          await supabase.auth.updateUser({
            data: { role: "retailer" }
          });
        }
        return NextResponse.redirect(`${origin}/`);
      }

      // No role yet — this is a first-time Google sign-in.
      if (user) {
        // Use the SERVER client, NOT admin client, so the browser's session cookie gets refreshed with the new role
        await supabase.auth.updateUser({
          data: { role: "wholesaler" }
        });
        
        // Ensure they exist in the profiles table
        await supabaseAdmin.from("profiles").upsert({
          id: user.id,
          email: user.email || user.phone,
          role: "wholesaler"
        }, { onConflict: "id" });
      }

      return NextResponse.redirect(`${origin}/onboard`);
    }

    // Exchange failed
    const url = new URL(`${origin}/entry_page/signup`);
    url.searchParams.set("error", exchangeError.message);
    return NextResponse.redirect(url.toString());
  }

  // No code and no error — unexpected state
  return NextResponse.redirect(`${origin}/entry_page/signup?error=oauth`);
}

