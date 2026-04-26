import { createClient } from "../../../../lib/supabase/server";
import { redirect } from "next/navigation";
import MessagesClient from "./MessagesClient";

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

  // Verify the user is an employee
  const { data: employee } = await supabase
    .from("employees")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (!employee) redirect("/entry_page/signin");

  // Fetch initial conversations from the API
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";
  let initialConversations = [];

  try {
    // We can just query directly or fetch from our API
    // Let's use direct API call since we have the cookie context
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
      currentUserType="employee"
    />
  );
}
