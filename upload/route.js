import { supabaseAdmin } from "../lib/supabase/admin";
import { createClient } from "../lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.user_metadata?.role !== "retailer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: retailer, error: retailerError } = await supabase
      .from("retailers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (retailerError || !retailer) {
      return NextResponse.json({ error: "Retailer profile not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const images = formData.getAll("images");
    const payloadStr = formData.get("payload");
    
    if (!images || images.length === 0) {
      return NextResponse.json({ error: "At least one image file is required" }, { status: 400 });
    }
    
    let payload = {};
    try {
      if (payloadStr) payload = JSON.parse(payloadStr.toString());
    } catch (e) {
      return NextResponse.json({ error: "Invalid payload format" }, { status: 400 });
    }

    const imageUrls = [];
    
    // Upload all images
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      if (!(image instanceof File)) continue;
      
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).slice(2, 8);
      const originalName = image.name || "upload";
      const ext = originalName.includes(".") ? originalName.split(".").pop() : "";
      const safeExt = ext ? ext.replace(/[^a-zA-Z0-9]/g, "") : "";
      const safeBase = originalName
        .replace(/\.[^/.]+$/, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      const fileName = `${timestamp}-${randomSuffix}-${safeBase || "design"}${safeExt ? "." + safeExt : ""}`;
      const filePath = `${retailer.id}/${fileName}`;

      const buffer = Buffer.from(await image.arrayBuffer());
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from("retailer-designs")
        .upload(filePath, buffer, {
          contentType: image.type,
          upsert: true,
        });

      if (uploadError) {
        console.error("[designs/upload] Storage error:", uploadError.message);
        continue;
      }

      const { data: urlData } = supabaseAdmin.storage
        .from("retailer-designs")
        .getPublicUrl(uploadData.path);

      if (urlData?.publicUrl) {
        imageUrls.push(urlData.publicUrl);
      }
    }
    
    if (imageUrls.length === 0) {
      return NextResponse.json({ error: "Failed to upload images" }, { status: 500 });
    }

    const { data: design, error: insertError } = await supabaseAdmin
      .from("retailer_designs")
      .insert({
        retailer_id: retailer.id,
        image_url: imageUrls[0],
        image_urls: imageUrls,
        title: payload.title || null,
        type: payload.type || null,
        category: payload.category || null,
        style_aesthetic: payload.style_aesthetic || null,
        size: payload.size || null,
        purity: payload.purity || null,
        gross_weight: payload.gross_weight ? parseFloat(payload.gross_weight) : null,
        stone_weight: payload.stone_weight ? parseFloat(payload.stone_weight) : null,
        net_weight: payload.net_weight ? parseFloat(payload.net_weight) : null,
        is_in_stock: payload.is_in_stock || false,
        production_time_days: payload.production_time_days ? parseInt(payload.production_time_days) : null,
        is_archived: false,
        tags: payload.tags || [],
      })
      .select()
      .single();

    if (insertError) {
      console.error("[designs/upload] DB error:", insertError.message);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ data: design });
  } catch (err) {
    console.error("[designs/upload] Unexpected error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
