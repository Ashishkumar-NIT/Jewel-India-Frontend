import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

// Helper to determine wholesaler destination based on verification status
async function getWholesalerDestination(supabase, userId) {
  const { data: wholesaler } = await supabase
    .from("wholesalers")
    .select("verification_status, has_visited_dashboard")
    .eq("user_id", userId)
    .single();

  if (!wholesaler) return "/onboard";

  if (wholesaler.verification_status === "banned") {
    return "/entry_page/signup?error=banned";
  }

  if (wholesaler.verification_status === "verified") {
    return "/dashboard/wholesaler";
  }

  // pending, on_hold, rejected, resubmission_required
  return "/onboard/submitted";
}

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  function redirect(dest) {
    const url = request.nextUrl.clone();
    url.pathname = dest;
    return NextResponse.redirect(url);
  }

  // ── 1. Protect dashboard routes ──────────────────────────────
  if (pathname.startsWith("/dashboard")) {
    if (!user) return redirect("/signup");

    const role = user.user_metadata?.role;
    if (!role) return redirect("/onboard");
    if (role === "retailer") return redirect("/");

    // For wholesalers, check if onboarding is complete and verified
    if (role === "wholesaler") {
      const { data: wholesaler } = await supabase
        .from("wholesalers")
        .select("verification_status")
        .eq("user_id", user.id)
        .single();

      // No wholesaler record means onboarding not started/completed
      if (!wholesaler) {
        return redirect("/onboard");
      }

      // Check verification status - only "verified" can access dashboard
      if (wholesaler.verification_status === "banned") {
        // Sign out banned users and redirect to signup with error
        await supabase.auth.signOut();
        const url = request.nextUrl.clone();
        url.pathname = "/entry_page/signup";
        url.searchParams.set("error", "banned");
        return NextResponse.redirect(url);
      }

      if (wholesaler.verification_status !== "verified") {
        // pending, on_hold, rejected, resubmission_required - redirect to submitted page
        return redirect("/onboard/submitted");
      }
    }
  }

  // ── 2. Homepage — retailers only ─────────────────────────────
  if (pathname === "/") {
    if (user) {
      const role = user.user_metadata?.role;
      if (!role) return redirect("/onboard");
      if (role === "wholesaler") {
        const dest = await getWholesalerDestination(supabase, user.id);
        if (dest.includes("error=banned")) {
          await supabase.auth.signOut();
        }
        const url = request.nextUrl.clone();
        url.pathname = dest.split("?")[0];
        if (dest.includes("?")) {
          const params = new URLSearchParams(dest.split("?")[1]);
          params.forEach((value, key) => url.searchParams.set(key, value));
        }
        return NextResponse.redirect(url);
      }
    }
  }

  // ── 3. Protect select-role — must be logged in ───────────────
  if (pathname.startsWith("/select-role") && !user) {
    return redirect("/entry_page/signup");
  }

  // ── 4. New auth sub-routes — must be accessible without login ─
  // /signup/verify-otp and /signup/set-password are pre-auth steps.
  // Allow them through without session checks.
  const preAuthRoutes = ["/entry_page/signup/verify-otp", "/entry_page/signup/set-password", "/auth/callback"];
  if (preAuthRoutes.some((r) => pathname.startsWith(r))) {
    return supabaseResponse;
  }

  // ── 5. Auth pages — redirect authenticated users ─────────────
  const authRoutes = ["/entry_page/signin", "/entry_page/signup"];
  if (authRoutes.some((r) => pathname === r || pathname.startsWith(r + "?")) && user) {
    const role = user.user_metadata?.role;
    if (!role) return redirect("/onboard");
    if (role === "wholesaler") {
      const dest = await getWholesalerDestination(supabase, user.id);
      if (dest.includes("error=banned")) {
        await supabase.auth.signOut();
      }
      const url = request.nextUrl.clone();
      url.pathname = dest.split("?")[0];
      if (dest.includes("?")) {
        const params = new URLSearchParams(dest.split("?")[1]);
        params.forEach((value, key) => url.searchParams.set(key, value));
      }
      return NextResponse.redirect(url);
    }
    return redirect("/");
  }

  return supabaseResponse;
}
