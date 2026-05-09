import { createClient } from "../../../../lib/supabase/server";
import { supabaseAdmin } from "../../../../lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const supabase = await createClient();
    
    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.user_metadata?.role !== "retailer") {
      return NextResponse.json({ error: "Forbidden: Only retailers can upload designs" }, { status: 403 });
    }

    // 2. Get retailer ID
    const { data: retailer, error: retailerError } = await supabase
      .from("retailers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (retailerError || !retailer) {
      return NextResponse.json({ error: "Retailer profile not found" }, { status: 404 });
    }

    // 3. Parse FormData
    const formData = await request.formData();
    const payloadStr = formData.get("payload");
    if (!payloadStr) {
      return NextResponse.json({ error: "Missing payload" }, { status: 400 });
    }

    let payload;
    try {
      payload = JSON.parse(payloadStr);
    } catch (e) {
      return NextResponse.json({ error: "Invalid payload JSON" }, { status: 400 });
    }

    const images = formData.getAll("images");
    if (!images || images.length === 0) {
      return NextResponse.json({ error: "No images provided" }, { status: 400 });
    }

    // 4. Upload first image to storage (assuming retailer_designs has a single image_url column)
    const file = images[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${retailer.id}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${retailer.id}/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("retailer-designs")
      .upload(filePath, buffer, {
        contentType: file.type || 'image/jpeg',
        upsert: false
      });

    if (uploadError) {
      console.error("[designs/upload] Storage upload error:", uploadError);
      return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
    }

    // Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from("retailer-designs")
      .getPublicUrl(filePath);

    const imageUrl = publicUrlData.publicUrl;

    // 5. Insert into retailer_designs
    const insertData = {
      retailer_id: retailer.id,
      title: payload.title,
      category: payload.category || payload.type, // Handle UI mismatch
      image_url: imageUrl,
      tags: payload.tags || [],
      is_archived: false,
    };

    // Note: We are only inserting fields known to exist on retailer_designs.
    // If other fields exist (like gross_weight), they will be ignored by Supabase if not in schema,
    // or we could add them if we knew the schema. We'll stick to the safe known fields.

    const { data: design, error: insertError } = await supabaseAdmin
      .from("retailer_designs")
      .insert([insertData])
      .select()
      .single();

    if (insertError) {
      console.error("[designs/upload] DB Insert error:", insertError);
      // Rollback image upload
      await supabaseAdmin.storage.from("retailer-designs").remove([filePath]);
      return NextResponse.json({ error: "Failed to save design record" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: design });
  } catch (err) {
    console.error("[designs/upload] Unexpected error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
