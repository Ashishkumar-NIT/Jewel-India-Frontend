import Link from "next/link";
import { memo } from "react";

const ArrowButton = ({ href }) => (
  <Link
    href={href}
    className="w-[44px] h-[44px] bg-black rounded-full flex items-center justify-center hover:bg-gray-900 transition-colors shrink-0"
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  </Link>
);

function DashboardStats({
  employeesCount,
  activeEmployeesCount,
  activeDesigns,
  totalDesigns,
  archivedDesigns,
  isLoading,
}) {
  const cardClass = "bg-white rounded-[20px] p-5 flex flex-col justify-between shadow-[0_2px_12px_rgba(0,0,0,0.05)] relative h-[160px] w-full";

  if (isLoading) {
    return (
      <>
        <div className={`${cardClass} animate-pulse`}>
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className={`${cardClass} animate-pulse`}>
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
      <div className={cardClass}>
        <div className="flex justify-between items-start">
          <h3 className="text-[15px] font-medium text-[#111111]">Total Employee</h3>
          <ArrowButton href="/dashboard/retailer/employees" />
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[48px] font-bold text-[#111111] leading-none tracking-tight">
              {activeEmployeesCount || 0}
            </span>
            <span className="text-[15px] text-[#6B7280] font-medium mb-1">Active</span>
          </div>
          <p className="text-[13px] text-[#9CA3AF] mt-1">
            {employeesCount || 0} total <span className="mx-1">•</span> {inactiveEmployees} inactive
          </p>
        </div>
      </div>

      {/* Store Designs */}
      <div className={cardClass}>
        <div className="flex justify-between items-start">
          <h3 className="text-[15px] font-medium text-[#111111]">Store Designs</h3>
          <ArrowButton href="/dashboard/retailer/catalogue" />
        </div>
        <div>
          <span className="text-[48px] font-bold text-[#111111] leading-none tracking-tight">
            {activeDesigns || 0}
          </span>
          <p className="text-[13px] text-[#9CA3AF] mt-1">
            {totalDesigns || 0} total <span className="mx-1">•</span> {archivedDesigns || 0} archived
          </p>
        </div>
      </div>
    </>
  );
}

export default memo(DashboardStats);
