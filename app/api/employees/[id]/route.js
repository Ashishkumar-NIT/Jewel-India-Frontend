import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { supabaseAdmin } from "../../../../lib/supabase/admin";

export async function PATCH(request, context) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: retailer } = await supabase
      .from("retailers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!retailer) {
      return NextResponse.json({ error: "Retailer profile not found" }, { status: 404 });
    }

    // Ensure the employee belongs to this retailer
    const { data: employee, error: checkError } = await supabase
      .from("employees")
      .select("id, retailer_id")
      .eq("id", id)
      .single();

    if (checkError || employee.retailer_id !== retailer.id) {
      return NextResponse.json({ error: "Employee not found or access denied" }, { status: 404 });
    }

    const updates = { updated_at: new Date().toISOString() };
    if (body.full_name !== undefined) updates.full_name = body.full_name;
    if (body.designation !== undefined) updates.designation = body.designation;
    if (body.phone !== undefined) updates.phone = body.phone;
    if (body.is_active !== undefined) updates.is_active = body.is_active;
    if (body.status !== undefined) updates.status = body.status;

    const { data: updatedEmployee, error: updateError } = await supabase
      .from("employees")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ data: updatedEmployee });

  } catch (error) {
    console.error("Update employee error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: retailer } = await supabase
      .from("retailers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!retailer) {
      return NextResponse.json({ error: "Retailer profile not found" }, { status: 404 });
    }

    const { data: employee, error: checkError } = await supabase
      .from("employees")
      .select("id, auth_user_id, retailer_id")
      .eq("id", id)
      .single();

    if (checkError || employee.retailer_id !== retailer.id) {
      return NextResponse.json({ error: "Employee not found or access denied" }, { status: 404 });
    }

    // Delete DB record
    const { error: deleteError } = await supabase
      .from("employees")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    // Delete from auth (using admin client)
    if (employee.auth_user_id) {
      await supabaseAdmin.auth.admin.deleteUser(employee.auth_user_id);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Delete employee error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
