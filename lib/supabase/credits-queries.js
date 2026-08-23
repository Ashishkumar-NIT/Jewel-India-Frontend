import { createClient } from "./client";

/**
 * Fetch the authenticated wholesaler's credit wallet.
 * Uses the Supabase RPC credits_wallet() which inspects auth.uid() internally.
 *
 * @returns {Promise<Object>} { ok, available, lifetime_granted, lifetime_spent, lifetime_expired, expiring_soon, next_expiry, low_balance, low_balance_threshold, recovery_owed }
 */
export async function fetchWallet() {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("credits_wallet");

  if (error) {
    console.error("[credits-queries] fetchWallet error:", error);
    throw new Error(error.message || "Failed to fetch credits wallet.");
  }

  if (data && data.ok === false) {
    console.warn("[credits-queries] fetchWallet unauthenticated or error:", data.error);
    return null;
  }

  return data;
}

/**
 * Fetch the public rate card from `credit_prices` for active items.
 *
 * @returns {Promise<Array>} List of { feature_key, credits, label, description, sort_order, is_active }
 */
export async function fetchRateCard() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("credit_prices")
    .select("feature_key, credits, label, description, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[credits-queries] fetchRateCard error:", error);
    return [];
  }

  return data || [];
}

/**
 * Fetch the wholesaler's credit ledger (transaction history).
 *
 * @param {Object} options
 * @param {number} [options.limit=50]
 * @param {number} [options.offset=0]
 * @param {string|null} [options.kind=null] - 'grant' | 'debit' | 'refund' | 'expiry' | 'adjustment'
 * @returns {Promise<{ data: Array, count: number }>}
 */
export async function fetchLedger({ limit = 50, offset = 0, kind = null } = {}) {
  const supabase = createClient();

  let query = supabase
    .from("credit_ledger")
    .select("id, delta, kind, feature_key, reference_type, reference_id, balance_after, metadata, created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (kind) {
    query = query.eq("kind", kind);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error("[credits-queries] fetchLedger error:", error);
    return { data: [], count: 0 };
  }

  return { data: data || [], count: count || 0 };
}

/**
 * Fetch active credit lots for expiring breakdown.
 *
 * @returns {Promise<Array>} List of lots
 */
export async function fetchCreditLots() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("credit_lots")
    .select("id, credits_remaining, expires_at, source, created_at")
    .gt("credits_remaining", 0)
    .order("expires_at", { ascending: true, nullsFirst: false });

  if (error) {
    console.error("[credits-queries] fetchCreditLots error:", error);
    return [];
  }

  return data || [];
}
