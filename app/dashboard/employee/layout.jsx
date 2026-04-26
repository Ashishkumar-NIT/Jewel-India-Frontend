import { createClient } from "../../../lib/supabase/server";
import { redirect } from "next/navigation";
import EmployeeLayout from "../../../components/employee/EmployeeLayout";

export const metadata = {
  title: "Employee Dashboard — Jewel India",
  description: "View your store designs, browse wholesaler products, and manage messages.",
};

/**
 * Server layout for /dashboard/employee/*.
 * Fetches the authenticated employee's record + parent retailer info,
 * then passes it to the client EmployeeLayout wrapper.
 */
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

  return (
    <EmployeeLayout
      employeeName={employee.full_name}
      businessName={businessName}
    >
      {children}
    </EmployeeLayout>
  );
}
