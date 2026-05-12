"use client";

/**
 * Client wrapper for the employee dashboard main content area.
 * The bottom nav is rendered only on the home page (EmployeeHomeClient).
 */
import EmployeeBottomNav from "./EmployeeTopNav";
export default function EmployeeLayout({ children }) {
  return (
    <div style={{ minHeight: "100vh", background: "#FAFAFA", display: "flex", flexDirection: "column" }}>
      <main
        style={{
          flex: 1,
          width: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </main>
      <EmployeeBottomNav />
    </div>
  );
}