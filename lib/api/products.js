const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_BUCKET = "plant-images";
const POLL_INTERVAL_MS = 5000; // 5 s — recommended by the backend docs
const POLL_TIMEOUT_MS = 300_000; // 5 minutes

/** Storage URL for the Reve bg-removed intermediate: products/temp/reve_{id}.png */
function reveUrl(productId) {
  return `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/products/temp/reve_${productId}.png`;
}
async function probeUrl(url) {
  try {
    const res = await fetch(url, { method: "HEAD", cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}
export async function uploadProduct({ file, title, jewellery_type, wholesaler_id }) {
  const formData = new FormData();
  formData.append("file", file);
  if (title) formData.append("title", title);
  if (jewellery_type) formData.append("jewellery_type", jewellery_type);
  if (wholesaler_id) formData.append("wholesaler_id", wholesaler_id);

  const res = await fetch(`${API_BASE}/process`, {
    method: "POST",
    body: formData,
    // Do NOT set Content-Type — browser sets it with the correct boundary
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg =
      res.status === 413 ? "File exceeds 10 MB limit." :
      res.status === 415 ? "Unsupported file type. Use JPEG, PNG or WebP." :
      res.status === 429 ? (body.detail || "Daily upload limit reached. Please try again tomorrow.") :
      body.detail ?? `Upload failed (${res.status})`;
    const error = new Error(msg);
    error.status = res.status;
    throw error;
  }

  return res.json(); // { message, product_id, raw_image_url }
}

/**
 * Fetch the current product record.
 */
export async function getProduct(productId) {
  const res = await fetch(`${API_BASE}/product/${productId}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Product fetch failed (${res.status})`);
  return res.json();
}

/**
 * Poll until the final processed image appears in Supabase storage.
 * Also HEAD-probes the Reve temp URL on each tick — fires onBgRemoved
 * the first time the bg-removed intermediate file exists.
 *
 * @param {string} productId
 * @param {string} rawImageUrl — used as a fallback completion check
 * @param {(product: object) => void} onTick
 * @param {(url: string) => void} onBgRemoved
 */
/**
 * Poll GET /product/{id} until generated_image_urls has at least 1 entry.
 * Also HEAD-probes the Reve temp URL once per tick — fires onBgRemoved the
 * first time the bg-removed intermediate file exists in storage.
 *
 * @returns {string[]} generated_image_urls (up to 4 variant URLs)
 */
export async function pollForResult(productId, onBgRemoved) {
  const deadline     = Date.now() + POLL_TIMEOUT_MS;
  const reveTempUrl  = reveUrl(productId);
  let bgRemovedFired = false;

  while (Date.now() < deadline) {
    await sleep(POLL_INTERVAL_MS);

    // ── 1. Check Reve intermediate (bg-removed) via HEAD ────────
    if (!bgRemovedFired) {
      const exists = await probeUrl(reveTempUrl);
      if (exists) {
        bgRemovedFired = true;
        onBgRemoved?.(reveTempUrl);
      }
    }

    // ── 2. Poll product record for generated_image_urls ─────────
    try {
      const product = await getProduct(productId);
      if (Array.isArray(product.generated_image_urls) && product.generated_image_urls.length > 0) {
        return product.generated_image_urls; // ← array of up to 4 variant URLs
      }
    } catch { /* keep polling */ }
  }

  throw new Error("Timed out waiting for processed images (5 min). Please retry.");
}

/**
 * Full pipeline: upload → poll → return 4 variant URLs.
 * Callbacks:
 *   onStatusChange(state)  — 'uploading' | 'processing' | 'bg_removed' | 'error'
 *   onBgRemoved(url)       — fired once when Reve's bg-removed image appears in storage
 */
export async function processJewelleryImage(payload, { onStatusChange, onBgRemoved } = {}) {
  onStatusChange?.("uploading");
  const { product_id, raw_image_url } = await uploadProduct(payload);

  onStatusChange?.("processing");
  const variantUrls = await pollForResult(
    product_id,
    (bgUrl) => {
      onBgRemoved?.(bgUrl);
      onStatusChange?.("bg_removed");
    }
  );

  return {
    product_id,
    variantUrls,               // string[] — up to 4 Nanobana variant URLs
    rawImageUrl: raw_image_url,
    reveImageUrl: reveUrl(product_id),
  };
}

/**
 * Fetch daily upload usage for a wholesaler from the FastAPI backend.
 * @param {string} wholesalerId - Supabase Auth UUID
 * @returns {{ used: number, limit: number, resetsAt: string }}
 */
export async function fetchUploadUsage(wholesalerId) {
  const res = await fetch(
    `${API_BASE}/api/upload-usage?wholesaler_id=${encodeURIComponent(wholesalerId)}`,
    { cache: "no-store" }
  );
  if (!res.ok) {
    throw new Error(`Usage fetch failed (${res.status})`);
  }
  return res.json();
}

export async function reprocessProduct(productId, wholesalerId) {
  const body = {};
  if (wholesalerId) body.wholesaler_id = wholesalerId;

  const res = await fetch(`${API_BASE}/process/${productId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = res.status === 429
      ? (body.detail || "Daily upload limit reached. Please try again tomorrow.")
      : (body.detail ?? `Reprocessing failed (${res.status})`);
    const error = new Error(msg);
    error.status = res.status;
    throw error;
  }

  return res.json();
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
