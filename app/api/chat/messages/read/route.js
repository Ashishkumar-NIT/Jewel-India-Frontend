import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";
import { supabaseAdmin } from "../../../../../lib/supabase/admin";

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { conversation_id } = body;

    if (!conversation_id) {
      return NextResponse.json({ error: "conversation_id is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = user.user_metadata?.role;
    let senderTypeToMark = "";

    // If I am an employee, I want to mark wholesaler messages as read.
    if (role === "employee") {
      senderTypeToMark = "wholesaler";
    } else if (role === "wholesaler") {
      senderTypeToMark = "employee";
    } else {
      return NextResponse.json({ error: "Forbidden role" }, { status: 403 });
    }

    const { error: updateError } = await supabaseAdmin
      .from("messages")
      .update({ is_read: true })
      .eq("conversation_id", conversation_id)
      .eq("sender_type", senderTypeToMark)
      .eq("is_read", false);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PATCH /api/chat/messages/read] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
