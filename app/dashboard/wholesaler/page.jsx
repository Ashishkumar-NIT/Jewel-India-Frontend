import { createClient } from "../../../lib/supabase/server";
import { getAuthUser } from "../../../lib/supabase/queries";
import HeroUploadSection from "../../../components/wholesaler/HeroUploadSection";
import OverviewSection from "../../../components/wholesaler/OverviewSection";
import WeeklyReviewBanner from "../../../components/wholesaler/WeeklyReviewBanner";
import CatalogueSection from "../../../components/wholesaler/CatalogueSection";
import { SignOutButton } from "../../../components/auth/SignOutButton";

export default async function WholesalerDashboardPage() {
  const user = await getAuthUser();
  const supabase = await createClient();
  let businessName = "";

  if (user) {
    let wholesaler = null;

    if (user.email) {
      const { data } = await supabase
        .from("wholesalers")
        .select("has_visited_dashboard, business_name, full_name")
        .eq("email", user.email)
        .maybeSingle();
      wholesaler = data;
    }

    if (!wholesaler) {
      const { data } = await supabase
        .from("wholesalers")
        .select("has_visited_dashboard, business_name, full_name")
        .eq("user_id", user.id)
        .maybeSingle();
      wholesaler = data;
    }

    businessName =
      wholesaler?.business_name ||
      wholesaler?.full_name ||
      (user.email ? user.email.split("@")[0] : "");

    if (wholesaler && !wholesaler.has_visited_dashboard) {
      supabase
        .from("wholesalers")
        .update({ has_visited_dashboard: true })
        .eq("user_id", user.id)
        .then(() => {})
        .catch(() => {});
    }
  }

  const userIdentifier = user?.email || user?.phone || "";

  return (
    <main className="min-h-screen bg-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between bg-white px-4 md:px-10 py-6">
        <h1 className="text-[24px] font-bold text-[#111]">Home</h1>
      </header>

      <HeroUploadSection businessName={businessName} />
      <OverviewSection />
      <WeeklyReviewBanner />
      <CatalogueSection />
    </main>
  );
}
