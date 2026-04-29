import { createClient } from "../../../lib/supabase/server";
import { getAuthUser } from "../../../lib/supabase/queries";
import RetailerSidebar from "../../../components/retailer/RetailerSidebar";
import { Suspense } from "react";
import dynamic from "next/dynamic";

// Lazy-load AddEmployeeModal — only loaded when ?modal=add-employee is set.
// Reduces initial JS bundle for every retailer route.
const AddEmployeeModal = dynamic(
  () => import("../../../components/retailer/AddEmployeeModal"),
  { loading: () => null }
);

export const metadata = {
  title: "Retailer Dashboard",
  description: "Manage your store and employees.",
};

export default async function RetailerLayout({ children }) {
  const user = await getAuthUser();

  const supabase = await createClient();
  let retailerData = null;
  if (user) {
    const { data } = await supabase
      .from("retailers")
      .select("full_name, business_name, business_logo_url")
      .eq("user_id", user.id)
      .single();
    retailerData = data;
  }

  return (
    <div className="flex min-h-screen bg-[#FAFAFA] font-sans">
      <RetailerSidebar retailer={retailerData} />
      <main className="flex-1 ml-[70px] md:ml-[200px] lg:ml-[220px] min-h-screen flex flex-col transition-all duration-300">
        {children}
      </main>
      
      <Suspense fallback={null}>
        <AddEmployeeModal />
      </Suspense>
    </div>
  );
}
