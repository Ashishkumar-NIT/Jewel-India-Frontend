// ─── Browser-side OAuth initiator ───────────────────────────────────────────
// NOTE: This file must NOT have "use server".
// OAuth must be initiated from the browser client so that Supabase can store
// the PKCE code_verifier in a cookie the browser controls, ensuring it survives
// the Google redirect → /auth/callback round-trip.
import { createClient } from "../supabase/client";

/**
 * Starts Google OAuth from the browser.
 * @param {string} redirectTo - The full URL to return to after Google auth
 *                              (e.g. window.location.origin + "/auth/callback")
 */
export async function initiateGoogleOAuth(redirectTo) {
  const supabase = createClient(); // browser client — manages PKCE cookie itself

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: {
        access_type: "offline",
        prompt: "consent", // forces re-consent, prevents stale verifier on re-login
      },
    },
  });

  if (error) return { error: error.message };

  // Navigate the browser to the Google consent screen
  if (data?.url) {
    window.location.href = data.url;
  }
}
