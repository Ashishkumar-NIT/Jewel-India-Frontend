"use client";

import Image from "next/image";
import Link from "next/link";

export default function DashboardStats({
  employeesCount,
  activeEmployeesCount,
  activeDesigns,
  totalDesigns,
  archivedDesigns,
  isLoading,
}) {
  const statCardClasses = "bg-white border border-gray-100 rounded-[16px] p-6 flex flex-col justify-between shadow-[0_2px_10px_rgba(0,0,0,0.03)] relative overflow-hidden h-[160px]";
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        <div className={`${statCardClasses} animate-pulse`}>
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className={`${statCardClasses} animate-pulse`}>
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  const inactiveEmployees = (employeesCount || 0) - (activeEmployeesCount || 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
      {/* Total Employees */}
      <div className={statCardClasses}>
        <h3 className="text-[#6B7280] font-medium text-[14px]">Total Employee</h3>
        <div className="flex flex-col mt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-[48px] font-bold text-[#111827] leading-none tracking-tight">
              {activeEmployeesCount || 0}
            </span>
            <span className="text-[14px] text-[#6B7280] font-medium">Active</span>
          </div>
        </div>
        <div className="mt-auto pt-4">
          <p className="text-[12px] text-[#6B7280] font-medium">
            {employeesCount || 0} total <span className="mx-1">•</span> <span className="font-bold text-[#111827]">{inactiveEmployees} inactive</span>
          </p>
        </div>
      </div>

      {/* Store Designs */}
      <div className={statCardClasses}>
        <div className="flex justify-between items-start">
          <h3 className="text-[#6B7280] font-medium text-[14px]">Store Designs</h3>
          <Link href="/dashboard/retailer/catalogue" className="w-[32px] h-[32px] bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors shrink-0">
            <Image 
              src="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777324996/retailerProfile_ARROW_lszrl6.svg" 
              alt="Arrow Right" 
              width={14} 
              height={14} 
              className="object-contain"
            />
          </Link>
        </div>
        <div className="flex flex-col mt-1">
          <span className="text-[48px] font-bold text-[#111827] leading-none tracking-tight">
            {activeDesigns || 0}
          </span>
        </div>
        <div className="mt-auto pt-4">
          <p className="text-[12px] text-[#6B7280] font-medium">
            {totalDesigns || 0} total <span className="mx-1">•</span> <span className="font-bold text-[#111827]">{archivedDesigns || 0} archived</span>
          </p>
        </div>
      </div>
    </div>
  );
}
