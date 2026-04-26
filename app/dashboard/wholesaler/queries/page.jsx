import { createClient } from "../../../../lib/supabase/server";
import { redirect } from "next/navigation";
import MessagesClient from "../../employee/messages/MessagesClient";

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

  // Verify the user is a wholesaler
  const { data: wholesaler } = await supabase
    .from("wholesalers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!wholesaler) redirect("/entry_page/signin");

  // Fetch initial conversations from the API
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";
  let initialConversations = [];

  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');

    const res = await fetch(`${baseUrl}/api/chat/conversations`, {
      headers: {
        Cookie: cookieHeader
      },
      cache: "no-store"
    });

    if (res.ok) {
      const json = await res.json();
      initialConversations = json.data || [];
    }
  } catch (error) {
    console.error("Failed to fetch initial conversations:", error);
  }

  return (
    <MessagesClient 
      initialConversations={initialConversations} 
      currentUserType="wholesaler"
    />
  );
}