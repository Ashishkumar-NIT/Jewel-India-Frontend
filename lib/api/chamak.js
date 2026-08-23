import { createClient } from "../supabase/client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * Helper to retrieve active Supabase session and construct authorized headers
 * including optional Idempotency-Key.
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

  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  }

  return headers;
}

/**
 * Triggers vision analysis for a Chamak generation on the AI pipeline backend.
 * @param {string} generationId - UUID of the chamak_generations row
 * @param {string|null} idempotencyKey - Optional UUID for idempotency
 */
export async function triggerAnalysis(generationId, idempotencyKey = null) {
  const headers = await authHeaders(idempotencyKey);

  const res = await fetch(`${API_BASE}/api/chamak/analyze`, {
    method: "POST",
    headers,
    body: JSON.stringify({ generation_id: generationId }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));

    // Handle 402 Insufficient Credits
    if (res.status === 402 && (body.detail?.error === "INSUFFICIENT_CREDITS" || body.detail?.required)) {
      const err = new Error(body.detail.message || "You do not have enough credits for this.");
      err.status = 402;
      err.insufficientCredits = typeof body.detail === "object" ? body.detail : { error: "INSUFFICIENT_CREDITS" };
      throw err;
    }

    const detailMsg =
      typeof body.detail === "string"
        ? body.detail
        : body.detail?.message || body.message || `Vision analysis request failed (${res.status})`;

    const error = new Error(detailMsg);
    error.status = res.status;
    throw error;
  }

  return res.json();
}

/**
 * Triggers image fusion/generation for a Chamak generation on the AI pipeline backend.
 * @param {string} generationId - UUID of the chamak_generations row
 * @param {string|null} idempotencyKey - UUID for idempotency
 */
export async function triggerGenerate(generationId, idempotencyKey = null) {
  const headers = await authHeaders(idempotencyKey);

  const res = await fetch(`${API_BASE}/api/chamak/generate`, {
    method: "POST",
    headers,
    body: JSON.stringify({ generation_id: generationId }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));

    // Handle 402 Insufficient Credits
    if (res.status === 402 && (body.detail?.error === "INSUFFICIENT_CREDITS" || body.detail?.required)) {
      const err = new Error(body.detail.message || "You do not have enough credits for this.");
      err.status = 402;
      err.insufficientCredits = typeof body.detail === "object" ? body.detail : { error: "INSUFFICIENT_CREDITS" };
      throw err;
    }

    const detailMsg =
      typeof body.detail === "string"
        ? body.detail
        : body.detail?.message || body.message || `Chamak generation request failed (${res.status})`;

    const error = new Error(detailMsg);
    error.status = res.status;
    throw error;
  }

  return res.json();
}

/**
 * Fetches status of a generation with Authorization header.
 * @param {string} generationId
 */
export async function fetchChamakStatus(generationId) {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}/api/chamak/${generationId}`, {
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Generation fetch failed (${res.status})`);
  }

  return res.json();
}
