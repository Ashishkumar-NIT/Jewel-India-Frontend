import { createClient } from "../../../../lib/supabase/server";
import { supabaseAdmin } from "../../../../lib/supabase/admin";
import { redirect } from "next/navigation";
import ReferralManager from "../../../../components/wholesaler/referral/ReferralManager";

export const metadata = {
  title: "Add Retailer — Jewel India",
  description: "Generate referral links to invite retailers.",
};

/**
 * Server component.
 * Fetches the wholesaler record + existing referral links,
 * then renders the ReferralManager client component.
 */
export default async function AddRetailerPage() {
  // ── 1. Auth check ────────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/entry_page/signin");

  const role = user.user_metadata?.role;
  if (role !== "wholesaler") redirect("/");

  // ── 2. Wholesaler record ─────────────────────────────────────────
  const { data: wholesaler } = await supabaseAdmin
    .from("wholesalers")
    .select("id, business_name, verification_status")
    .eq("user_id", user.id)
    .single();

  if (!wholesaler || wholesaler.verification_status !== "verified") {
    redirect("/onboard/submitted");
  }

  // ── 3. Existing referral links ───────────────────────────────────
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";

  const { data: rawLinks } = await supabaseAdmin
    .from("referral_links")
    .select("id, code, uses_count, max_uses, is_active, created_at")
    .eq("wholesaler_id", wholesaler.id)
    .order("created_at", { ascending: false });

  const initialLinks = (rawLinks ?? []).map((l) => ({
    ...l,
    link: `${siteUrl}/join/${l.code}`,
  }));

  // ── 4. Render ────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-white pb-20">
      {/* ── Page header ──────────────────────────────────────────── */}
      <div
        style={{
          borderBottom: "1px solid #E5E7EB",
          padding: "28px 32px 24px",
          backgroundColor: "#FFFFFF",
        }}
      >
        <p
          style={{
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "#9CA3AF",
            fontWeight: 600,
            marginBottom: "6px",
          }}
        >
          {wholesaler.business_name}
        </p>
        <h1
          style={{
            fontSize: "26px",
            fontWeight: 700,
            color: "#111111",
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          Invite Retailers
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "#6B7280",
            marginTop: "6px",
            maxWidth: "520px",
            lineHeight: 1.5,
          }}
        >
          Generate a unique referral link and share it with retailers you want to onboard.
          Each link tracks who signs up through it.
        </p>
      </div>

      {/* ── Main content ─────────────────────────────────────────── */}
      <div style={{ padding: "32px" }}>
        <ReferralManager initialLinks={initialLinks} />
      </div>
    </main>
  );
}
