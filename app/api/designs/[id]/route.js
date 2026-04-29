import { createClient } from "../../../../lib/supabase/server";
import { supabaseAdmin } from "../../../../lib/supabase/admin";
import { NextResponse } from "next/server";

export async function PATCH(request, context) {
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
    const { id } = await context.params;
    const body = await request.json();

    const updates = {};
    if (Object.prototype.hasOwnProperty.call(body, "is_archived")) {
      updates.is_archived = !!body.is_archived;
    }
    if (Object.prototype.hasOwnProperty.call(body, "title")) {
      updates.title = body.title ? String(body.title).trim() : null;
    }
    if (Object.prototype.hasOwnProperty.call(body, "category")) {
      updates.category = body.category ? String(body.category).trim() : null;
    }
    if (Object.prototype.hasOwnProperty.call(body, "tags")) {
      updates.tags = Array.isArray(body.tags) ? body.tags : [];
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 });
    }

    const { data: design, error } = await supabase
      .from("retailer_designs")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error || !design) {
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    }

    return NextResponse.json({ data: design });
  } catch (err) {
    console.error("[designs/patch] Unexpected error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, context) {
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

    const { id } = await context.params;

    // First, fetch the design to get the image_url for storage cleanup
    const { data: design, error: fetchError } = await supabase
      .from("retailer_designs")
      .select("id, image_url, retailer_id")
      .eq("id", id)
      .single();

    if (fetchError || !design) {
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    }

    // Delete from the database
    const { error: deleteError } = await supabase
      .from("retailer_designs")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json({ error: "Failed to delete design" }, { status: 500 });
    }

    // Attempt to remove the file from storage (best-effort, don't fail on this)
    if (design.image_url) {
      try {
        const bucketBase = "/retailer-designs/";
        const bucketIdx = design.image_url.indexOf(bucketBase);
        if (bucketIdx !== -1) {
          const storagePath = design.image_url.slice(bucketIdx + bucketBase.length);
          if (storagePath) {
            await supabaseAdmin.storage
              .from("retailer-designs")
              .remove([storagePath]);
          }
        }
      } catch (storageErr) {
        console.warn("[designs/delete] Storage cleanup failed (non-critical):", storageErr.message);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[designs/delete] Unexpected error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
