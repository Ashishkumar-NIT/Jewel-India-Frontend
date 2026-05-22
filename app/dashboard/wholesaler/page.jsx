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
      await supabase
        .from("wholesalers")
        .update({ has_visited_dashboard: true })
        .eq("user_id", user.id);
    }
  }

  // 1. Fetch real live products count
  const { count: liveProductsCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("wholesaler_id", user?.id);

  // 2. Fetch pending orders count
  const { count: pendingOrdersCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("wholesaler_id", user?.id)
    .eq("status", "pending");

  // 3. Set badge visibility (red dot will show as long as there are pending orders to act on)
  const hasNewOrders = pendingOrdersCount > 0;

  // 4. Fetch unread chats count (conversations with unread messages from employees)
  const { data: unreadConversations } = await supabase
    .from("conversations")
    .select(`id, messages!inner(id)`)
    .eq("wholesaler_id", user?.id)
    .eq("messages.sender_type", "employee")
    .eq("messages.is_read", false);

  // We only count unique conversations, regardless of how many messages are in each
  const chatsCount = unreadConversations ? unreadConversations.length : 0;
  const hasNewChats = chatsCount > 0;

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
        chatsCount={chatsCount || 0}
        hasNewChats={hasNewChats}
      />
      <CatalogueSection />
    </main>
  );
}
