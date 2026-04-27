import { createClient } from "../../../../lib/supabase/server";
import { supabaseAdmin } from "../../../../lib/supabase/admin";
import { redirect } from "next/navigation";
import ReferralManager from "../../../../components/wholesaler/referral/ReferralManager";

export const metadata = {
  title: "Add Retailer — Jewel India",
  description: "Generate referral links to invite retailers.",
};

export default async function AddRetailerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/entry_page/signin");

  const role = user.user_metadata?.role;
  if (role !== "wholesaler") redirect("/");

  const { data: wholesaler } = await supabaseAdmin
    .from("wholesalers")
    .select("id, business_name, verification_status")
    .eq("user_id", user.id)
    .single();

  if (!wholesaler || wholesaler.verification_status !== "verified") {
    redirect("/onboard/submitted");
  }

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

  return (
    <main className="min-h-screen bg-white">
      <div style={{ padding: "48px 64px", maxWidth: "1000px", fontFamily: "'Inter', sans-serif" }}>
        {/* Header Section */}
        <div style={{ marginBottom: "56px" }}>
          <h1 style={{ fontSize: "36px", fontWeight: 700, color: "#111111", margin: "0 0 12px 0", letterSpacing: "-0.02em" }}>
            Referral
          </h1>
          <p style={{ fontSize: "15px", color: "#6B7280", margin: 0 }}>
            Grow your retailer network by sharing a simple invite link. Every signup is automatically linked to you.
          </p>
        </div>

        {/* 3-Step Flow Section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", marginBottom: "80px" }}>
          
          {/* Arrow 1 */}
          <svg style={{ position: "absolute", top: "15px", left: "16.66%", width: "33.33%", height: "30px", zIndex: 0, overflow: "visible" }} preserveAspectRatio="none" viewBox="0 0 100 30">
            <path d="M15,30 Q50,-10 85,30" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeDasharray="6, 6" />
          </svg>

          {/* Arrow 2 */}
          <svg style={{ position: "absolute", top: "15px", left: "50%", width: "33.33%", height: "30px", zIndex: 0, overflow: "visible" }} preserveAspectRatio="none" viewBox="0 0 100 30">
            <path d="M15,30 Q50,-10 85,30" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeDasharray="6, 6" />
          </svg>

          {/* Step 1 */}
          <div style={{ flex: 1, textAlign: "center", position: "relative", zIndex: 1 }}>
             <img src="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777306586/LINK_spu884.svg" alt="Share the link" style={{ width: "90px", height: "90px", margin: "0 auto 16px" }} />
             <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#111", margin: "0 0 8px 0" }}>1. Share the link</h3>
             <p style={{ fontSize: "13px", color: "#6B7280", margin: 0, padding: "0 20px" }}>Invite retailers by sending them a unique link.</p>
          </div>

          {/* Step 2 */}
          <div style={{ flex: 1, textAlign: "center", position: "relative", zIndex: 1 }}>
             <img src="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777306586/signup_vlrosz.svg" alt="Signup" style={{ width: "90px", height: "90px", margin: "0 auto 16px" }} />
             <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#111", margin: "0 0 8px 0" }}>2. Signup</h3>
             <p style={{ fontSize: "13px", color: "#6B7280", margin: 0, padding: "0 20px" }}>They join using your link and get linked to your account.</p>
          </div>

          {/* Step 3 */}
          <div style={{ flex: 1, textAlign: "center", position: "relative", zIndex: 1 }}>
             <img src="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777306585/retailerShop_iashfb.svg" alt="Retailer shop setup" style={{ width: "90px", height: "90px", margin: "0 auto 16px" }} />
             <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#111", margin: "0 0 8px 0" }}>3. Retailer shop setup</h3>
             <p style={{ fontSize: "13px", color: "#6B7280", margin: 0, padding: "0 20px" }}>Retailers complete their store setup and go live.</p>
          </div>

        </div>

        {/* Main content - ReferralManager */}
        <ReferralManager initialLinks={initialLinks} />
      </div>
    </main>
  );
}
