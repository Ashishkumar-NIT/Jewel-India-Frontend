import { createClient } from "../../../../lib/supabase/server";
import { redirect } from "next/navigation";
import MessagesClient from "../../employee/messages/MessagesClient";
import { supabaseAdmin } from "../../../../lib/supabase/admin";

export const metadata = {
  title: "Queries — Wholesaler Dashboard",
  description: "Manage retailer inquiries and respond to potential leads.",
};

export default async function QueriesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/entry_page/signin");

  const { data: wholesaler } = await supabase
    .from("wholesalers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!wholesaler) redirect("/entry_page/signin");

  // Direct query instead of HTTP call to own API — skips localhost roundtrip
  const { data: initialConversations } = await supabaseAdmin
    .from("conversations")
    .select(`
      *,
      product:product_id(title, processed_image_url, raw_image_url),
      employee:employee_id(full_name, retailer_id),
      retailer:retailer_id(business_name),
      wholesaler_profile:wholesaler_id(email),
      messages(id, content, is_read, sender_type, created_at)
    `)
    .eq("wholesaler_id", user.id)
    .eq("is_visible_to_wholesaler", true)
    .order("updated_at", { ascending: false });

  // Compute unread status and last message preview for the UI
  const enrichedConversations = (initialConversations || []).map((conv) => {
    const msgs = conv.messages || [];
    msgs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    const lastMsg = msgs[0];
    const hasUnread = msgs.some(m => !m.is_read && m.sender_type === "employee");

    // Remove the heavy messages array so it isn't sent to the client
    const { messages, ...rest } = conv;

    return {
      ...rest,
      has_unread: hasUnread,
      last_message: lastMsg ? lastMsg.content : "",
    };
  });

  return (
    <MessagesClient 
      initialConversations={enrichedConversations} 
      currentUserType="wholesaler"
    />
  );
}