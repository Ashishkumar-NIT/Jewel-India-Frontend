const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * Triggers vision analysis for a Chamak generation on the AI pipeline backend.
 * @param {string} generationId - UUID of the chamak_generations row
 */
export async function triggerAnalysis(generationId) {
  const res = await fetch(`${API_BASE}/api/chamak/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ generation_id: generationId }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg =
      body.detail || body.message || `Vision analysis request failed (${res.status})`;
    const error = new Error(msg);
    error.status = res.status;
    throw error;
  }

  return res.json();
}

/**
 * Triggers image fusion/generation for a Chamak generation on the AI pipeline backend.
 * @param {string} generationId - UUID of the chamak_generations row
 */
export async function triggerGenerate(generationId) {
  const res = await fetch(`${API_BASE}/api/chamak/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ generation_id: generationId }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg =
      body.detail || body.message || `Chamak generation request failed (${res.status})`;
    const error = new Error(msg);
    error.status = res.status;
    throw error;
  }

  return res.json();
}
