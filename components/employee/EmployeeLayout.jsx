"use client";

import { usePathname } from "next/navigation";
import EmployeeBottomNav from "./EmployeeTopNav";

export default function EmployeeLayout({ children, hasUnreadQueries = false, latestOrderUpdate = null, isRetailer = false }) {
  const pathname = usePathname();
  const hideNavbar = pathname?.includes("/dashboard/employee/playground") || pathname?.includes("/dashboard/employee/questionnaire");
  return (
    <div className="theme-employee" style={{ minHeight: "100vh", background: "#FAFAFA", display: "flex", flexDirection: "column" }}>
      {isRetailer && (
        <>
          <style>{`
            @keyframes pulse {
              0% { transform: scale(0.95); opacity: 0.5; }
              50% { transform: scale(1.1); opacity: 1; }
              100% { transform: scale(0.95); opacity: 0.5; }
            }
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(-8px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          <div
            style={{
              position: "fixed",
              top: "16px",
              right: "16px",
              zIndex: 99999,
              backgroundColor: "#FEF3C7",
              border: "1px solid #F59E0B",
              color: "#B45309",
              padding: "8px 16px",
              borderRadius: "30px",
              fontSize: "12px",
              fontWeight: "700",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              boxShadow: "0 10px 15px -3px rgba(245, 158, 11, 0.1), 0 4px 6px -4px rgba(245, 158, 11, 0.1)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              pointerEvents: "none",
              animation: "fadeIn 0.3s ease-out",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                backgroundColor: "#D97706",
                borderRadius: "50%",
                display: "inline-block",
                animation: "pulse 1.5s infinite",
              }}
            />
            Employee View Active
          </div>
        </>
      )}
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
      {!hideNavbar && (
        <EmployeeBottomNav hasUnreadQueries={hasUnreadQueries} latestOrderUpdate={latestOrderUpdate} isRetailer={isRetailer} />
      )}
    </div>
  );
}