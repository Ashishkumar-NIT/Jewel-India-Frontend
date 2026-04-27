import { createClient } from "../../../../lib/supabase/server";
import { supabaseAdmin } from "../../../../lib/supabase/admin";
import { redirect } from "next/navigation";
import ReferralManager from "../../../../components/wholesaler/referral/ReferralManager";
import styles from "./addRetailer.module.css";

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
      <div className={styles.container}>
        {/* Header Section */}
        <div className={styles.header}>
          <h1 className={styles.title}>
            Referral
          </h1>
          <p className={styles.subtitle}>
            Grow your retailer network by sharing a simple invite link. Every signup is automatically linked to you.
          </p>
        </div>

        {/* 3-Step Flow Section */}
        <div className={styles.flowContainer}>
          
          {/* Arrow 1 */}
          <svg className={`${styles.arrow} ${styles.arrow1}`} preserveAspectRatio="none" viewBox="0 0 100 30">
            <path d="M15,30 Q50,-10 85,30" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeDasharray="6, 6" />
          </svg>

          {/* Arrow 2 */}
          <svg className={`${styles.arrow} ${styles.arrow2}`} preserveAspectRatio="none" viewBox="0 0 100 30">
            <path d="M15,30 Q50,-10 85,30" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeDasharray="6, 6" />
          </svg>

          {/* Step 1 */}
          <div className={styles.step}>
             <img src="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777306586/LINK_spu884.svg" alt="Share the link" className={styles.stepIcon} />
             <h3 className={styles.stepTitle}>1. Share the link</h3>
             <p className={styles.stepDesc}>Invite retailers by sending them a unique link.</p>
          </div>

          <div className={styles.verticalArrow}></div>

          {/* Step 2 */}
          <div className={styles.step}>
             <img src="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777306586/signup_vlrosz.svg" alt="Signup" className={styles.stepIcon} />
             <h3 className={styles.stepTitle}>2. Signup</h3>
             <p className={styles.stepDesc}>They join using your link and get linked to your account.</p>
          </div>

          <div className={styles.verticalArrow}></div>

          {/* Step 3 */}
          <div className={styles.step}>
             <img src="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777306585/retailerShop_iashfb.svg" alt="Retailer shop setup" className={styles.stepIcon} />
             <h3 className={styles.stepTitle}>3. Retailer shop setup</h3>
             <p className={styles.stepDesc}>Retailers complete their store setup and go live.</p>
          </div>

        </div>

        {/* Main content - ReferralManager */}
        <ReferralManager initialLinks={initialLinks} />
      </div>
    </main>
  );
}
