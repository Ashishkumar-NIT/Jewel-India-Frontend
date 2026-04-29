import { getAuthUser } from "../../../../../lib/supabase/queries";
import { redirect } from "next/navigation";
import { MinimalHeader } from "../../../../../components/product/MinimalHeader";
import { SubmittedPage } from "../../../../../components/product/SubmittedPage";

export const metadata = { title: "Submitted — Celestique" };

export default async function SuccessPage() {
  const user = await getAuthUser();
  if (!user) redirect("/signin");

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <MinimalHeader userEmail={user.email} />
      <SubmittedPage />
    </div>
  );
}