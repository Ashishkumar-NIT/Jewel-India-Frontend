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

    // The wholesaler_id in products table is actually the AUTH USER ID.
    // We need the ACTUAL UUID from the wholesalers table for the orders foreign key.
    const authUserIds = [...new Set(products.map(p => p.wholesaler_id))];
    
    // Use supabaseAdmin because employees cannot read the wholesalers table due to RLS
    const { data: wholesalers, error: wError } = await supabaseAdmin
      .from("wholesalers")
      .select("id, user_id")
      .in("user_id", authUserIds);

    if (wError) throw wError;

    // Map the products to include the correct wholesaler_id
    const mappedProducts = products.map(p => {
      const w = wholesalers.find(wh => wh.user_id === p.wholesaler_id);
      return {
        ...p,
        // Replace the auth_id with the real wholesaler_uuid for the orders table
        wholesaler_id: w ? w.id : p.wholesaler_id 
      };
    });

    return NextResponse.json({ data: mappedProducts });
  } catch (err) {
    console.error("[products/batch] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
