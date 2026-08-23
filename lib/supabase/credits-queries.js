import { createClient } from "./client";

/**
 * Fetch the authenticated wholesaler's credit wallet.
 * Gracefully returns null if the RPC function or table doesn't exist yet.
 */
export async function fetchWallet() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("credits_wallet");

    if (error) {
      // Swallow schema-not-found / function-not-found errors silently
      if (
        error.code === "PGRST202" ||
        error.code === "42883" ||
        error.message?.toLowerCase().includes("could not find") ||
        error.message?.toLowerCase().includes("schema cache")
      ) {
        return null;
      }
      console.warn("[credits-queries] fetchWallet:", error.message);
      return null;
    }

    if (data && data.ok === false) {
      return null;
    }

    return data;
  } catch (err) {
    console.warn("[credits-queries] fetchWallet exception:", err?.message);
    return null;
  }
}

/**
 * Fetch the public rate card from `credit_prices`.
 * Gracefully returns [] if the table doesn't exist yet.
 */
export async function fetchRateCard() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("credit_prices")
      .select("feature_key, credits, label, description, sort_order, is_active")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      // Swallow table-not-found errors silently
      if (
        error.code === "PGRST204" ||
        error.code === "42P01" ||
        error.message?.toLowerCase().includes("relation") ||
        error.message?.toLowerCase().includes("does not exist")
      ) {
        return [];
      }
      console.warn("[credits-queries] fetchRateCard:", error.message);
      return [];
    }

    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn("[credits-queries] fetchRateCard exception:", err?.message);
    return [];
  }
}

/**
 * Fetch the wholesaler's credit ledger (transaction history).
 * Gracefully returns empty if the table doesn't exist yet.
 */
export async function fetchLedger({ limit = 50, offset = 0, kind = null } = {}) {
  try {
    const supabase = createClient();

    let query = supabase
      .from("credit_ledger")
      .select(
        "id, delta, kind, feature_key, reference_type, reference_id, balance_after, metadata, created_at",
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (kind) {
      query = query.eq("kind", kind);
    }

    const { data, count, error } = await query;

    if (error) {
      if (
        error.code === "PGRST204" ||
        error.code === "42P01" ||
        error.message?.toLowerCase().includes("relation") ||
        error.message?.toLowerCase().includes("does not exist")
      ) {
        return { data: [], count: 0 };
      }
      console.warn("[credits-queries] fetchLedger:", error.message);
      return { data: [], count: 0 };
    }

    return { data: Array.isArray(data) ? data : [], count: count || 0 };
  } catch (err) {
    console.warn("[credits-queries] fetchLedger exception:", err?.message);
    return { data: [], count: 0 };
  }
}

/**
 * Fetch active credit lots for expiring breakdown.
 * Gracefully returns [] if the table doesn't exist yet.
 */
export async function fetchCreditLots() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("credit_lots")
      .select("id, credits_remaining, expires_at, source, created_at")
      .gt("credits_remaining", 0)
      .order("expires_at", { ascending: true, nullsFirst: false });

    if (error) {
      if (
        error.code === "PGRST204" ||
        error.code === "42P01" ||
        error.message?.toLowerCase().includes("relation")
      ) {
        return [];
      }
      console.warn("[credits-queries] fetchCreditLots:", error.message);
      return [];
    }

    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn("[credits-queries] fetchCreditLots exception:", err?.message);
    return [];
  }
}
