import { createClient } from "../../../lib/supabase/server";
import { getAuthUser } from "../../../lib/supabase/queries";
import DashboardStats from "../../../components/retailer/DashboardStats";
import EmployeePortalCard from "../../../components/retailer/EmployeePortalCard";
import DashboardDirectory from "../../../components/retailer/DashboardDirectory";
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
    <div className="flex flex-col min-h-screen bg-[#F0F2F5]">
      <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-8">
        <div className="flex flex-col gap-6">

          {/* Header */}
          <div>
            <h1 className="text-[28px] font-bold text-[#111111] tracking-tight mb-0.5">Dashboard</h1>
            <p className="text-[14px] text-[#6B7280]">Welcome back! Here's your store overview</p>
          </div>

          {/* Row 1: 3 stat cards */}
          <div className="grid grid-cols-3 gap-4 w-full">
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
          <div className="grid grid-cols-2 gap-4 w-full max-w-[66%]">
            <Link
              href="?modal=add-employee"
              scroll={false}
              className="bg-white rounded-[20px] p-5 flex flex-row items-center gap-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all min-h-[100px]"
            >
              <div className="w-[52px] h-[52px] rounded-[14px] bg-[#EEF2FF] flex items-center justify-center shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/>
                </svg>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-[15px] font-bold text-[#111111]">Add New Employee</h3>
                <p className="text-[13px] text-[#6B7280] leading-snug">Create employee accounts and login credentials</p>
              </div>
            </Link>

            <Link
              href="/dashboard/retailer/catalogue"
              className="bg-white rounded-[20px] p-5 flex flex-row items-center gap-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all min-h-[100px]"
            >
              <div className="w-[52px] h-[52px] rounded-[14px] bg-[#F5F3FF] flex items-center justify-center shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-[15px] font-bold text-[#111111]">Upload Design</h3>
                <p className="text-[13px] text-[#6B7280] leading-snug">Add new jewellery designs to your private catalogue</p>
              </div>
            </Link>
          </div>

          {/* Row 3: Employee Directory */}
          <div className="w-full bg-white rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50">
              <h2 className="text-[16px] font-bold text-[#111111]">Employee Directory</h2>
            </div>
            <DashboardDirectory initialEmployees={recentEmployees} />
          </div>

        </div>
      </div>
    </div>
  );
}
