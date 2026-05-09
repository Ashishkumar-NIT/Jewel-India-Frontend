import { createClient } from "../../../lib/supabase/server";
import { getAuthUser } from "../../../lib/supabase/queries";
import DashboardStats from "../../../components/retailer/DashboardStats";
import EmployeePortalCard from "../../../components/retailer/EmployeePortalCard";
import Link from "next/link";
import Image from "next/image";

export default async function RetailerDashboardPage() {
  const user = await getAuthUser();
  const supabase = await createClient();

  let employeesCount = 0;
  let activeEmployeesCount = 0;
  let activeDesigns = 0;
  let totalDesigns = 0;
  let archivedDesigns = 0;
  let recentEmployees = [];

  if (user) {
    const { data: retailer } = await supabase
      .from("retailers")
      .select("id, business_name")
      .eq("user_id", user.id)
      .single();

    if (retailer) {
      const [empCountResult, activeEmpResult, totalDesignResult, activeDesignResult, recentEmpData] = await Promise.all([
        supabase
          .from("employees")
          .select("*", { count: "exact", head: true })
          .eq("retailer_id", retailer.id),
        supabase
          .from("employees")
          .select("*", { count: "exact", head: true })
          .eq("retailer_id", retailer.id)
          .eq("status", "active"),
        supabase
          .from("retailer_designs")
          .select("*", { count: "exact", head: true })
          .eq("retailer_id", retailer.id),
        supabase
          .from("retailer_designs")
          .select("*", { count: "exact", head: true })
          .eq("retailer_id", retailer.id)
          .eq("is_archived", false),
        supabase
          .from("employees")
          .select("id, full_name, designation, status, email, created_at")
          .eq("retailer_id", retailer.id)
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      employeesCount = empCountResult.count || 0;
      activeEmployeesCount = activeEmpResult.count || 0;
      totalDesigns = totalDesignResult.count || 0;
      activeDesigns = activeDesignResult.count || 0;
      archivedDesigns = totalDesigns - activeDesigns;
      recentEmployees = recentEmpData.data || [];
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F3F4F6]">
      <div className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-8 py-8">
        <div className="flex flex-col gap-8">
          {/* Welcome Section */}
          <div>
            <h1 className="text-[32px] font-bold text-[#111111] tracking-tight mb-0.5">
              Dashboard
            </h1>
            <p className="text-[15px] text-[#6B7280]">
              Welcome back! Here's your store overview
            </p>
          </div>

          {/* Row 1: Stats & Portal */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
            <DashboardStats
              employeesCount={employeesCount}
              activeEmployeesCount={activeEmployeesCount}
              activeDesigns={activeDesigns}
              totalDesigns={totalDesigns}
              archivedDesigns={archivedDesigns}
              isLoading={false}
            />
            <EmployeePortalCard />
          </div>

          {/* Row 2: Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
            <Link
              href="?modal=add-employee"
              scroll={false}
              className="bg-white rounded-[32px] p-6 flex flex-row items-center gap-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-all min-h-[120px]"
            >
              <div className="w-[64px] h-[64px] rounded-[20px] bg-[#E0E7FF] flex items-center justify-center shrink-0">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="16" y1="11" x2="22" y2="11" />
                </svg>
              </div>
              <div className="flex flex-col gap-0.5">
                <h3 className="text-[18px] font-bold text-[#111111]">Add New Employee</h3>
                <p className="text-[14px] text-[#6B7280] leading-snug">Create employee accounts and login credentials</p>
              </div>
            </Link>

            <Link
              href="/dashboard/retailer/catalogue"
              className="bg-white rounded-[32px] p-6 flex flex-row items-center gap-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-all min-h-[120px]"
            >
              <div className="w-[64px] h-[64px] rounded-[20px] bg-[#F3E8FF] flex items-center justify-center shrink-0">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <div className="flex flex-col gap-0.5">
                <h3 className="text-[18px] font-bold text-[#111111]">Upload Design</h3>
                <p className="text-[14px] text-[#6B7280] leading-snug">Add new jewellery designs to your private catalogue</p>
              </div>
            </Link>
          </div>

          {/* Row 3: Employee Directory */}
          <div className="w-full max-w-6xl bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-50">
              <h2 className="text-[20px] font-bold text-[#111111]">Employee Directory</h2>
            </div>
            {recentEmployees.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {recentEmployees.map((emp) => {
                  const hoursActive = Math.max(1, Math.floor((new Date() - new Date(emp.created_at)) / (1000 * 60 * 60)));
                  return (
                    <div key={emp.id} className="flex items-center justify-between px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-[48px] h-[48px] rounded-full flex items-center justify-center text-[16px] font-bold shrink-0 overflow-hidden" style={{ backgroundColor: ["#FEF3C7", "#E0E7FF", "#DCFCE7", "#FCE7F3", "#F3E8FF"][(emp.full_name?.charCodeAt(0) || 0) % 5], color: ["#92400E", "#3730A3", "#166534", "#9D174D", "#6B21A8"][(emp.full_name?.charCodeAt(0) || 0) % 5] }}>
                          {emp.full_name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[16px] font-bold text-[#111111]">{emp.full_name}</span>
                          <span className="text-[14px] text-[#6B7280]">{emp.designation || "Staff"}</span>
                        </div>
                      </div>

                      {emp.status === "active" ? (
                        <div className="px-4 py-2 bg-[#DCFCE7] text-[#166534] text-[13px] font-semibold rounded-[10px] whitespace-nowrap">
                          Active from {hoursActive} hours
                        </div>
                      ) : (
                        <div className="px-4 py-2 bg-[#FEE2E2] text-[#B91C1C] text-[13px] font-semibold rounded-[10px] whitespace-nowrap">
                          Inactive
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center text-[#6B7280] text-[15px]">
                No employees found. Add one to get started.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
