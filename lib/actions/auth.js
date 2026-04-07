"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../supabase/server";
import { getURL } from "../utils/url";


// Helper: resolve the destination URL based on the user's role
function roleDestination(role) {
  if (role === "wholesaler") return "/dashboard/wholesaler"; // Fallback, normally intercepted
  if (role === "retailer") return "/";
  return "/select-role"; // no role yet — must choose
}

export async function getWholesalerDestination(userId) {
  const supabase = await createClient();
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
    if (wholesaler.has_visited_dashboard) {
      return "/dashboard/wholesaler";
    }
    return "/onboard/submitted"; // First time login logic
  }

  // pending, on_hold, rejected, resubmission_required
  return "/onboard/submitted";
}

// ─── Sign Up ────────────────────────────────────────────────────────────────
export async function signUp(formData) {
  const supabase = await createClient();
  const email    = formData.get("email");
  const password = formData.get("password");
  const role     = formData.get("role"); // "wholesaler" | "retailer"

  if (!["wholesaler", "retailer"].includes(role)) {
    return { error: "Please select a role (Wholesaler or Retailer)." };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role }, // stored in raw_user_meta_data → triggers profile creation
      emailRedirectTo: `${getURL()}/auth/callback`,
    },
  });

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { success: true };
}

// ─── Sign In ────────────────────────────────────────────────────────────────

export async function signIn(formData) {
  const supabase = await createClient();
  const identity = formData.get("email"); // SignInForm uses "email" for both, so treat it as identity
  const password = formData.get("password");

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identity);
  const credentials = isEmail 
    ? { email: identity, password } 
    : { phone: identity, password };

  const { data, error } = await supabase.auth.signInWithPassword(credentials);
  if (error) return { error: error.message };

  // Read role from metadata (set at signup time)
  let role = data.user?.user_metadata?.role;

  // If no role in metadata, check profiles table as fallback
  if (!role) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();
    role = profile?.role ?? null;
  }

  revalidatePath("/", "layout");

  // Route specifically for wholesalers using status logic
  if (role === "wholesaler") {
    const dest = await getWholesalerDestination(data.user.id);
    if (dest.includes("error=banned")) {
      await supabase.auth.signOut();
    }
    redirect(dest);
  }

  redirect(roleDestination(role));
}

// ─── Sign Out ───────────────────────────────────────────────────────────────

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/signin");
}

export async function onboardSignOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/entry_page/signup");
}

export async function terminalUserExit(actionRoute) {
  const supabase = await createClient();
  if (actionRoute.includes("/entry_page")) {
    await supabase.auth.signOut();
  }
  revalidatePath("/", "layout");
  redirect(actionRoute);
}
