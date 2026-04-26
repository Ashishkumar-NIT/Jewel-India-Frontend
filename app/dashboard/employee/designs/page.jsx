import { createClient } from "../../../../lib/supabase/server";
import { redirect } from "next/navigation";
import { categories as baseCategories } from "../../../../lib/config/catalogueCategories";
import EmployeeDesignsClient from "./EmployeeDesignsClient";

export const metadata = {
  title: "Our Designs — Employee Dashboard",
  description: "Browse your store's design catalogue.",
};

/**
 * /dashboard/employee/designs
 *
 * Server component that fetches the parent retailer's non-archived designs
 * and hands them to a client component for filtering / display.
 */
export default async function EmployeeDesignsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/entry_page/signin");

  // Get employee → retailer_id
  const { data: employee } = await supabase
    .from("employees")
    .select("retailer_id")
    .eq("auth_user_id", user.id)
    .single();

  if (!employee) redirect("/entry_page/signin");

  // Get the parent retailer's name
  const { data: retailer } = await supabase
    .from("retailers")
    .select("business_name")
    .eq("id", employee.retailer_id)
    .single();

  // Fetch non-archived designs from the parent retailer
  const { data: designs } = await supabase
    .from("retailer_designs")
    .select("id, image_url, title, category, tags, created_at")
    .eq("retailer_id", employee.retailer_id)
    .eq("is_archived", false)
    .order("created_at", { ascending: false });

  // Build the category list from base categories + any custom ones in designs
  const designCategories = (designs || [])
    .map((d) => d.category)
    .filter(Boolean);
  const allCategoryNames = [
    "All",
    ...baseCategories.map((c) => c.name),
    ...designCategories,
  ];
  const seen = new Set();
  const categoryTabs = allCategoryNames.filter((name) => {
    const key = name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return (
    <EmployeeDesignsClient
      designs={designs || []}
      categoryTabs={categoryTabs}
      businessName={retailer?.business_name || "Your Store"}
    />
  );
}
