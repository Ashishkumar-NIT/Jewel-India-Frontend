"use client";

import EmployeeHeader from "./EmployeeHeader";
import EmployeeTabs from "./EmployeeTabs";

/**
 * Client wrapper that combines the header and tabs.
 * Receives employee/retailer info from the server layout and renders them.
 */
export default function EmployeeLayout({ employeeName, businessName, children }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA]">
      <EmployeeHeader employeeName={employeeName} businessName={businessName} />
      <EmployeeTabs />
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  );
}
