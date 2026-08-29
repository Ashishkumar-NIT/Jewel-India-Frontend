import { redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server";
import { getAuthUser } from "../../../../lib/supabase/queries";
import SetCreationPage from "../../../../components/wholesaler/set-creation/SetCreationPage";

export const metadata = {
  title: "Set Creation — Jewel India",
  description:
    "Stage two of your jewellery pieces together as one matched-set catalogue photograph.",
};

export default async function SetCreationDashboardPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect("/signin");
  }

  const supabase = await createClient();
  let wholesaler = null;

  if (user.email) {
    const { data } = await supabase
      .from("wholesalers")
      .select("id, business_name, full_name")
      .eq("email", user.email)
      .maybeSingle();
    wholesaler = data;
  }

  if (!wholesaler) {
    const { data } = await supabase
      .from("wholesalers")
      .select("id, business_name, full_name")
      .eq("user_id", user.id)
      .maybeSingle();
    wholesaler = data;
  }

  const wholesalerId = wholesaler?.id || user.id;

  return <SetCreationPage wholesalerId={wholesalerId} userId={user.id} />;
}
