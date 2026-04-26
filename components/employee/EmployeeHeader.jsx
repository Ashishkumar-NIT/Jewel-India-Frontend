"use client";

import { SignOutButton } from "../auth/SignOutButton";

/**
 * Sticky header for the employee dashboard.
 * Shows the employee name, parent retailer business name, and sign-out.
 */
export default function EmployeeHeader({ employeeName, businessName }) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[#E5E7EB] bg-white px-4 md:px-8 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Avatar initial */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-[14px] font-bold text-indigo-600 shrink-0">
          {employeeName?.charAt(0)?.toUpperCase() || "E"}
        </div>
        <div className="flex flex-col">
          <span className="text-[14px] font-bold text-[#111827] leading-tight">
            {employeeName || "Employee"}
          </span>
          {businessName && (
            <span className="text-[11px] text-[#6B7280] leading-tight">
              {businessName}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {businessName && (
          <span className="hidden md:inline text-[13px] font-semibold text-[#111827] bg-[#F3F4F6] px-3 py-1.5 rounded-full">
            {businessName}
          </span>
        )}
        <SignOutButton className="bg-[#111827] text-white px-4 py-2 rounded-[10px] text-[13px] font-semibold cursor-pointer hover:bg-black transition-colors" />
      </div>
    </header>
  );
}
