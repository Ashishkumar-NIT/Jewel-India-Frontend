import { supabaseAdmin } from "../../../../lib/supabase/admin";
import { createClient } from "../../../../lib/supabase/server";
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
    const image = formData.get("image");
    const title = (formData.get("title") || "").toString().trim();
    const category = (formData.get("category") || "").toString().trim();
    const tagsRaw = (formData.get("tags") || "").toString();

    if (!image || !(image instanceof File)) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }

    const tags = tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

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
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage
      .from("retailer-designs")
      .getPublicUrl(uploadData.path);

    const imageUrl = urlData?.publicUrl || null;
    if (!imageUrl) {
      return NextResponse.json({ error: "Public URL not available" }, { status: 500 });
    }

    const { data: design, error: insertError } = await supabaseAdmin
      .from("retailer_designs")
      .insert({
        retailer_id: retailer.id,
        image_url: imageUrl,
        title: title || null,
        category: category || null,
        tags: tags.length ? tags : [],
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
