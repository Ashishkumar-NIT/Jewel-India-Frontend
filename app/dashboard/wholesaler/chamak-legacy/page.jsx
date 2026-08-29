import { redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server";
import { getAuthUser } from "../../../../lib/supabase/queries";
import ChamakPage from "../../../../components/wholesaler/chamak/ChamakPage";
import { CHAMAK_PIPELINES } from "../../../../lib/api/chamak";

export const metadata = {
  title: "Chamak (Legacy Nanobana) — Jewel India",
  description: "The original Nanobana-rendered fusion, kept for comparison.",
};

/**
 * The original Chamak renderer, deliberately unlinked.
 *
 * Nanobana's fusion path sends only `source_image_1_url`, so Design 2 never
 * reaches the image model — it survives only as text in the compiled prompt,
 * which is why its output tracked Design 1 regardless of the sliders. OpenAI
 * receives both designs and is now what /dashboard/wholesaler/chamak serves.
 *
 * This route is kept so the two can still be compared on the same inputs.
 * It is reachable only by typing the URL: nothing in the sidebar, the mobile
 * menu, or the dashboard links here, so wholesalers will not find it.
 */
export default async function ChamakLegacyDashboardPage() {
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
      pipeline={CHAMAK_PIPELINES.NANOBANA}
    />
  );
}
