import { redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server";
import { getAuthUser } from "../../../../lib/supabase/queries";
import ChamakPage from "../../../../components/wholesaler/chamak/ChamakPage";

export const metadata = {
  title: "Chamak AI Design Fusion — Jewel India",
  description: "Fuse two jewelry designs into an AI-generated creation with custom slider weights.",
};

export default async function ChamakDashboardPage() {
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

  return <ChamakPage wholesalerId={wholesalerId} userId={user.id} />;
}
