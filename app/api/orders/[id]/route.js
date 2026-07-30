import { createClient } from "../../../../lib/supabase/server";
import { supabaseAdmin } from "../../../../lib/supabase/admin";
import { validateEmployeeAccess } from "../../../../lib/utils/auth-check";
import { NextResponse } from "next/server";

/**
 * Resolves the caller's role-specific owner id (mirroring the pattern used in
 * app/api/orders/list/route.js and lib/utils/auth-check.js) and confirms it
 * matches the target order's corresponding owner column. supabaseAdmin uses the
 * service-role key and bypasses RLS, so this check is the only thing standing
 * between an authenticated user and any other tenant's order.
 */
async function resolveOrderOwnership(supabase, user, order) {
  const role = user.user_metadata?.role;

  if (role === "wholesaler") {
    const { data: wholesaler } = await supabase
      .from("wholesalers")
      .select("id")
      .eq("user_id", user.id)
      .single();
    if (!wholesaler) {
      return { error: "Forbidden: Wholesaler record not found", status: 403 };
    }
    if (order.wholesaler_id !== user.id) {
      return { error: "Forbidden: You do not own this order", status: 403 };
    }
    return { ok: true };
  }

  if (role === "employee" || role === "retailer") {
    const authCheck = await validateEmployeeAccess(supabase);
    if (authCheck.error) {
      return { error: authCheck.error, status: authCheck.status };
    }
    if (order.employee_id !== authCheck.employeeId) {
      return { error: "Forbidden: You do not own this order", status: 403 };
    }
    return { ok: true };
  }

  return { error: "Forbidden: Role not authorized for order resources", status: 403 };
}

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

    // Fetch the order first so we can verify the caller actually owns it
    // before performing any mutation via the service-role client.
    const { data: existingOrder, error: fetchError } = await supabaseAdmin
      .from("orders")
      .select("id, employee_id, wholesaler_id")
      .eq("id", orderId)
      .single();

    if (fetchError || !existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const ownership = await resolveOrderOwnership(supabase, user, existingOrder);
    if (ownership.error) {
      return NextResponse.json({ error: ownership.error }, { status: ownership.status });
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

    // Fetch the order first so we can verify the caller actually owns it
    // before performing any mutation via the service-role client.
    const { data: existingOrder, error: fetchError } = await supabaseAdmin
      .from("orders")
      .select("id, employee_id, wholesaler_id")
      .eq("id", orderId)
      .single();

    if (fetchError || !existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const ownership = await resolveOrderOwnership(supabase, user, existingOrder);
    if (ownership.error) {
      return NextResponse.json({ error: ownership.error }, { status: ownership.status });
    }

    // Role determines which visibility flag to flip (already validated above)
    const role = user.user_metadata?.role;
    const updatePayload = role === "wholesaler"
      ? { is_visible_to_wholesaler: false }
      : { is_visible_to_employee: false };

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
