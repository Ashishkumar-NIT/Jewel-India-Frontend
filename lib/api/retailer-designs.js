import { createClient } from "../supabase/server";

/**
 * Fetches non-archived designs for a given retailer.
 * Used by server components (e.g., employee dashboard viewing parent retailer's designs).
 */
export async function getDesignsByRetailer(retailerId) {
  const supabase = await createClient();

  if (!retailerId) return [];

  let data, error;
  try {
    ({ data, error } = await supabase
      .from("retailer_designs")
      .select("*")
      .eq("retailer_id", retailerId)
      .eq("is_archived", false)
      .order("created_at", { ascending: false }));
  } catch (fetchErr) {
    console.error("[getDesignsByRetailer] Network error:", fetchErr.message);
    return [];
  }

  if (error) {
    console.error("[getDesignsByRetailer]", error.message);
    return [];
  }

  return data ?? [];
}

/**
 * Fetches ALL designs (including archived) for a given retailer.
 * Used for admin-level views that need the full catalogue.
 */
export async function getAllDesignsByRetailer(retailerId) {
  const supabase = await createClient();

  if (!retailerId) return [];

  try {
    const { data, error } = await supabase
      .from("retailer_designs")
      .select("*")
      .eq("retailer_id", retailerId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[getAllDesignsByRetailer]", error.message);
      return [];
    }
    return data ?? [];
  } catch (fetchErr) {
    console.error("[getAllDesignsByRetailer] Network error:", fetchErr.message);
    return [];
  }
}

/**
 * Gets design counts (total, active, archived) for a retailer.
 * Used by the dashboard stats component.
 */
export async function getDesignCounts(retailerId) {
  const supabase = await createClient();

  if (!retailerId) return { total: 0, active: 0, archived: 0 };

  try {
    const { count: total } = await supabase
      .from("retailer_designs")
      .select("*", { count: "exact", head: true })
      .eq("retailer_id", retailerId);

    const { count: active } = await supabase
      .from("retailer_designs")
      .select("*", { count: "exact", head: true })
      .eq("retailer_id", retailerId)
      .eq("is_archived", false);

    return {
      total: total || 0,
      active: active || 0,
      archived: (total || 0) - (active || 0),
    };
  } catch (fetchErr) {
    console.error("[getDesignCounts] Network error:", fetchErr.message);
    return { total: 0, active: 0, archived: 0 };
  }
}

/**
 * Gets unique categories from a retailer's designs.
 * Useful for building filter UIs.
 */
export async function getDesignCategories(retailerId) {
  const supabase = await createClient();

  if (!retailerId) return [];

  try {
    const { data, error } = await supabase
      .from("retailer_designs")
      .select("category")
      .eq("retailer_id", retailerId)
      .eq("is_archived", false)
      .not("category", "is", null);

    if (error) {
      console.error("[getDesignCategories]", error.message);
      return [];
    }

    const categories = [...new Set((data || []).map((d) => d.category).filter(Boolean))];
    return categories;
  } catch (fetchErr) {
    console.error("[getDesignCategories] Network error:", fetchErr.message);
    return [];
  }
}
