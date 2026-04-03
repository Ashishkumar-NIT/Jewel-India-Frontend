/**
 * Returns the canonical base URL of the app.
 *
 * Priority:
 *  1. NEXT_PUBLIC_SITE_URL          — set manually in .env / Vercel dashboard
 *  2. VERCEL_PROJECT_PRODUCTION_URL — injected by Vercel for the production deployment
 *  3. NEXT_PUBLIC_VERCEL_URL        — injected by Vercel for preview deployments
 *  4. VERCEL_URL                    — legacy Vercel fallback
 *  5. http://localhost:3000          — local development
 *
 * NOTE: This file must NOT have "use server" so it can be imported
 *       from Server Actions, Server Components, API routes, and client code alike.
 */
export function getURL() {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ??
    process?.env?.VERCEL_PROJECT_PRODUCTION_URL ??
    process?.env?.NEXT_PUBLIC_VERCEL_URL ??
    process?.env?.VERCEL_URL ??
    "http://localhost:3000";

  // Ensure the URL always has a scheme
  url = url.includes("http") ? url : `https://${url}`;

  // Strip trailing slash for consistent concatenation
  url = url.replace(/\/$/, "");

  return url;
}
