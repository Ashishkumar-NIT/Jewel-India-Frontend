import { cache } from "react";
import { createClient } from "./server";

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