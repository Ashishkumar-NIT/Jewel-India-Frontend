import RetailerThemeClient from "../../../../components/retailer/RetailerThemeClient";
import { getAuthUser } from "../../../../lib/supabase/queries";
import { getRetailerTheme } from "../../../../lib/cache/retailerEmployee";

export const metadata = {
  title: "Store Theme — Retailer Dashboard",
  description: "Select the store theme that justifies your product and vision.",
};

export default async function RetailerThemePage() {
  const user = await getAuthUser();
  let initialTheme = "indian";

  if (user) {
    try {
      initialTheme = await getRetailerTheme(user.id);
    } catch (err) {
      // TODO: add proper error handling
    }
  }

  return <RetailerThemeClient initialTheme={initialTheme} />;
}
