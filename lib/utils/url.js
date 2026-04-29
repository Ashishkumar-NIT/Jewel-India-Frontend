
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
