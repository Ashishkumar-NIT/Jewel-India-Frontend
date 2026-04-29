import { createClient } from "../../../../lib/supabase/server";
import { redirect } from "next/navigation";
import MessagesClient from "./MessagesClient";
import { supabaseAdmin } from "../../../../lib/supabase/admin";

export const metadata = {
  title: "Messages — Employee Dashboard",
  description: "Chat with wholesalers.",
};

export default async function EmployeeMessagesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/entry_page/signin");

  const { data: employee } = await supabase
    .from("employees")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (!employee) redirect("/entry_page/signin");

  // Direct query instead of HTTP call to own API — skips localhost roundtrip
  const { data: initialConversations } = await supabaseAdmin
    .from("conversations")
    .select(`
      *,
      product:product_id(title, processed_image_url, raw_image_url),
      employee:employee_id(full_name, retailer_id),
      retailer:retailer_id(business_name),
      wholesaler_profile:wholesaler_id(email)
    `)
    .eq("employee_id", employee.id)
    .order("updated_at", { ascending: false });

  return (
    <MessagesClient 
      initialConversations={initialConversations} 
      currentUserType="employee"
    />
  );
}
