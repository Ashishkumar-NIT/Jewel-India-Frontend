"use client";

export default function DashboardStats({
  employeesCount,
  activeEmployeesCount,
  activeDesigns,
  totalDesigns,
  archivedDesigns,
  isLoading,
}) {
  const statCardClasses = "bg-white border border-[#E5E7EB] rounded-[16px] p-6 flex flex-col gap-2 shadow-sm relative overflow-hidden";
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        <div className={`${statCardClasses} min-h-[120px] animate-pulse`}>
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className={`${statCardClasses} min-h-[120px] animate-pulse`}>
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
      {/* Total Employees */}
      <div className={statCardClasses}>
        <div className="flex justify-between items-start">
          <h3 className="text-[#6B7280] font-medium text-[14px]">Total Employees</h3>
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-[18px] h-[18px]">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
        <div className="text-[36px] font-bold text-[#111827] mt-1 tracking-tight">
          {employeesCount || 0}
        </div>
        {typeof activeEmployeesCount !== "undefined" && (
          <p className="text-[12px] text-[#6B7280]">
            {activeEmployeesCount || 0} active
          </p>
        )}
      </div>

      {/* Store Designs */}
      <div className={statCardClasses}>
        <div className="flex justify-between items-start">
          <h3 className="text-[#6B7280] font-medium text-[14px]">Store Designs</h3>
          <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-[18px] h-[18px]">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <div className="text-[36px] font-bold text-[#111827] mt-1 tracking-tight">
          {activeDesigns || 0}
        </div>
        {typeof totalDesigns !== "undefined" && (
          <p className="text-[12px] text-[#6B7280]">
            {totalDesigns || 0} total · {archivedDesigns || 0} archived
          </p>
        )}
      </div>
    </div>
  );
}
