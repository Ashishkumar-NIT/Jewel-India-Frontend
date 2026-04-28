import { createClient } from "../../../../lib/supabase/server";
import { redirect } from "next/navigation";
import WholesalerGalleryClient from "./WholesalerGalleryClient";

export const metadata = {
  title: "Wholesaler Gallery — Employee Dashboard",
  description: "Browse products from all wholesalers.",
};

/**
 * /dashboard/employee/wholesaler-gallery
 *
 * Server component that fetches products with optional server-side filtering,
 * then passes data to client for pre-filtered results and interactive refinement.
 */
export default async function WholesalerGalleryPage({ searchParams }) {
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

  // Read filter params — default to "all" / empty search
  const categoryParam = searchParams?.category || "all";
  const searchParam = searchParams?.q || "";

  // Build the Supabase query with server-side filters applied
  let query = supabase
    .from("products")
    .select(
      `id,
       title,
       jewellery_type,
       category,
       style,
       size,
       stock_available,
       make_to_order_days,
       metal_purity,
       net_weight,
       gross_weight,
       stone_weight,
       raw_image_url,
       processed_image_url,
       generated_image_urls,
       wholesaler_email,
       created_at`
    )
    .order("created_at", { ascending: false });

  // Apply category filter server-side
  if (categoryParam && categoryParam.toLowerCase() !== "all") {
    query = query.or(
      `category.ilike.%${categoryParam}%,jewellery_type.ilike.%${categoryParam}%`
    );
  }

  // Apply search filter server-side (title + jewellery_type + style)
  if (searchParam.trim()) {
    const q = searchParam.trim();
    query = query.or(
      `title.ilike.%${q}%,jewellery_type.ilike.%${q}%,style.ilike.%${q}%`
    );
  }

  const { data: products } = await query;

  // Extract unique categories from ALL products (for filter tabs — always show full set)
  const { data: allProducts } = await supabase
    .from("products")
    .select("category, jewellery_type")
    .order("created_at", { ascending: false });

  const categorySet = new Set();
  (allProducts || []).forEach((p) => {
    if (p.category) categorySet.add(p.category);
    if (p.jewellery_type) categorySet.add(p.jewellery_type);
  });
  const categoryTabs = ["All", ...Array.from(categorySet).sort()];

  return (
    <WholesalerGalleryClient
      products={products || []}
      categoryTabs={categoryTabs}
      initialCategory={categoryParam}
      initialSearch={searchParam}
    />
  );
}
