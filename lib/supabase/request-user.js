import { supabaseAdmin } from "./admin.js";
import { createClient } from "./server.js";

/**
 * Resolve the caller from either a normal Next/Supabase cookie session or a
 * native-app Bearer token. This keeps the web and iOS clients on the same API
 * without trusting a user id supplied in a request body.
 */
export async function getRequestUser(request) {
  const authorization = request.headers.get("authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);

  if (match) {
    const { data, error } = await supabaseAdmin.auth.getUser(match[1]);
    return { user: data?.user ?? null, error };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  return { user: data?.user ?? null, error };
}
