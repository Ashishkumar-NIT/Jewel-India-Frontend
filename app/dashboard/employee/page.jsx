import { createClient } from "../../../lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function EmployeeDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/entry_page/signin");

  // ── Fetch employee record ───────────────────────────────────────
  const { data: employee } = await supabase
    .from("employees")
    .select("id, full_name, designation, retailer_id")
    .eq("auth_user_id", user.id)
    .single();

  if (!employee) redirect("/entry_page/signin");

  // ── Fetch parent retailer ───────────────────────────────────────
  const { data: retailer } = await supabase
    .from("retailers")
    .select("id, business_name")
    .eq("id", employee.retailer_id)
    .single();

  const businessName = retailer?.business_name || "Your Store";

  // ── Stats: designs count ────────────────────────────────────────
  const { count: designsCount } = await supabase
    .from("retailer_designs")
    .select("*", { count: "exact", head: true })
    .eq("retailer_id", employee.retailer_id)
    .eq("is_archived", false);

  // ── Stats: wholesaler products count ────────────────────────────
  const { count: productsCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .not("processed_image_url", "is", null);

  // ── Recent designs (last 6) ─────────────────────────────────────
  const { data: recentDesigns } = await supabase
    .from("retailer_designs")
    .select("id, image_url, title, category, created_at")
    .eq("retailer_id", employee.retailer_id)
    .eq("is_archived", false)
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 py-8">
      <div className="flex flex-col gap-8">

        {/* ── Welcome ───────────────────────────────────────────────── */}
        <div>
          <h1 className="text-[clamp(22px,3vw,30px)] font-extrabold text-[#111827] tracking-tight mb-1">
            Hi {employee.full_name} 👋
          </h1>
          <p className="text-[15px] text-[#6B7280]">
            You work at <span className="font-semibold text-[#374151]">{businessName}</span> · {employee.designation}
          </p>
        </div>

        {/* ── Stats Cards ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Store Designs */}
          <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 flex flex-col gap-2 shadow-sm">
            <div className="flex justify-between items-start">
              <h3 className="text-[#6B7280] font-medium text-[14px]">Store Designs</h3>
              <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-[18px] h-[18px]">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="text-[32px] font-bold text-[#111827] tracking-tight">
              {designsCount || 0}
            </div>
            <p className="text-[12px] text-[#9CA3AF]">from {businessName}</p>
          </div>

          {/* Wholesaler Products */}
          <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 flex flex-col gap-2 shadow-sm">
            <div className="flex justify-between items-start">
              <h3 className="text-[#6B7280] font-medium text-[14px]">Wholesaler Products</h3>
              <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-[18px] h-[18px]">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
            <div className="text-[32px] font-bold text-[#111827] tracking-tight">
              {productsCount || 0}
            </div>
            <p className="text-[12px] text-[#9CA3AF]">from all wholesalers</p>
          </div>

          {/* Messages placeholder */}
          <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 flex flex-col gap-2 shadow-sm">
            <div className="flex justify-between items-start">
              <h3 className="text-[#6B7280] font-medium text-[14px]">Messages</h3>
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-[18px] h-[18px]">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
            <div className="text-[32px] font-bold text-[#111827] tracking-tight">
              0
            </div>
            <p className="text-[12px] text-[#9CA3AF]">unread conversations</p>
          </div>
        </div>

        {/* ── Quick Action Cards ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Link
            href="/dashboard/employee/designs"
            className="group relative bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-100 rounded-[16px] p-6 flex items-center gap-5 shadow-sm hover:shadow-md transition-all hover:border-purple-200"
          >
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 group-hover:bg-purple-200 transition-colors shrink-0">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[#111827] group-hover:text-purple-900 transition-colors">View Our Designs</h3>
              <p className="text-[13px] text-[#6B7280] mt-0.5">Browse your store&apos;s design catalogue</p>
            </div>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-gray-300 group-hover:text-purple-400 transition-colors ml-auto shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link
            href="/dashboard/employee/wholesaler-gallery"
            className="group relative bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-[16px] p-6 flex items-center gap-5 shadow-sm hover:shadow-md transition-all hover:border-amber-200"
          >
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 group-hover:bg-amber-200 transition-colors shrink-0">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[#111827] group-hover:text-amber-900 transition-colors">Wholesaler Gallery</h3>
              <p className="text-[13px] text-[#6B7280] mt-0.5">Explore products from all wholesalers</p>
            </div>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-gray-300 group-hover:text-amber-400 transition-colors ml-auto shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* ── Recent Designs ─────────────────────────────────────────── */}
        {(recentDesigns?.length ?? 0) > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[16px] font-bold text-[#111827]">Recent Store Designs</h2>
              <Link
                href="/dashboard/employee/designs"
                className="text-[13px] font-semibold text-gray-500 hover:text-[#111827] transition-colors"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {recentDesigns.map((design) => (
                <div
                  key={design.id}
                  className="group rounded-[12px] border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square w-full bg-gray-50 overflow-hidden">
                    {design.image_url ? (
                      <img
                        src={design.image_url}
                        alt={design.title || "Design"}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[11px] text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="px-3 py-2">
                    <p className="text-[12px] font-semibold text-[#111827] truncate">
                      {design.title || "Untitled"}
                    </p>
                    {design.category && (
                      <span className="text-[10px] text-[#6B7280]">{design.category}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
