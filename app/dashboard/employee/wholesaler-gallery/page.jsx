import { createClient } from "../../../../lib/supabase/server";
import { redirect } from "next/navigation";
import WholesalerGalleryClient from "./WholesalerGalleryClient";
import { categories as configCategories } from "../../../../lib/config/catalogueCategories";
import { getEmployeeSelectedProducts } from "../../../../lib/cache/retailerEmployee";

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
    products = await getEmployeeSelectedProducts(retailerId);
    if (products.length > 0) {
      if (categoryParam && categoryParam.toLowerCase() !== "all") {
        const categoryKey = categoryParam.toLowerCase();
        products = products.filter(
          (p) =>
            (p.category || "").toLowerCase().includes(categoryKey) ||
            (p.jewellery_type || "").toLowerCase().includes(categoryKey) ||
            (p.title || "").toLowerCase().includes(categoryKey)
        );
      }

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
