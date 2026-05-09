import Image from "next/image";
import Link from "next/link";
import { memo } from "react";

function DashboardStats({
  employeesCount,
  activeEmployeesCount,
  activeDesigns,
  totalDesigns,
  archivedDesigns,
  isLoading,
}) {
  const statCardClasses = "bg-white rounded-[32px] p-6 flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden h-[180px] w-full";
  
  if (isLoading) {
    return (
      <>
        <div className={`${statCardClasses} animate-pulse`}>
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className={`${statCardClasses} animate-pulse`}>
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
        </div>
      </>
    );
  }

  const inactiveEmployees = (employeesCount || 0) - (activeEmployeesCount || 0);

  return (
    <>
      {/* Total Employees */}
      <div className={statCardClasses}>
        <h3 className="text-[#111111] font-medium text-[18px]">Total Employee</h3>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-[56px] font-bold text-[#111111] leading-none tracking-tight">
            {activeEmployeesCount || 0}
          </span>
          <span className="text-[16px] text-[#6B7280] font-medium ml-1 mb-2">Active</span>
        </div>
        <div className="mt-auto">
          <p className="text-[14px] text-[#9CA3AF] font-medium">
            {employeesCount || 0} total <span className="mx-1">•</span> <span className="font-medium">{inactiveEmployees} inactive</span>
          </p>
        </div>
      </div>

      {/* Store Designs */}
      <div className={statCardClasses}>
        <div className="flex justify-between items-start">
          <h3 className="text-[#111111] font-medium text-[18px]">Store Designs</h3>
          <Link href="/dashboard/retailer/catalogue" className="w-[48px] h-[48px] bg-black rounded-full flex items-center justify-center hover:bg-gray-900 transition-colors shrink-0">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </Link>
        </div>
        <div className="flex flex-col mt-2">
          <span className="text-[56px] font-bold text-[#111111] leading-none tracking-tight">
            {activeDesigns || 0}
          </span>
        </div>
        <div className="mt-auto">
          <p className="text-[14px] text-[#9CA3AF] font-medium">
            {totalDesigns || 0} total <span className="mx-1">•</span> <span className="font-medium">{archivedDesigns || 0} archived</span>
          </p>
        </div>
      </div>
    </>
  );
}

export default memo(DashboardStats);
