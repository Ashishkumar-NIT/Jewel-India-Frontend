import { createClient } from "../../../../lib/supabase/server";
import { redirect } from "next/navigation";
import QuestionnaireFlow from "../../../../components/employee/QuestionnaireFlow";
import { getEmployeeQuestionnaireRetailer } from "../../../../lib/cache/retailerEmployee";

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
    businessName = await getEmployeeQuestionnaireRetailer(employee.retailer_id);
  }

  return <QuestionnaireFlow businessName={businessName} />;
}
