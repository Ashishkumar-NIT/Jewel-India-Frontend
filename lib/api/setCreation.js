import { createClient } from "../supabase/client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * Builds authorized headers from the live Supabase session.
 * Mirrors lib/api/chamak.js — the pipeline refuses to spend credits without
 * a verifiable token.
 */
async function authHeaders(idempotencyKey = null) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,
  };

  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;
  return headers;
}

/**
 * Triggers set creation on the AI pipeline.
 *
 * Unlike Chamak there is no analyze step — Set Creation reproduces both pieces
 * as-is, so nothing needs to be understood about them first. This single call
 * is the whole paid action.
 *
 * @param {string} generationId - UUID of the chamak_generations row (mode='set_creation')
 * @param {string|null} idempotencyKey
 */
export async function triggerSetCreation(generationId, idempotencyKey = null) {
  const headers = await authHeaders(idempotencyKey);

  const res = await fetch(`${API_BASE}/api/set-creation/generate`, {
    method: "POST",
    headers,
    body: JSON.stringify({ generation_id: generationId }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));

    if (
      res.status === 402 &&
      (body.detail?.error === "INSUFFICIENT_CREDITS" || body.detail?.required)
    ) {
      const err = new Error(
        body.detail.message || "You do not have enough credits for this."
      );
      err.status = 402;
      err.insufficientCredits =
        typeof body.detail === "object"
          ? body.detail
          : { error: "INSUFFICIENT_CREDITS" };
      throw err;
    }

    const detailMsg =
      typeof body.detail === "string"
        ? body.detail
        : body.detail?.message ||
          body.message ||
          `Set creation request failed (${res.status})`;

    const error = new Error(detailMsg);
    error.status = res.status;
    throw error;
  }

  return res.json();
}

/**
 * Fetches the current status of a generation.
 * Reuses the Chamak status route — same table, same ownership check.
 */
export async function fetchSetCreationStatus(generationId) {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}/api/chamak/${generationId}`, {
    headers,
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`Status fetch failed (${res.status})`);
  return res.json();
}
