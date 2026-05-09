import { createClient } from "../../../../lib/supabase/server";
import { redirect } from "next/navigation";
import QuestionnaireFlow from "../../../../components/employee/QuestionnaireFlow";

export const dynamic = "force-dynamic";

export default async function QuestionnairePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/entry_page/signin");

  // Fetch parent retailer for business name
  const { data: employee } = await supabase
    .from("employees")
    .select("retailer_id")
    .eq("auth_user_id", user.id)
    .single();

  let businessName = "Your Store";
  if (employee) {
    const { data: retailer } = await supabase
      .from("retailers")
      .select("business_name")
      .eq("id", employee.retailer_id)
      .single();
    if (retailer) businessName = retailer.business_name;
  }

  return <QuestionnaireFlow businessName={businessName} />;
}
