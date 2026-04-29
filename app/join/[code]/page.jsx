import { notFound } from "next/navigation";
import JoinLandingClient from "./JoinLandingClient";

/**
 * Server component — validates the referral code on the server,
 * then passes the wholesaler info down to the client component.
 *
 * Route: /join/[code]
 */
export async function generateMetadata({ params }) {
  const { code } = await params;
  return {
    title: "You've been invited — Jewel India",
    description: `Join via referral code ${code} to get started as a retailer.`,
  };
}

export default async function JoinPage({ params }) {
  const { code } = await params;

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";

  let referralData = null;

  try {
    const res = await fetch(`${baseUrl}/api/referral/validate?code=${encodeURIComponent(code)}`, {
      cache: "no-store",
    });

    if (res.ok) {
      const json = await res.json();
      if (json.valid) {
        referralData = json;
      }
    }
  } catch (err) {
    console.error("[/join/[code]] Validation fetch error:", err);
  }

  // ── Invalid / expired / maxed-out code → 404 ───────────────────
  if (!referralData) {
    notFound();
  }

  return (
    <JoinLandingClient
      code={code}
      businessName={referralData.business_name}
      wholesalerName={referralData.wholesaler_name}
      businessLogoUrl={referralData.business_logo_url}
    />
  );
}
