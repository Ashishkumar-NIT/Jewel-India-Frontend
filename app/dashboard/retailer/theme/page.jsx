import RetailerThemeClient from "../../../../components/retailer/RetailerThemeClient";
import { getAuthUser } from "../../../../lib/supabase/queries";
import { createClient } from "../../../../lib/supabase/server";

export const metadata = {
  title: "Store Theme — Retailer Dashboard",
  description: "Select the store theme that justifies your product and vision.",
};

export default async function RetailerThemePage() {
  const user = await getAuthUser();
  let initialTheme = "indian";

  if (user) {
    const supabase = await createClient();
    try {
      // Query selected_theme from retailers table
      const { data: retailer, error } = await supabase
        .from("retailers")
        .select("selected_theme")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!error && retailer?.selected_theme) {
        initialTheme = retailer.selected_theme;
      }
    } catch (err) {
      console.warn("Failed to fetch retailer theme server-side:", err);
    }
  }

  return <RetailerThemeClient initialTheme={initialTheme} />;
}
