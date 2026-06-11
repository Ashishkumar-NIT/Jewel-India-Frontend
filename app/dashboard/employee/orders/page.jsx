import { createClient } from "../../../../lib/supabase/server";
import { redirect } from "next/navigation";
import EmployeeOrdersClient from "../../../../components/employee/EmployeeOrdersClient";
import { getEmployeeOrders } from "../../../../lib/cache/retailerEmployee";

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

  const orders = await getEmployeeOrders(employee.retailer_id);

  return <EmployeeOrdersClient initialOrders={orders || []} />;
}
