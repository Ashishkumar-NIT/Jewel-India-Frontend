import { createClient } from "../../../lib/supabase/server";
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

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-10 py-10">
        <div className="flex flex-col gap-8">
          {/* Welcome Section */}
          <div>
            <h1 className="text-[clamp(28px,3vw,32px)] font-extrabold text-[#111827] tracking-tight mb-1">
              Dashboard
            </h1>
            <p className="text-[14px] text-[#6B7280]">
              Welcome back! Here's your store overview
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
              className="bg-white rounded-[16px] p-6 flex flex-col justify-center gap-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow border border-gray-100 min-h-[130px]"
            >
              <div className="w-[48px] h-[48px] rounded-[14px] bg-[#E0E7FF] flex items-center justify-center shrink-0">
                <img src="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777306236/retailerProfile_addEmployee_bayej7.svg" alt="Add Employee" className="w-[20px] h-[20px] object-contain" />
              </div>
              <div className="flex flex-col gap-0.5">
                <h3 className="text-[16px] font-bold text-[#111827]">Add New Employee</h3>
                <p className="text-[13px] text-[#6B7280]">Create employee accounts and login credentials</p>
              </div>
            </Link>

            <Link
              href="/dashboard/retailer/catalogue"
              className="bg-white rounded-[16px] p-6 flex flex-col justify-center gap-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow border border-gray-100 min-h-[130px]"
            >
              <div className="w-[48px] h-[48px] rounded-[14px] bg-[#F3E8FF] flex items-center justify-center shrink-0">
                <img src="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777306237/retailerProfile_upload_u1mi2x.svg" alt="Upload Design" className="w-[20px] h-[20px] object-contain" />
              </div>
              <div className="flex flex-col gap-0.5">
                <h3 className="text-[16px] font-bold text-[#111827]">Upload Design</h3>
                <p className="text-[13px] text-[#6B7280]">Add new jewellery designs to your private catalogue</p>
              </div>
            </Link>
          </div>

          {/* Employee Directory */}
          <div className="w-full max-w-3xl bg-white rounded-[16px] shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-[18px] font-bold text-[#111827]">Employee Directory</h2>
            </div>
            {recentEmployees.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {recentEmployees.map((emp) => {
                  const hoursActive = Math.max(1, Math.floor((new Date() - new Date(emp.created_at)) / (1000 * 60 * 60)));
                  return (
                    <div key={emp.id} className="flex items-center justify-between px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-[40px] h-[40px] rounded-full flex items-center justify-center text-[14px] font-bold text-[#4B5563] shrink-0 overflow-hidden border border-gray-100" style={{ backgroundColor: ["#fef3c7", "#e0e7ff", "#dcfce7", "#fce7f3", "#f3e8ff"][(emp.full_name?.charCodeAt(0) || 0) % 5] }}>
                          {emp.full_name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[14px] font-bold text-[#111827]">{emp.full_name}</span>
                          <span className="text-[12px] text-[#6B7280]">{emp.designation}</span>
                        </div>
                      </div>
                      
                      {emp.status === "active" ? (
                        <div className="px-3 py-1.5 bg-[#DCFCE7] text-[#166534] text-[12px] font-semibold rounded-[6px] whitespace-nowrap">
                          Active from {hoursActive} hours
                        </div>
                      ) : (
                        <div className="px-3 py-1.5 bg-[#FCE7F3] text-[#BE185D] text-[12px] font-semibold rounded-[6px] whitespace-nowrap">
                          Inactive
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-[#6B7280] text-[14px]">
                No employees found. Add one to get started.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
