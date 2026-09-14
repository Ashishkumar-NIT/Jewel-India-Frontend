import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase/admin.js";
import { getRequestUser } from "../../../../lib/supabase/request-user.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Order history for a verified retailer account. Unlike marketplace browsing,
 * this endpoint may reveal supplier identity because every returned product
 * already belongs to an order placed by the retailer's store.
 */
export async function GET(request) {
  try {
    const { user, error: authError } = await getRequestUser(request);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.user_metadata?.role !== "retailer") {
      return NextResponse.json({ error: "Retailer access required" }, { status: 403 });
    }

    const { data: retailer, error: retailerError } = await supabaseAdmin
      .from("retailers")
      .select("id, verification_status")
      .eq("user_id", user.id)
      .single();

    if (retailerError || !retailer) {
      return NextResponse.json({ error: "Retailer profile not found" }, { status: 404 });
    }
    if (retailer.verification_status !== "verified") {
      return NextResponse.json({ error: "Retailer verification is required" }, { status: 403 });
    }

    const { data: orders, error: ordersError } = await supabaseAdmin
      .from("orders")
      .select("id, product_id, employee_id, retailer_id, wholesaler_id, customization_note, rejection_reason, status, created_at")
      .eq("retailer_id", retailer.id)
      .order("created_at", { ascending: false })
      .limit(200);

    if (ordersError) {
      console.error("[retailer/orders] Order query failed:", ordersError.message);
      return NextResponse.json({ error: "Could not load orders" }, { status: 500 });
    }

    const productIDs = [...new Set((orders || []).map((order) => order.product_id).filter(Boolean))];
    const wholesalerIDs = [...new Set((orders || []).map((order) => order.wholesaler_id).filter(Boolean))];

    const [productsResult, wholesalersResult] = await Promise.all([
      productIDs.length
        ? supabaseAdmin.from("products").select("*").in("id", productIDs)
        : Promise.resolve({ data: [], error: null }),
      wholesalerIDs.length
        ? supabaseAdmin
            .from("wholesalers")
            .select("user_id, business_name, full_name, city, state")
            .in("user_id", wholesalerIDs)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (productsResult.error || wholesalersResult.error) {
      console.error(
        "[retailer/orders] Related data query failed:",
        productsResult.error?.message || wholesalersResult.error?.message
      );
      return NextResponse.json({ error: "Could not load order details" }, { status: 500 });
    }

    const products = Object.fromEntries((productsResult.data || []).map((product) => [product.id, product]));
    const suppliers = Object.fromEntries((wholesalersResult.data || []).map((wholesaler) => [
      wholesaler.user_id,
      {
        business_name: wholesaler.business_name,
        full_name: wholesaler.full_name,
        city: wholesaler.city,
        state: wholesaler.state,
      },
    ]));

    return NextResponse.json({ orders: orders || [], products, suppliers });
  } catch (error) {
    console.error("[retailer/orders] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
