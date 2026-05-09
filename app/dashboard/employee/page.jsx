import { createClient } from "../../../lib/supabase/server";
import { supabaseAdmin } from "../../../lib/supabase/admin";
import { redirect } from "next/navigation";
import EmployeeHomeClient from "../../../components/employee/EmployeeHomeClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EmployeeDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/entry_page/signin");

  // Fetch employee record
  const { data: employee } = await supabase
    .from("employees")
    .select("id, full_name, designation, retailer_id")
    .eq("auth_user_id", user.id)
    .single();

  if (!employee) redirect("/entry_page/signin");

  // Fetch parent retailer
  const { data: retailer } = await supabase
    .from("retailers")
    .select("id, business_name")
    .eq("id", employee.retailer_id)
    .single();

  const businessName = retailer?.business_name || "Your Store";

  // Fetch non-archived designs for the Designer Collection using Admin to bypass RLS
  const { data: designs } = await supabaseAdmin
    .from("retailer_designs")
    .select("id, image_url, title, category, tags, is_archived, created_at")
    .eq("retailer_id", employee.retailer_id)
    .eq("is_archived", false);

  // We will pass the designs to the client component to be randomized per-employee
  // The template index will also be determined on the client to avoid SSR hydration mismatches,
  // or we can pass the employee.id to the client to seed the random logic.

  return (
    <EmployeeHomeClient 
      employee={employee}
      businessName={businessName}
      designs={designs || []}
    />
  );
}
