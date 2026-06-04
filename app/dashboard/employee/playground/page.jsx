import { createClient } from "../../../../lib/supabase/server";
import { supabaseAdmin } from "../../../../lib/supabase/admin";
import { redirect } from "next/navigation";
import PlaygroundClient from "../../../../components/employee/PlaygroundClient";

export const metadata = {
  title: "Playground — Employee Dashboard",
  description: "Curated products based on your preferences.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PlaygroundPage({ searchParams }) {
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

  const retailerId = employee.retailer_id;
  if (!retailerId) {
    return <PlaygroundClient products={[]} retailerName="Dashboard" />;
  }

  // Fetch Retailer Name
  const { data: retailer } = await supabase
    .from("retailers")
    .select("business_name")
    .eq("id", retailerId)
    .single();
  
  const retailerName = retailer?.business_name || "Jewellers";

  // Fetch retailer-approved products from retailer_selections using supabaseAdmin
  const { data: selections, error: selErr } = await supabaseAdmin
    .from("retailer_selections")
    .select("product_id")
    .eq("retailer_id", retailerId);

  if (selErr) {
    console.error("[employee/playground] retailer_selections fetch error:", selErr.message);
  }

  const selectedIds = (selections || []).map((s) => s.product_id);

  let products = [];
  if (selectedIds.length > 0) {
    // 1. Fetch all published products from the platform matching the selected IDs
    const { data, error: prodErr } = await supabase
      .from("products")
      .select(`
        id, title, jewellery_type, category, style, size, stock_available,
        make_to_order_days, metal_purity, net_weight, gross_weight, stone_weight,
        raw_image_url, processed_image_url, generated_image_urls, wholesaler_email, created_at
      `)
      .eq("is_published", true)
      .in("id", selectedIds)
      .order("created_at", { ascending: false });

    if (prodErr) {
      console.error("[employee/playground] products fetch error:", prodErr.message);
    }

    products = (data || []).filter(
      (p) => (p.generated_image_urls && p.generated_image_urls.length > 0) || (p.processed_image_url && p.processed_image_url.trim() !== "") || (p.raw_image_url && p.raw_image_url.trim() !== "")
    );
  }

  // 3. Apply Filters from Search Params
  const resolvedParams = await searchParams;
  const { occasion, material, style, type, weight } = resolvedParams || {};

  if (occasion || material || style || type || weight) {
    products = products.filter((p) => {
      // Get DB values (safe fallbacks to empty string)
      const pType = (p.jewellery_type || "").toLowerCase();
      const pCat = (p.category || "").toLowerCase();
      const pStyle = (p.style || "").toLowerCase();
      const pPurity = (p.metal_purity || "").toLowerCase();
      const pTitle = (p.title || "").toLowerCase();
      
      const searchString = `${pType} ${pCat} ${pStyle} ${pPurity} ${pTitle}`;

      // 1. Exact Type Filtering
      if (type && type !== "View All") {
        const selectedTypes = type.split(",").map(t => t.toLowerCase().trim());
        if (!selectedTypes.includes("view all")) {
          const matchesType = selectedTypes.some(t => {
            const singular = t.endsWith('s') ? t.slice(0, -1) : t;
            return searchString.includes(t) || searchString.includes(singular);
          });
          if (!matchesType) return false;
        }
      }

      // 2. Exact Material Filtering
      if (material) {
        const selectedMaterials = material.split(",").map(m => m.toLowerCase().trim());
        const matchesMaterial = selectedMaterials.some(m => {
          if (m === "gold" && (searchString.includes("gold") || pPurity.includes("k"))) return true;
          return searchString.includes(m);
        });
        if (!matchesMaterial) return false;
      }

      // 3. Exact Style Filtering
      if (style) {
        const selectedStyles = style.split(",").map(s => s.toLowerCase().trim());
        const matchesStyle = selectedStyles.some(s => searchString.includes(s));
        if (!matchesStyle) return false;
      }

      // 4. Occasion Filtering
      // Since there is no Occasion column in the database, strict filtering here
      // will hide all products. We use a mapped approach for known occasions.
      if (occasion) {
        const selectedOccasions = occasion.split(",").map(o => o.toLowerCase().trim());
        const matchesOccasion = selectedOccasions.some(o => {
          if (o === "wedding" || o === "engagement") {
            return searchString.includes("wedding") || searchString.includes("bridal") || searchString.includes("traditional") || searchString.includes("heavy");
          }
          if (o === "daily wear" || o === "minimalist") {
            return searchString.includes("daily") || searchString.includes("light") || searchString.includes("modern") || searchString.includes("minimal");
          }
          if (o === "party") {
            return searchString.includes("party") || searchString.includes("modern") || searchString.includes("statement") || searchString.includes("fusion");
          }
          return searchString.includes(o);
        });
        
        // Only reject if it completely fails to match mapped occasions
        if (!matchesOccasion) return false;
      }

      // 5. Exact Weight Filtering
      if (weight) {
        const selectedWeights = weight.split(",");
        const nw = parseFloat(p.net_weight || p.gross_weight || 0);
        
        // If product has no weight at all in DB, we shouldn't strictly hide it or maybe we should.
        // Let's be strict: if weight filter is applied, product must match.
        if (nw > 0) {
          let weightMatch = false;
          for (const w of selectedWeights) {
            if (w.includes("0-5g") && nw >= 0 && nw <= 5) weightMatch = true;
            else if (w.includes("5-15g") && nw > 5 && nw <= 15) weightMatch = true;
            else if (w.includes("15-30g") && nw > 15 && nw <= 30) weightMatch = true;
            else if (w.includes("30g+") && nw > 30) weightMatch = true;
          }
          if (!weightMatch) return false;
        } else {
          // Product has no weight defined in DB, hide it because user strictly wants a weight range.
          return false; 
        }
      }

      return true;
    });
  }

  return <PlaygroundClient products={products} employeeId={employee.id} retailerName={retailerName} />;
}
