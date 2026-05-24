import { createClient } from "../../../../lib/supabase/server";
import { redirect } from "next/navigation";
import EmployeeOrdersClient from "../../../../components/employee/EmployeeOrdersClient";

export const metadata = {
  title: "Orders — Employee Dashboard",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EmployeeOrdersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/entry_page/signin");

  const { data: employee } = await supabase
    .from("employees")
    .select("id, retailer_id")
    .eq("auth_user_id", user.id)
    .single();

  if (!employee) redirect("/entry_page/signin");

  // Fetch orders from API or server-side using Admin client to bypass RLS
  const { supabaseAdmin } = await import("../../../../lib/supabase/admin");
  const { data: rawOrders, error } = await supabaseAdmin
    .from("orders")
    .select(`
      *,
      products (
        id, title, raw_image_url, processed_image_url, generated_image_urls, jewellery_type, metal_purity, net_weight, category, make_to_order_days
      ),
      retailers (
        id, business_name, city, state, created_at
      )
    `)
    .eq("retailer_id", employee.retailer_id)
    .eq("is_visible_to_employee", true)
    .order("created_at", { ascending: false });

  let orders = rawOrders || [];

  if (orders.length > 0) {
    const wholesalerUserIds = [...new Set(orders.map(o => o.wholesaler_id))];
    const { data: wholesalers } = await supabaseAdmin
      .from("wholesalers")
      .select("id, user_id, business_name, city, state, created_at, email, full_name")
      .in("user_id", wholesalerUserIds);
      
    if (wholesalers) {
      const wMap = {};
      wholesalers.forEach(w => wMap[w.user_id] = w);
      orders = orders.map(o => ({
        ...o,
        wholesalers: wMap[o.wholesaler_id] || null
      }));
    }
  }

  if (error) {
    console.error("[employee/orders] fetch error:", error.message);
  }

  return <EmployeeOrdersClient initialOrders={orders || []} />;
}
