import { createClient } from "../../../../lib/supabase/server";
import { supabaseAdmin } from "../../../../lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify employee
    const { data: employee, error: empError } = await supabase
      .from("employees")
      .select("id, retailer_id")
      .eq("auth_user_id", user.id)
      .single();

    if (empError || !employee) {
      return NextResponse.json({ error: "Only employees can create orders" }, { status: 403 });
    }

    const body = await request.json();
    const { items } = body; 
    // items should be [{ product_id, wholesaler_id, quantity, customization_notes }]

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    // Prepare orders payload
    const ordersToInsert = items.map(item => {
      // Since the schema doesn't have a quantity column, we can prepend it to the customization note
      // if the quantity is greater than 1, so the wholesaler still sees it.
      let finalNote = item.customization_notes || null;
      if (item.quantity && item.quantity > 1) {
        finalNote = finalNote ? `Quantity Requested: ${item.quantity}\n\n${finalNote}` : `Quantity Requested: ${item.quantity}`;
      }

      return {
        employee_id: employee.id,
        retailer_id: employee.retailer_id,
        wholesaler_id: item.wholesaler_id,
        product_id: item.product_id,
        customization_note: finalNote,
        status: "pending"
      };
    });

    // Insert orders (using admin to ensure no RLS hiccups on insert if policies are strict)
    const { data: insertedOrders, error: insertError } = await supabaseAdmin
      .from("orders")
      .insert(ordersToInsert)
      .select();

    if (insertError) {
      console.error("[orders/create] Insert error:", insertError);
      return NextResponse.json({ error: "Failed to create orders" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: insertedOrders });
  } catch (err) {
    console.error("[orders/create] Unexpected error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
