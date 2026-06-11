import { createClient } from "../../../../lib/supabase/server";
import { redirect } from "next/navigation";
import MessagesClient from "./MessagesClient";
import { getEmployeeConversations } from "../../../../lib/cache/retailerEmployee";

export const metadata = {
  title: "Messages — Employee Dashboard",
  description: "Chat with wholesalers.",
};

export default async function EmployeeMessagesPage({ searchParams }) {
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

  const enrichedConversations = await getEmployeeConversations(employee.id);

  const resolvedParams = await searchParams;
  const productId = resolvedParams?.productId || null;

  return (
    <MessagesClient 
      initialConversations={enrichedConversations} 
      currentUserType="employee"
      openProductId={productId}
    />
  );
}
