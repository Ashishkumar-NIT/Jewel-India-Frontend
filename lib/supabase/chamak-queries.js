import { createClient } from "./client";

/**
 * Validates that the active client session matches the expected wholesaler ID
 * to prevent unauthorized mutations and provide user-friendly re-auth errors.
 */
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
 * Upload a source image for Chamak fusion to the 'plant-images' Supabase storage bucket.
 * Path: raw/{userId}/chamak_{slot}_{timestamp}.jpg
 *
 * @param {File|Blob} file
 * @param {string} userId
 * @param {string|number} slot - 1 or 2
 * @returns {Promise<string>} Public URL of the uploaded image
 */
export async function uploadSourceImage(file, userId, slot) {
  await requireLiveSession(userId);
  const supabase = createClient();
  const timestamp = Date.now();
  const ext = file.name ? file.name.split(".").pop() : "jpg";
  const filePath = `raw/${userId}/chamak_${slot}_${timestamp}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("plant-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("[uploadSourceImage] Storage upload error:", uploadError);
    throw new Error(uploadError.message || "Failed to upload image. Please try again.");
  }

  const { data: publicUrlData } = supabase.storage
    .from("plant-images")
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

/**
 * Creates a new Chamak generation row in supabase.
 *
 * @param {Object} payload
 * @returns {Promise<Object>} The newly created generation record
 */
export async function createGeneration(payload) {
  await requireLiveSession(payload.wholesaler_id);
  const supabase = createClient();

  const { data, error } = await supabase
    .from("chamak_generations")
    .insert({
      wholesaler_id: payload.wholesaler_id,
      source_design_1_url: payload.source_design_1_url,
      source_design_1_product_id: payload.source_design_1_product_id || null,
      source_design_1_label: payload.source_design_1_label || null,
      source_design_2_url: payload.source_design_2_url,
      source_design_2_product_id: payload.source_design_2_product_id || null,
      source_design_2_label: payload.source_design_2_label || null,
      status: "analyzing",
    })
    .select()
    .single();

  if (error) {
    console.error("[createGeneration] DB error:", error);
    throw new Error(error.message || "Failed to create generation record.");
  }

  return data;
}

/**
 * Fetch a single Chamak generation record by ID.
 *
 * @param {string} id
 * @returns {Promise<Object>}
 */
export async function fetchGeneration(id) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("chamak_generations")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("[fetchGeneration] DB error:", error);
    throw new Error(error.message || "Failed to fetch generation.");
  }

  return data;
}

/**
 * Fetch past generations for a wholesaler (gallery).
 *
 * @param {string} wholesalerId
 * @returns {Promise<Array>}
 */
export async function fetchGallery(wholesalerId) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("chamak_generations")
    .select("*")
    .eq("wholesaler_id", wholesalerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[fetchGallery] DB error:", error);
    throw new Error(error.message || "Failed to load past generations.");
  }

  return data || [];
}

/**
 * Update generation with slider weights and note, setting status to 'generating'.
 *
 * @param {string} id
 * @param {Object} updateData
 * @returns {Promise<Object>}
 */
export async function updateGenerationForm(id, { wholesaler_form_json, note_text, wholesaler_id }) {
  if (wholesaler_id) {
    await requireLiveSession(wholesaler_id);
  }
  const supabase = createClient();

  const { data, error } = await supabase
    .from("chamak_generations")
    .update({
      wholesaler_form_json,
      note_text: note_text || null,
      status: "generating",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[updateGenerationForm] DB error:", error);
    throw new Error(error.message || "Failed to update generation form.");
  }

  return data;
}

/**
 * Generate a 1-hour signed URL for an image in the private 'chamak-outputs' bucket.
 *
 * @param {string} storagePath - Relative path in chamak-outputs bucket, or full URL to extract path from
 * @returns {Promise<string>} Signed URL
 */
export async function getSignedOutputUrl(storagePath) {
  if (!storagePath) return "";
  const supabase = createClient();

  // If path is a full URL, parse out the relative path
  let path = storagePath;
  if (storagePath.startsWith("http")) {
    const parts = storagePath.split("/chamak-outputs/");
    if (parts.length > 1) {
      path = parts[1];
    }
  }

  const { data, error } = await supabase.storage
    .from("chamak-outputs")
    .createSignedUrl(path, 3600); // 1 hour

  if (error) {
    console.error("[getSignedOutputUrl] Error creating signed URL:", error);
    // Return original string as fallback if signed URL creation fails
    return storagePath;
  }

  return data.signedUrl;
}

/**
 * Insert feedback for a generation.
 *
 * @param {Object} feedbackData
 * @returns {Promise<Object>}
 */
export async function insertFeedback({ generation_id, wholesaler_id, rating, feedback_text }) {
  if (wholesaler_id) {
    await requireLiveSession(wholesaler_id);
  }
  const supabase = createClient();

  const { data, error } = await supabase
    .from("chamak_feedback")
    .insert({
      generation_id,
      wholesaler_id,
      rating,
      feedback_text: feedback_text || null,
    })
    .select()
    .single();

  if (error) {
    console.error("[insertFeedback] DB error:", error);
    throw new Error(error.message || "Failed to submit feedback.");
  }

  return data;
}
