import { getAuthUser } from "../../../../../lib/supabase/queries";
import { createClient } from "../../../../../lib/supabase/server";
import { redirect } from "next/navigation";
import { EditProductForm } from "../../../../../components/product/EditProductForm";
import { BackToDashboardButton } from "../../../../../components/product/BackToDashboardButton";
import { SignOutButton } from "../../../../../components/auth/SignOutButton";

export const metadata = { title: "Edit Product — Celestique" };

export default async function EditProductPage({ params, searchParams }) {
  const user = await getAuthUser();
  if (!user) redirect("/signin");

  const { id } = await params;

  if (!id) {
    redirect("/dashboard/wholesaler/catalogue");
  }

  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("wholesaler_id", user.id)
    .single();

  if (error || !product) {
    redirect("/dashboard/wholesaler/catalogue");
  }

  const from = (await searchParams)?.from;
  const backUrl = from === "upload-history"
    ? "/dashboard/wholesaler/upload-history"
    : "/dashboard/wholesaler";
  const backLabel = from === "upload-history"
    ? "Back to uploads"
    : "Back to dashboard";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[#e5e5e5] bg-white px-4 md:px-10 py-2.5">
        {/* Left - Back to dashboard */}
        <BackToDashboardButton href={backUrl} label={backLabel} />
        {/* Right - User info and sign out */}
        <div className="flex flex-row items-center gap-4">
          <span className="hidden md:inline text-[13px] text-[#6B7280] font-sfpro">{user.email}</span>
          <SignOutButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col gap-6 w-full px-4 py-6 md:gap-8 md:max-w-[640px] md:mx-auto md:px-8 md:py-8 lg:gap-10 lg:max-w-[880px] lg:mx-auto lg:px-10 lg:py-10">
        <EditProductForm product={product} />
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e5e5e5] bg-white px-4 md:px-10 py-4 font-gilroy font-normal">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-2 md:gap-0 text-center md:text-left">
          <p className="text-sm text-[#6B7280]">
            All Rights Reserved © Jewels India
          </p>
          <p className="text-sm text-[#374151]">Crafted with ❤️ in blr</p>
        </div>
      </footer>
    </div>
  );
}
