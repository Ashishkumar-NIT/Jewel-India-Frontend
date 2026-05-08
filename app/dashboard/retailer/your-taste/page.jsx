import { createClient } from "../../../../lib/supabase/server";
import { redirect } from "next/navigation";
import YourTasteClient from "../../../../components/retailer/YourTasteClient";
import { categories } from "../../../../lib/config/catalogueCategories";

export const metadata = {
  title: "Your Taste | Retailer Dashboard",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function YourTastePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/entry_page/signin");

  const { data: retailer } = await supabase
    .from("retailers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!retailer) redirect("/entry_page/signin");

  // 1. Fetch all published products from wholesalers
  const { data: products } = await supabase
    .from("products")
    .select(
      `id,
       title,
       jewellery_type,
       category,
       style,
       size,
       metal_purity,
       net_weight,
       gross_weight,
       stone_weight,
       stock_available,
       make_to_order_days,
       processed_image_url,
       raw_image_url,
       generated_image_urls,
       wholesaler_email,
       created_at`
    )
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  // 2. Fetch current selections for this retailer
  const { data: selectionsData } = await supabase
    .from("retailer_selections")
    .select("product_id")
    .eq("retailer_id", retailer.id);

  const selectedProductIds = (selectionsData || []).map(s => s.product_id);

  // 3. Prepare categories (using the same config as Wholesaler Catalogue)
  const dynamicCategories = categories.map((cat) => ({
    name: cat.name,
    slug: cat.slug,
    image: cat.image,
  }));

  return (
    <YourTasteClient 
      products={products || []} 
      selectedProductIds={selectedProductIds}
      categoryTabs={dynamicCategories}
    />
  );
}
