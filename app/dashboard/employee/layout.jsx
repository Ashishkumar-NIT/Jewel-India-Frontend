import { createClient } from "../../../lib/supabase/server";
import { redirect } from "next/navigation";
import EmployeeLayout from "../../../components/employee/EmployeeLayout";

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

  // Fetch the employee record linked to this auth user
  const { data: employee, error: empError } = await supabase
    .from("employees")
    .select("id, full_name, designation, retailer_id, status")
    .eq("auth_user_id", user.id)
    .single();

  if (empError || !employee) {
    // Edge case: user has 'employee' role but no row in employees table
    redirect("/entry_page/signin");
  }

  // Fetch the parent retailer's business name
  const { data: retailer } = await supabase
    .from("retailers")
    .select("id, business_name")
    .eq("id", employee.retailer_id)
    .single();

  const businessName = retailer?.business_name || "Your Store";

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

  return (
    <EmployeeLayout
      employeeName={employee.full_name}
      businessName={businessName}
      hasUnreadQueries={hasUnreadQueries}
      latestOrderUpdate={latestOrderUpdate}
    >
      {children}
    </EmployeeLayout>
  );
}
