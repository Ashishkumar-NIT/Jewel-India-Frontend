import { cache } from "react";
import { createClient } from "./server";
import { supabaseAdmin } from "./admin";

/**
 * Fetch the authenticated Supabase user, deduplicated for the current
 * request via React.cache().
 *
 * React.cache() is scoped per server render pass (per request). This means
 * no matter how many server components or server utilities call getAuthUser()
 * in a single render, Supabase's /auth/v1/user endpoint is hit EXACTLY ONCE.
 *
 * Do NOT use this in Server Actions — each action runs in its own request
 * context and must perform its own auth check for security.
 *
 * Returns the Supabase User object or null.
 */
export const getAuthUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
});

/**
 * Ensures a virtual employee profile exists for a retailer admin user.
 * If none exists, it auto-provisions one with 'Admin' designation.
 * Returns the employee profile or null.
 */
export async function ensureVirtualEmployee(user) {
  if (!user) return null;

  const supabase = await createClient();

  // Try to find employee record
  const { data: employee } = await supabase
    .from("employees")
    .select("id, full_name, designation, retailer_id, status")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (employee) {
    return employee;
  }

  // If role is retailer, auto-provision the admin profile
  if (user.user_metadata?.role === "retailer") {
    const { data: retailer } = await supabase
      .from("retailers")
      .select("id, full_name, business_name")
      .eq("user_id", user.id)
      .maybeSingle();

    if (retailer) {
      const fullName = retailer.full_name || user.user_metadata?.full_name || "Admin Owner";
      const baseInsertData = {
        auth_user_id: user.id,
        retailer_id: retailer.id,
        full_name: fullName,
        email: user.email,
        designation: "Admin",
        status: "active",
        password_plain: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      };

      // Auto-provision standard profile with is_system_generated
      const { data: newEmp, error: insertError } = await supabaseAdmin
        .from("employees")
        .insert({
          ...baseInsertData,
          is_system_generated: true,
        })
        .select()
        .maybeSingle();

      if (insertError) {
        console.warn("Failed to insert with is_system_generated, trying fallback...", insertError.message);
        const { data: fallbackEmp, error: fallbackError } = await supabaseAdmin
          .from("employees")
          .insert(baseInsertData)
          .select()
          .maybeSingle();

        if (!fallbackError) {
          return fallbackEmp;
        }
        console.error("Failed to auto-provision virtual employee profile in fallback:", fallbackError);
      } else {
        return newEmp;
      }
    }
  }

  return null;
}