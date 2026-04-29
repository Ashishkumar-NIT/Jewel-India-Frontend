"use client";

import EmployeeSidebar from "./EmployeeSidebar";

/**
 * Client wrapper that renders the permanent sidebar + main content area.
 * The sidebar is fixed at 60px; content is offset by the same amount.
 */
export default function EmployeeLayout({ employeeName, businessName, children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#FAFAFA" }}>
      <EmployeeSidebar />

    
      <main
        style={{
          marginLeft: 60,
          flex: 1,
          width: "calc(100% - 60px)",
          minHeight: "100vh",
        }}
      >
        {children}
      </main>
    </div>
  );
}
