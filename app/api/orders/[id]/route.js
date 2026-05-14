import { createClient } from "../../../../lib/supabase/server";
import { supabaseAdmin } from "../../../../lib/supabase/admin";
import { NextResponse } from "next/server";

export async function PATCH(request, context) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Wait for params in Next.js 15+
    const resolvedParams = await context.params;
    const orderId = resolvedParams.id;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID missing" }, { status: 400 });
    }

    const body = await request.json();
    const { status, rejection_reason } = body;

    if (!status) {
      return NextResponse.json({ error: "Status missing" }, { status: 400 });
    }

    const updatePayload = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === "rejected") {
      updatePayload.rejection_reason = rejection_reason || "No reason provided.";
      updatePayload.rejected_at = new Date().toISOString();
    } else if (status === "accepted") {
      updatePayload.accepted_at = new Date().toISOString();
    } else if (status === "in_production") {
      updatePayload.production_at = new Date().toISOString();
    } else if (status === "packed") {
      updatePayload.packed_at = new Date().toISOString();
    } else if (status === "dispatched") {
      updatePayload.dispatched_at = new Date().toISOString();
    } else if (status === "received") {
      updatePayload.received_at = new Date().toISOString();
    } else if (status === "completed") {
      updatePayload.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabaseAdmin
      .from("orders")
      .update(updatePayload)
      .eq("id", orderId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("[orders/update] Error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Wait for params in Next.js 15+
    const resolvedParams = await context.params;
    const orderId = resolvedParams.id;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID missing" }, { status: 400 });
    }

    // Get user role to determine which visibility flag to flip
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    let updatePayload = {};
    if (profile?.role === "wholesaler") {
      updatePayload = { is_visible_to_wholesaler: false };
    } else {
      // Default to employee/retailer side
      updatePayload = { is_visible_to_employee: false };
    }

    const { error } = await supabaseAdmin
      .from("orders")
      .update(updatePayload)
      .eq("id", orderId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[orders/delete] Error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
