import { createClient } from "../../../../lib/supabase/server";
import { redirect } from "next/navigation";
import { getAllProducts } from "../../../../lib/api/supabase-products";
import WholesalerGalleryClient from "./WholesalerGalleryClient";

export const metadata = {
  title: "Wholesaler Gallery — Employee Dashboard",
  description: "Browse products from all wholesalers.",
};

/**
 * /dashboard/employee/wholesaler-gallery
 *
 * Server component that fetches ALL wholesaler products (public data)
 * and passes them to a client component for search / category filtering.
 */
export default async function WholesalerGalleryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/entry_page/signin");

  // Verify the user is an employee
  const { data: employee } = await supabase
    .from("employees")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (!employee) redirect("/entry_page/signin");

  // Fetch ALL wholesaler products (already filtered to processed only)
  const products = await getAllProducts();

  // Extract unique categories for filter tabs
  const categorySet = new Set();
  products.forEach((p) => {
    if (p.category) categorySet.add(p.category);
    if (p.jewellery_type) categorySet.add(p.jewellery_type);
  });
  const categoryTabs = ["All", ...Array.from(categorySet).sort()];

  return (
    <WholesalerGalleryClient
      products={products}
      categoryTabs={categoryTabs}
    />
  );
}
