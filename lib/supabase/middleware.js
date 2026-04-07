import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

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
  }

  // ── 2. Homepage — retailers only ─────────────────────────────
  if (pathname === "/") {
    if (user) {
      const role = user.user_metadata?.role;
      if (!role) return redirect("/onboard");
      if (role === "wholesaler") return redirect("/dashboard/wholesaler");
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
    if (role === "wholesaler") return redirect("/dashboard/wholesaler");
    return redirect("/");
  }

  return supabaseResponse;
}
