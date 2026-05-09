import { createClient } from "../../../../lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    let query = supabase
      .from("orders")
      .select(`
        *,
        products (
          id, title, raw_image_url, processed_image_url, jewellery_type, metal_purity, net_weight
        ),
        employees (
          id, auth_user_id
        ),
        retailers (
          id, business_name
        )
      `)
      .order("created_at", { ascending: false });

    if (role === "employee") {
      const { data: emp } = await supabase.from("employees").select("id").eq("auth_user_id", user.id).single();
      if (!emp) return NextResponse.json({ error: "Employee not found" }, { status: 403 });
      query = query.eq("employee_id", emp.id);
    } else if (role === "wholesaler") {
      const { data: wh } = await supabase.from("wholesalers").select("id").eq("user_id", user.id).single();
      if (!wh) return NextResponse.json({ error: "Wholesaler not found" }, { status: 403 });
      query = query.eq("wholesaler_id", wh.id);
    } else {
      return NextResponse.json({ error: "Invalid role specified" }, { status: 400 });
    }

    const { data: orders, error: ordersError } = await query;

    if (ordersError) throw ordersError;

    return NextResponse.json({ data: orders });
  } catch (err) {
    console.error("[orders/list] Error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
