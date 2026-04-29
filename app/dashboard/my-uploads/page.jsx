import { createClient } from "../../../lib/supabase/server";
import { redirect } from "next/navigation";
import { getProductsByWholesaler } from "../../../lib/api/supabase-products";
import { WholesalerUploads } from "../../../components/product/WholesalerUploads";
import { SignOutButton } from "../../../components/auth/SignOutButton";
import Link from "next/link";

export const metadata = { title: "My Uploads — Celestique" };

export default async function MyUploadsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");
  const role = user.user_metadata?.role;
  if (!role) redirect("/select-role");
  if (role !== "wholesaler") redirect("/");

  const products = await getProductsByWholesaler(user.email);

  return (
    <div className="min-h-screen bg-celestique-cream text-celestique-dark font-sans selection:bg-celestique-dark selection:text-celestique-cream">

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-celestique-dark/10 bg-celestique-cream/90 backdrop-blur-md px-6 md:px-12 py-6">
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard/wholesaler/add-product"
            className="text-[10px] uppercase tracking-[0.2em] text-celestique-dark/60 hover:text-celestique-dark transition-colors flex items-center gap-3"
          >
            <span className="text-lg leading-none">&larr;</span>
            Upload Studio
          </Link>
          <span className="hidden sm:block text-[10px] uppercase tracking-[0.3em] font-bold text-celestique-dark">
            / MY UPLOADS
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span className="hidden sm:block text-[10px] uppercase tracking-[0.1em] text-celestique-dark/50 border-r border-celestique-dark/10 pr-6">
            {user.email}
          </span>
          <SignOutButton />
        </div>
      </header>

      {/* ── Content ── */}
      <main>
        <WholesalerUploads products={products} email={user.email} />
      </main>
    </div>
  );
}
