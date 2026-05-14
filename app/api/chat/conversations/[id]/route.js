import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { supabaseAdmin } from "../../../../lib/supabase/admin";

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = user.user_metadata?.role;
    
    // Determine which visibility flag to toggle
    let updateData = {};
    if (role === "wholesaler") {
      updateData = { is_visible_to_wholesaler: false };
    } else if (role === "employee") {
      updateData = { is_visible_to_employee: false };
    } else {
      return NextResponse.json({ error: "Only wholesalers and employees can hide conversations" }, { status: 403 });
    }

    // Perform soft delete (update visibility flag)
    const { error } = await supabaseAdmin
      .from("conversations")
      .update(updateData)
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Conversation hidden successfully" });
  } catch (error) {
    console.error("[DELETE /api/chat/conversations/[id]] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
