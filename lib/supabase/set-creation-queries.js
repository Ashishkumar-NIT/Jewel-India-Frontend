import { createClient } from "./client";

/**
 * The four staging presets offered to the wholesaler.
 *
 * `id` is all that gets persisted and sent to the backend — the actual scene
 * wording lives server-side in app/services/chamak.py (SET_BACKDROPS), so the
 * prompt can be retuned without shipping a frontend release.
 */
export const SET_BACKDROPS = [
  {
    id: "velvet_bust",
    label: "Velvet Bust",
    blurb: "Teal velvet bust and stands, maroon silk backdrop",
    swatch: "linear-gradient(135deg,#134E4A 0%,#0F766E 45%,#7F1D1D 100%)",
  },
  {
    id: "dark_slate",
    label: "Dark Slate",
    blurb: "Charcoal stone surface, dramatic side light",
    swatch: "linear-gradient(135deg,#1F2937 0%,#374151 55%,#111827 100%)",
  },
  {
    id: "festive",
    label: "Festive",
    blurb: "Maroon and gold silk, warm bokeh, marigold accents",
    swatch: "linear-gradient(135deg,#7F1D1D 0%,#B45309 55%,#F59E0B 100%)",
  },
  {
    id: "clean_studio",
    label: "Clean Studio",
    blurb: "Seamless light-grey sweep, soft even lighting",
    swatch: "linear-gradient(135deg,#F3F4F6 0%,#D1D5DB 55%,#9CA3AF 100%)",
  },
];

export const DEFAULT_BACKDROP = "velvet_bust";

async function requireLiveSession(expectedUserId) {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Your session has expired. Please sign in again to continue.");
  }
  if (expectedUserId && user.id !== expectedUserId) {
    throw new Error("User authorization mismatch. Please sign in again.");
  }
  return user;
}

/**
 * Uploads one of the wholesaler's own photos.
 *
 * The bucket must stay PUBLIC. The image API downloads these URLs itself
 * rather than receiving bytes, so a private or expired-signed URL fails at the
 * vendor with no useful error.
 */
export async function uploadSetSourceImage(file, userId, slot) {
  await requireLiveSession(userId);
  const supabase = createClient();
  const ext = file.name ? file.name.split(".").pop() : "jpg";
  const filePath = `raw/${userId}/setcreation_${slot}_${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("plant-images")
    .upload(filePath, file, { cacheControl: "3600", upsert: false });

  if (uploadError) {
    console.error("[uploadSetSourceImage] upload error:", uploadError);
    throw new Error(uploadError.message || "Failed to upload image. Please try again.");
  }

  const { data } = supabase.storage.from("plant-images").getPublicUrl(filePath);
  return data.publicUrl;
}

/**
 * Creates the generation row.
 *
 * Uses `source_image_1_url` / `source_image_2_url` — the column names in
 * migrations/create_chamak_generations.sql, which are what the pipeline
 * actually reads.
 */
export async function createSetGeneration({
  wholesaler_id,
  source_image_1_url,
  source_image_2_url,
  set_backdrop,
  note_text,
}) {
  await requireLiveSession(wholesaler_id);
  const supabase = createClient();

  const { data, error } = await supabase
    .from("chamak_generations")
    .insert({
      wholesaler_id,
      source_image_1_url,
      source_image_2_url,
      mode: "set_creation",
      set_backdrop: set_backdrop || DEFAULT_BACKDROP,
      note_text: note_text || null,
      status: "queued",
    })
    .select()
    .single();

  if (error) {
    console.error("[createSetGeneration] DB error:", error);
    throw new Error(error.message || "Failed to create the set.");
  }
  return data;
}

export async function fetchSetGeneration(id) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("chamak_generations")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message || "Failed to fetch generation.");
  return data;
}

/** Past set creations only — fusions stay in the Chamak gallery. */
export async function fetchSetGallery(wholesalerId) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("chamak_generations")
    .select("*")
    .eq("wholesaler_id", wholesalerId)
    .eq("mode", "set_creation")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[fetchSetGallery] DB error:", error);
    return [];
  }
  return data || [];
}

/** Outputs live in a private bucket, so display needs a signed URL. */
export async function getSignedOutputUrl(storagePath) {
  if (!storagePath) return "";
  const supabase = createClient();

  let path = storagePath;
  if (storagePath.startsWith("http")) {
    const parts = storagePath.split("/chamak-outputs/");
    if (parts.length > 1) path = parts[1];
  }

  const { data, error } = await supabase.storage
    .from("chamak-outputs")
    .createSignedUrl(path, 3600);

  if (error) {
    console.error("[getSignedOutputUrl] error:", error);
    return storagePath;
  }
  return data.signedUrl;
}

/** Products the wholesaler can pick from the catalogue. */
export async function fetchCatalogueProducts(userId) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, title, jewellery_type, category, raw_image_url, processed_image_url, generated_image_urls, is_published, created_at"
    )
    .eq("wholesaler_id", userId)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[fetchCatalogueProducts] DB error:", error);
    return [];
  }
  return data || [];
}

/** First usable image on a product row. */
export function productImageUrl(product) {
  if (!product) return "";
  const generated = Array.isArray(product.generated_image_urls)
    ? product.generated_image_urls[0]
    : null;
  return product.processed_image_url || generated || product.raw_image_url || "";
}
