import { redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server";
import { getAuthUser } from "../../../../lib/supabase/queries";
import ChamakPage from "../../../../components/wholesaler/chamak/ChamakPage";
import { CHAMAK_PIPELINES } from "../../../../lib/api/chamak";

export const metadata = {
  title: "Chamak 2.0 (OpenAI) — Jewel India",
  description:
    "The same design fusion rendered by OpenAI, with both source designs sent as reference images.",
};

/**
 * Chamak 2.0 — identical flow to Chamak, different renderer.
 *
 * Reuses ChamakPage rather than forking it: every step of the flow is the
 * same (upload, vision analysis, sliders, note, result), and the only
 * difference is which vendor draws the final image. Forking the UI would
 * make the two drift apart and defeat the comparison this route exists for.
 *
 * The wholesaler-resolution block below is duplicated verbatim from the
 * Chamak route, matching the existing convention in Set Creation.
 */
export default async function Chamak2DashboardPage() {
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

  return (
    <ChamakPage
      wholesalerId={wholesalerId}
      userId={user.id}
      pipeline={CHAMAK_PIPELINES.OPENAI}
    />
  );
}
