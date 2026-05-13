import { createClient } from "../../../../lib/supabase/server";
import { supabaseAdmin } from "../../../../lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const { data: products, error } = await supabase
      .from("products")
      .select(`
        id, title, jewellery_type, category, style, size,
        metal_purity, net_weight, raw_image_url, processed_image_url,
        wholesaler_id, wholesaler_email
      `)
      .in("id", ids);

    if (error) throw error;

    return NextResponse.json({ data: products });
  } catch (err) {
    console.error("[products/batch] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
