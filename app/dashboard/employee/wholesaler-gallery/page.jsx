import { createClient } from "../../../../lib/supabase/server";
import { supabaseAdmin } from "../../../../lib/supabase/admin";
import { redirect } from "next/navigation";
import WholesalerGalleryClient from "./WholesalerGalleryClient";
import { categories as configCategories } from "../../../../lib/config/catalogueCategories";

export const metadata = {
  title: "Wholesaler Gallery — Employee Dashboard",
  description: "Browse products selected by your retailer.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function WholesalerGalleryPage({ searchParams }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/entry_page/signin");

  // Get employee + their retailer_id in one query
  const { data: employee } = await supabase
    .from("employees")
    .select("id, retailer_id")
    .eq("auth_user_id", user.id)
    .single();

  if (!employee) redirect("/entry_page/signin");

  // Get the retailer_id (employees belong to a retailer)
  const retailerId = employee.retailer_id;

  // Read filter params
  const resolvedParams = await searchParams;
  const categoryParam = resolvedParams?.category || "all";

  let products = [];
  let categoryTabs = ["All"];

  if (!retailerId) {
    // Fallback: if no retailer linked, show nothing
    products = [];
  } else {
    // Use supabaseAdmin to bypass RLS — the employee has a different auth session
    // than the retailer, so the retailer_selections RLS would block them without service role.
    const { data: selections, error: selErr } = await supabaseAdmin
      .from("retailer_selections")
      .select("product_id")
      .eq("retailer_id", retailerId);

    if (selErr) {
      console.error("[employee/wholesaler-gallery] retailer_selections fetch error:", selErr.message);
    }

    const selectedIds = (selections || []).map((s) => s.product_id);

    if (selectedIds.length > 0) {
      // Fetch only the selected + published products
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
           wholesaler_id,
           wholesaler_email,
           created_at`
        )
        .eq("is_published", true)
        .in("id", selectedIds)
        .order("created_at", { ascending: false });

      // Apply category filter server-side
      if (categoryParam && categoryParam.toLowerCase() !== "all") {
        query = query.or(
          `category.ilike.%${categoryParam}%,jewellery_type.ilike.%${categoryParam}%,title.ilike.%${categoryParam}%`
        );
      }

      const { data } = await query;
      products = data || [];

      // Build category tabs from these selected products
      const categorySet = new Set();
      products.forEach((p) => {
        if (p.category) categorySet.add(p.category);
        if (p.jewellery_type) categorySet.add(p.jewellery_type);
      });
      // Sort categories using the config order (Necklace, Haram, Pendants, ...)
      const configOrder = configCategories.map(c => c.name.toLowerCase());
      const sortedCategories = Array.from(categorySet).sort((a, b) => {
        const idxA = configOrder.indexOf(a.toLowerCase());
        const idxB = configOrder.indexOf(b.toLowerCase());
        // Known categories come first in config order, unknown ones go to the end alphabetically
        if (idxA === -1 && idxB === -1) return a.localeCompare(b);
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
      });
      categoryTabs = ["All", ...sortedCategories];
    }
  }

  return (
    <WholesalerGalleryClient
      products={products}
      categoryTabs={categoryTabs}
      initialCategory={categoryParam}
    />
  );
}
