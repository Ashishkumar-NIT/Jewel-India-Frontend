import { createClient } from "../../../../lib/supabase/server";
import { redirect } from "next/navigation";
import OrdersClient from "../../../../components/wholesaler/orders/OrdersClient";
import { supabaseAdmin } from "../../../../lib/supabase/admin";

export const metadata = {
  title: "Orders — Wholesaler Dashboard",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function WholesalerOrdersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/entry_page/signin");

  const { data: wholesaler } = await supabase
    .from("wholesalers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!wholesaler) redirect("/entry_page/signin");

  // Reset new activity indicator
  await supabase
    .from("wholesalers")
    .update({ last_checked_orders_at: new Date().toISOString() })
    .eq("id", wholesaler.id);

  // Fetch orders using supabaseAdmin to bypass RLS on nested tables (e.g. retailers)
  const { data: orders, error } = await supabaseAdmin
    .from("orders")
    .select(`
      *,
      products (
        id, title, raw_image_url, processed_image_url, generated_image_urls, jewellery_type, metal_purity, net_weight, category, make_to_order_days
      ),
      employees (
        id, auth_user_id
      ),
      retailers (
        id, business_name, city, state, created_at, email, full_name
      )
    `)
    .eq("wholesaler_id", user.id)
    .eq("is_visible_to_wholesaler", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[wholesaler/orders] fetch error:", error.message);
  }

  return <OrdersClient initialOrders={orders || []} />;
}