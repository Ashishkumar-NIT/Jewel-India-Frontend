import HeroUploadSection from "../../../components/wholesaler/HeroUploadSection";
import OverviewSection from "../../../components/wholesaler/OverviewSection";
import NavigationTabs from "../../../components/wholesaler/NavigationTabs";
import CatalogueSection from "../../../components/wholesaler/CatalogueSection";
import { createClient } from "../../../lib/supabase/server";

export default async function WholesalerDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: wholesaler } = await supabase
      .from("wholesalers")
      .select("has_visited_dashboard")
      .eq("user_id", user.id)
      .single();

    if (wholesaler && !wholesaler.has_visited_dashboard) {
      await supabase
        .from("wholesalers")
        .update({ has_visited_dashboard: true })
        .eq("user_id", user.id);
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <HeroUploadSection />
      <OverviewSection />
      <NavigationTabs />
      <CatalogueSection />
    </main>
  );
}
