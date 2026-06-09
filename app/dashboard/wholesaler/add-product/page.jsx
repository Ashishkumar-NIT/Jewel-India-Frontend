import { getAuthUser } from "../../../../lib/supabase/queries";
import { redirect } from "next/navigation";
import { AddProductForm } from "../../../../components/product/AddProductForm";
import { BackToDashboardButton } from "../../../../components/product/BackToDashboardButton";

export const metadata = { title: "Add Product — Celestique" };

export default async function AddProductPage() {
  const user = await getAuthUser();

  if (!user) redirect("/signin");

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[#e5e5e5] bg-white px-4 md:px-10 py-2.5">
        <BackToDashboardButton />
      </header>

      {/* Main Content */}
      {/* 
        Alignment Controls:
        - Mobile: w-full px-4 py-6
        - Tablet (md): md:max-w-[768px] md:mx-auto md:px-8 md:py-8
        - Desktop (lg): lg:max-w-[880px] lg:mx-auto lg:px-10 lg:py-10
        (Change mx-auto to ml-0 for left-alignment, or adjust max-w as needed)
      */}
      <main className="flex-1 flex flex-col gap-6 w-full px-4 py-6 md:gap-8 md:max-w-[640px] md:mx-auto md:px-8 md:py-8 lg:gap-10 lg:max-w-[880px] lg:mx-auto lg:px-10 lg:py-10">
        <AddProductForm />
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
