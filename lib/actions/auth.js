"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../supabase/server";
import { supabaseAdmin } from "../supabase/admin";
import { getURL } from "../utils/url";

function roleDestination(role) {
  if (role === "wholesaler") return "/dashboard/wholesaler";
  if (role === "retailer") return "/dashboard/retailer";
  if (role === "employee") return "/dashboard/employee";
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
    return "/onboard/submitted"; 
  }

  return "/onboard/submitted";
}

export async function getRetailerDestination(userId) {
  const supabase = await createClient();
  const { data: retailer } = await supabase
    .from("retailers")
    .select("verification_status")
    .eq("user_id", userId)
    .single();

  if (!retailer) return "/onboard-retailer";

  if (retailer.verification_status === "banned") {
    return "/entry_page/signup?error=banned";
  }

  if (retailer.verification_status === "verified") {
    return "/dashboard/retailer";
  }

 
  return "/onboard-retailer/submitted";
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
  } else if (role === "retailer") {
    const dest = await getRetailerDestination(data.user.id);
    if (dest.includes("error=banned")) {
      await supabase.auth.signOut();
    }
    redirect(dest);
  } else if (role === "employee") {
    const { data: employeeData } = await supabase
      .from("employees")
      .select("status")
      .eq("auth_user_id", data.user.id)
      .single();

    if (employeeData && employeeData.status !== "active") {
      await supabase.auth.signOut();
      return { error: "Your account has been deactivated by the store administrator." };
    }
    
    redirect("/dashboard/employee");
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

// ─── Password Reset ────────────────────────────────────────────────────────

export async function requestPasswordReset(email) {
  const supabase = await createClient();
  
  if (!email) {
    return { error: "Email is required" };
  }

  // 1. Verify user exists using Admin API
  const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (listError) {
    return { error: "Server error while verifying email." };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const userExists = usersData.users.some(
    (u) => u.email?.toLowerCase() === normalizedEmail
  );

  if (!userExists) {
    return { error: "No account found with this email address." };
  }

  // 2. Send the reset link
  const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
    redirectTo: `${getURL()}/auth/callback?next=/update-password`,
  });

  if (error) return { error: error.message };

  return { success: true };
}

export async function updatePassword(password) {
  const supabase = await createClient();
  
  if (!password || password.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }

  const { error } = await supabase.auth.updateUser({
    password: password
  });

  if (error) return { error: error.message };

  return { success: true };
}
