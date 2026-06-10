import { createClient } from "../../../lib/supabase/server";
import { redirect } from "next/navigation";
import EmployeeLayout from "../../../components/employee/EmployeeLayout";
import { ensureVirtualEmployee } from "../../../lib/supabase/queries";

export const metadata = {
  title: "Employee Dashboard — Jewel India",
  description: "View your store designs, browse wholesaler products, and manage messages.",
};

export default async function EmployeeDashboardLayout({ children }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entry_page/signin");
  }

  // Fetch the employee record linked to this auth user, auto-provisioning if retailer admin
  const employee = await ensureVirtualEmployee(user);

  if (!employee) {
    redirect("/entry_page/signin");
  }

  // Fetch the parent retailer's business name and selected theme
  let selectedTheme = "indian";
  let businessName = "Your Store";

  const { data: retailer, error: retailerError } = await supabase
    .from("retailers")
    .select("id, business_name, selected_theme")
    .eq("id", employee.retailer_id)
    .single();

  if (retailerError) {
    // Fallback to querying without selected_theme
    const { data: fallbackRetailer } = await supabase
      .from("retailers")
      .select("id, business_name")
      .eq("id", employee.retailer_id)
      .single();
    if (fallbackRetailer) {
      businessName = fallbackRetailer.business_name || "Your Store";
    }
  } else if (retailer) {
    businessName = retailer.business_name || "Your Store";
    selectedTheme = retailer.selected_theme || "indian";
  }


  // Check for unread queries
  const { data: unreadConversations } = await supabase
    .from("conversations")
    .select(`id, messages!inner(id)`)
    .eq("employee_id", employee.id)
    .eq("messages.sender_type", "wholesaler")
    .eq("messages.is_read", false);

  const hasUnreadQueries = unreadConversations && unreadConversations.length > 0;
  
  // Check for order updates (orders that are no longer pending)
  // We get the most recent update timestamp to compare with local storage on the client
  const { data: latestOrder } = await supabase
    .from("orders")
    .select("updated_at")
    .eq("employee_id", employee.id)
    .neq("status", "pending")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const latestOrderUpdate = latestOrder?.updated_at || null;

  const isRetailer = user.user_metadata?.role === "retailer";

  return (
    <EmployeeLayout
      employeeName={employee.full_name}
      businessName={businessName}
      hasUnreadQueries={hasUnreadQueries}
      latestOrderUpdate={latestOrderUpdate}
      isRetailer={isRetailer}
      selectedTheme={selectedTheme}
    >
      {children}
    </EmployeeLayout>
  );
}
