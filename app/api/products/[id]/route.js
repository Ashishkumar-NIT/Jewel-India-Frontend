import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";

export async function PATCH(request, context) {
  try {
    const supabase = await createClient();

    // 1. Auth Guard
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Product ID missing" }, { status: 400 });
    }


    const body = await request.json();
    const updatePayload = {};
    if (typeof body.in_stock !== "undefined") updatePayload.stock_available = body.in_stock;
    if (typeof body.is_published !== "undefined") updatePayload.is_published = body.is_published;

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: "Invalid payload: no valid fields to update" }, { status: 400 });
    }

    // 3. Update the product, returning the updated row. Ensure RLS only updates if it's their product.
    const { data, error } = await supabase
      .from("products")
      .update(updatePayload)
      .eq("id", id)
      .eq("wholesaler_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("[PATCH /api/products/[id]] Supabase error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Product not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true, product: data });
  } catch (err) {
    console.error("[PATCH /api/products/[id]] Unexpected error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
