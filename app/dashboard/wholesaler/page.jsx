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
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[#e5e5e5] bg-white px-4 md:px-10 py-2.5">
        {/* Left - Sign Out and User Email */}
        <div className="flex flex-row items-center gap-4">
          <SignOutButton />
          {userIdentifier && (
            <span className="hidden md:inline text-[13px] text-[#6B7280] font-sfpro">
              {userIdentifier}
            </span>
          )}
        </div>

        {/* Right - Search Bar */}
        <div className="flex items-center gap-2 bg-[#F9FAFB] px-3 py-2 rounded-md border-none">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#9CA3AF]">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Search" 
            className="bg-transparent border-none outline-none text-[13px] font-sfpro text-gray-700 placeholder-[#9CA3AF] w-32 md:w-64"
            readOnly
          />
        </div>
      </header>

      <HeroUploadSection businessName={businessName} />
      <OverviewSection />
      <WeeklyReviewBanner />
      <CatalogueSection />
    </main>
  );
}
