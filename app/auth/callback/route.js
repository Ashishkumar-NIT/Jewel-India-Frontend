import { createClient } from "../../../lib/supabase/server";
import { supabaseAdmin } from "../../../lib/supabase/admin";
import { NextResponse } from "next/server";
import { getWholesalerDestination } from "../../../lib/actions/auth";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code  = searchParams.get("code");
  const oauthError = searchParams.get("error");
  const mode = searchParams.get("mode");

  if (oauthError) {
    const description = searchParams.get("error_description") ?? oauthError;
    const url = new URL(`${origin}/signup`);
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

      // Entry page flow
      if (mode === "entry") {
        // Check if user exists in profiles table
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", user.id)
            .maybeSingle();

          if (profile) {
            // User exists → navigate using precise destination logic
            const dest = await getWholesalerDestination(user.id);
            if (dest.includes("error=banned")) {
              await supabase.auth.signOut();
            }
            return NextResponse.redirect(`${origin}${dest}`);
          } else {
            // User does not exist → navigate to onboard
            return NextResponse.redirect(`${origin}/onboard`);
          }
        }
      }

      // Regular flow (non-entry page)
      // Try metadata first (fastest — from JWT)
      let role = user?.user_metadata?.role;

      // Fallback: query profiles table in case metadata is outdated
      if (!role && user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        role = profile?.role;
      }

      if (role === "wholesaler") {
        const dest = await getWholesalerDestination(user.id);
        if (dest.includes("error=banned")) {
          await supabase.auth.signOut();
        }
        return NextResponse.redirect(`${origin}${dest}`);
      }
      if (role === "retailer") {
        return NextResponse.redirect(`${origin}/`);
      }

      // No role yet — this is a first-time Google sign-in.
      // Set role to wholesaler via admin client, then send to onboard.
      if (user) {
        await supabaseAdmin.auth.admin.updateUserById(user.id, {
          user_metadata: { role: "wholesaler" },
        });
      }

      return NextResponse.redirect(`${origin}/onboard`);
    }

    // Exchange failed
    const url = new URL(`${origin}/signup`);
    url.searchParams.set("error", exchangeError.message);
    return NextResponse.redirect(url.toString());
  }

  // No code and no error — unexpected state
  return NextResponse.redirect(`${origin}/signup?error=oauth`);
}

