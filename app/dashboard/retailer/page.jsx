import { createClient } from "../../../lib/supabase/server";
import { SignOutButton } from "../../../components/auth/SignOutButton";
import DashboardStats from "../../../components/retailer/DashboardStats";
import Link from "next/link";

export default async function RetailerDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let employeesCount = 0;
  let activeEmployeesCount = 0;
  let activeDesigns = 0;
  let totalDesigns = 0;
  let archivedDesigns = 0;
  let businessName = "";
  let recentEmployees = [];

  if (user) {
    const { data: retailer } = await supabase
      .from("retailers")
      .select("id, business_name")
      .eq("user_id", user.id)
      .single();

    if (retailer) {
      businessName = retailer.business_name;
      
      // Employee counts
      const { count: empCount } = await supabase
        .from("employees")
        .select('*', { count: 'exact', head: true })
        .eq("retailer_id", retailer.id);
        
      employeesCount = empCount || 0;

      const { count: activeEmpCount } = await supabase
        .from("employees")
        .select('*', { count: 'exact', head: true })
        .eq("retailer_id", retailer.id)
        .eq("status", "active");
        
      activeEmployeesCount = activeEmpCount || 0;
      
      // Design counts
      const { count: totalDesignCount } = await supabase
        .from("retailer_designs")
        .select('*', { count: 'exact', head: true })
        .eq("retailer_id", retailer.id);
        
      totalDesigns = totalDesignCount || 0;

      const { count: designCount } = await supabase
        .from("retailer_designs")
        .select('*', { count: 'exact', head: true })
        .eq("retailer_id", retailer.id)
        .eq("is_archived", false);
        
      activeDesigns = designCount || 0;
      archivedDesigns = totalDesigns - activeDesigns;

      // Recent employees for the directory
      const { data: recentEmpData } = await supabase
        .from("employees")
        .select("id, full_name, designation, status, email, created_at")
        .eq("retailer_id", retailer.id)
        .order("created_at", { ascending: false })
        .limit(5);

      recentEmployees = recentEmpData || [];
    }
  }

  const userIdentifier = user?.email || user?.phone || "";

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[#E5E7EB] bg-white px-4 md:px-10 py-3 shadow-sm">
        <div className="flex flex-row items-center gap-4">
          <SignOutButton />
          {userIdentifier && (
            <span className="hidden md:inline text-[13px] text-[#6B7280] font-medium tracking-wide">
              {userIdentifier}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[14px] font-bold text-[#111827] bg-[#F3F4F6] px-3 py-1.5 rounded-full">
            {businessName}
          </span>
        </div>
      </header>

      <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-10 py-10">
        <div className="flex flex-col gap-8">
          {/* Welcome Section */}
          <div>
            <h1 className="text-[clamp(24px,3vw,32px)] font-extrabold text-[#111827] tracking-tight mb-2">
              Welcome back to your store
            </h1>
            <p className="text-[15px] text-[#6B7280]">
              Manage your employees and designs.
            </p>
          </div>
          
          {/* Stats Cards */}
          <DashboardStats 
            employeesCount={employeesCount}
            activeEmployeesCount={activeEmployeesCount}
            activeDesigns={activeDesigns} 
            totalDesigns={totalDesigns}
            archivedDesigns={archivedDesigns}
            isLoading={false} 
          />

          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
            <Link
              href="/dashboard/retailer/employees"
              className="group relative bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-[16px] p-6 flex items-center gap-5 shadow-sm hover:shadow-md transition-all hover:border-blue-200"
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-200 transition-colors shrink-0">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-[#111827] group-hover:text-blue-900 transition-colors">Add New Employee</h3>
                <p className="text-[13px] text-[#6B7280] mt-0.5">Create login credentials for your staff</p>
              </div>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-gray-300 group-hover:text-blue-400 transition-colors ml-auto shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              href="/dashboard/retailer/catalogue"
              className="group relative bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-100 rounded-[16px] p-6 flex items-center gap-5 shadow-sm hover:shadow-md transition-all hover:border-purple-200"
            >
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 group-hover:bg-purple-200 transition-colors shrink-0">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-[#111827] group-hover:text-purple-900 transition-colors">Upload Design</h3>
                <p className="text-[13px] text-[#6B7280] mt-0.5">Add new images to your store catalogue</p>
              </div>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-gray-300 group-hover:text-purple-400 transition-colors ml-auto shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Employee Directory */}
          {recentEmployees.length > 0 && (
            <div className="w-full max-w-3xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[16px] font-bold text-[#111827]">Employee Directory</h2>
                <Link
                  href="/dashboard/retailer/employees"
                  className="text-[13px] font-semibold text-gray-500 hover:text-[#111827] transition-colors"
                >
                  View all →
                </Link>
              </div>
              <div className="bg-white border border-gray-200 rounded-[16px] shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {recentEmployees.map((emp) => (
                    <div key={emp.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-[14px] font-bold text-gray-500 shrink-0">
                        {emp.full_name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold text-[#111827] truncate">{emp.full_name}</p>
                        <p className="text-[12px] text-[#6B7280] truncate">{emp.email}</p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 shrink-0">
                        {emp.designation}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold shrink-0 ${
                        emp.status === "active"
                          ? "bg-[#DCFCE7] text-[#166534]"
                          : "bg-[#F3F4F6] text-[#4B5563]"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${emp.status === "active" ? "bg-[#16A34A]" : "bg-[#9CA3AF]"}`} />
                        {emp.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
