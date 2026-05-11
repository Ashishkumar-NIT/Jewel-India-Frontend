import { createClient } from "../../../lib/supabase/server";
import { getAuthUser } from "../../../lib/supabase/queries";
import HeroUploadSection from "../../../components/wholesaler/HeroUploadSection";
import OverviewSection from "../../../components/wholesaler/OverviewSection";
import WeeklyReviewBanner from "../../../components/wholesaler/WeeklyReviewBanner";
import CatalogueSection from "../../../components/wholesaler/CatalogueSection";
export default async function WholesalerDashboardPage() {
  const user = await getAuthUser();
  const supabase = await createClient();
  let businessName = "";

  let wholesaler = null;
  if (user) {
    if (user.email) {
      const { data } = await supabase
        .from("wholesalers")
        .select("id, has_visited_dashboard, business_name, full_name, last_checked_orders_at")
        .eq("email", user.email)
        .maybeSingle();
      wholesaler = data;
    }

    if (!wholesaler) {
      const { data } = await supabase
        .from("wholesalers")
        .select("id, has_visited_dashboard, business_name, full_name, last_checked_orders_at")
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
        .catch(() => {});
    }
  }

  // 1. Fetch real live products count
  const { count: liveProductsCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("wholesaler_id", wholesaler?.id);

  // 2. Fetch pending orders count
  const { count: pendingOrdersCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("wholesaler_id", wholesaler?.id)
    .eq("status", "pending");

  // 3. Check for new orders since last visit
  const { data: latestPendingOrder } = await supabase
    .from("orders")
    .select("created_at")
    .eq("wholesaler_id", wholesaler?.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const hasNewOrders = latestPendingOrder && wholesaler?.last_checked_orders_at
    ? new Date(latestPendingOrder.created_at) > new Date(wholesaler.last_checked_orders_at)
    : !!latestPendingOrder;

  return (
    <main className="min-h-screen bg-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between bg-white px-4 md:px-10 py-6">
        <h1 className="text-[24px] font-bold text-[#111]">Home</h1>
      </header>

      <HeroUploadSection businessName={businessName} />
      <OverviewSection 
        productCount={liveProductsCount || 0} 
        pendingCount={pendingOrdersCount || 0}
        hasNewOrders={hasNewOrders}
      />
      <CatalogueSection />
    </main>
  );
}
