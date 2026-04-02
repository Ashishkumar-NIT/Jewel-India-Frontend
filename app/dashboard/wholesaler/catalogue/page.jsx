import { createClient } from "../../../../lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import CatalogueClient from "../../../../components/wholesaler/catalogue/CatalogueClient";

export const metadata = { title: "My Catalogue — Celestique" };

const LIMIT = 20;

const CATEGORY_ORDER = ["pendants", "mangalsutras", "chains", "bangles", "bracelets", "rings", "earrings"];

export default async function CataloguePage({ searchParams }) {
  const supabase = await createClient();

  // ── 1. Auth guard ──────────────────────────────────────────────────────────
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin");

  const role = user.user_metadata?.role;
  if (!role) redirect("/select-role");
  if (role !== "wholesaler") redirect("/");

  // ── 2. Read initial category from URL ─────────────────────────────────────
  const rawCategory = (await searchParams)?.category ?? "all";
  const initialCategory = rawCategory.toLowerCase();

  // ── 3. Fetch all products to get dynamic categories ──────────────────────
  const { data: allProds, error: allErr } = await supabase
    .from("products")
    .select("category, processed_image_url, image_url, raw_image_url")
    .eq("wholesaler_id", user.id);

  let dynamicCategories = [];
  if (allProds && !allErr) {
    const catMap = new Map();
    for (const p of allProds) {
      if (!p.category) continue;
      const c = p.category.toLowerCase();
      if (!catMap.has(c)) {
        // use earliest found product image for this category
        const img = p.processed_image_url || p.image_url || p.raw_image_url || null;
        catMap.set(c, {
          slug: c,
          name: p.category.charAt(0).toUpperCase() + p.category.slice(1),
          image: img
        });
      } else if (!catMap.get(c).image) {
        // try to fill image if previous didn't have one
        const img = p.processed_image_url || p.image_url || p.raw_image_url || null;
        if (img) catMap.get(c).image = img;
      }
    }
    
    // Sort array based on requested order, then alphabetically for remainder
    dynamicCategories = Array.from(catMap.values()).sort((a, b) => {
      const idxA = CATEGORY_ORDER.indexOf(a.slug);
      const idxB = CATEGORY_ORDER.indexOf(b.slug);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  // ── 4. Fetch first page of products (SSR for instant load) ────────────────
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
       image_url,
       wholesaler_email,
       created_at`,
      { count: "exact" }
    )
    .eq("wholesaler_id", user.id);

  if (initialCategory && initialCategory !== "all") {
    query = query.ilike("category", `%${initialCategory}%`);
  }

  query = query
    .order("created_at", { ascending: false })
    .range(0, LIMIT - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error("[CataloguePage] Supabase error:", error.message);
  }

  const initialProducts = data ?? [];
  const initialCount = count ?? 0;

  return (
    <Suspense>
      <CatalogueClient
        initialProducts={initialProducts}
        initialCount={initialCount}
        initialCategory={initialCategory}
        dynamicCategories={dynamicCategories}
        wholesalerId={user.id}
        userEmail={user.email}
      />
    </Suspense>
  );
}
