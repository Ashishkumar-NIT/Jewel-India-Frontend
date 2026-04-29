"use server";

import { createClient } from "../supabase/server";

/**
 * Save a user's role to both profiles table and user metadata.
 * Used after Google OAuth sign-in if the user doesn't have a role yet.
 */
export async function setUserRole(role) {
  if (!["wholesaler", "retailer"].includes(role)) {
    return { error: "Invalid role." };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  // Update user metadata
  const { error: metaError } = await supabase.auth.updateUser({
    data: { role },
  });
  if (metaError) return { error: metaError.message };

  // Upsert into profiles table
  const { error: profileError } = await supabase.from("profiles").upsert(
    { id: user.id, email: user.email, role },
    { onConflict: "id" }
  );
  if (profileError) return { error: profileError.message };

  return { success: true, role };
}

/**
 * Get the current user's role from Supabase profiles table.
 * Falls back to user_metadata if profile row doesn't exist yet.
 */
export async function getUserRole() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Try metadata first (fastest — from JWT)
  if (user.user_metadata?.role) return user.user_metadata.role;

  // Fallback: query profiles table
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return data?.role ?? null;
}
