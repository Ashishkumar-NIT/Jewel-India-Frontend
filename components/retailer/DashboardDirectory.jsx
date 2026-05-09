"use client";

import { useState } from "react";

export default function DashboardDirectory({ initialEmployees }) {
  const [employees, setEmployees] = useState(initialEmployees);
  const [togglingId, setTogglingId] = useState(null);

  const handleToggleStatus = async (id, currentStatus) => {
    const isNowActive = currentStatus !== "active";
    setTogglingId(id);
    
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: isNowActive ? "active" : "inactive"
        }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      
      const { data: updatedEmp } = await res.json();
      
      setEmployees(prev => {
        const next = prev.map(emp => 
          emp.id === id ? { ...emp, status: updatedEmp.status } : emp
        );
        return [...next];
      });
    } catch (err) {
      alert(err.message);
    } finally {
      setTogglingId(null);
    }
  };

  if (!employees || employees.length === 0) {
    return (
      <div className="p-12 text-center text-[#6B7280] text-[15px]">
        No employees found. Add one to get started.
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-50">
      {employees.map((emp) => {
        const hoursActive = Math.max(1, Math.floor((new Date() - new Date(emp.created_at)) / (1000 * 60 * 60)));
        const isActive = emp.status === "active";

        return (
          <div key={emp.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/60 transition-colors">
            <div className="flex items-center gap-3">
              <div
                className="w-[40px] h-[40px] rounded-full flex items-center justify-center text-[13px] font-bold shrink-0"
                style={{
                  backgroundColor: ["#FEF3C7", "#E0E7FF", "#DCFCE7", "#FCE7F3", "#F3E8FF"][(emp.full_name?.charCodeAt(0) || 0) % 5],
                  color: ["#92400E", "#3730A3", "#166534", "#9D174D", "#6B21A8"][(emp.full_name?.charCodeAt(0) || 0) % 5]
                }}
              >
                {emp.full_name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-semibold text-[#111111] leading-tight">{emp.full_name}</span>
                <span className="text-[12px] text-[#6B7280] leading-tight">{emp.designation || "Staff"}</span>
              </div>
            </div>

            {/* Status Badge only */}
            <div className={`px-3 py-1.5 text-[12px] font-semibold rounded-[8px] whitespace-nowrap ${
              isActive ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#FCE7F3] text-[#9D174D]"
            }`}>
              {isActive ? `Active from ${hoursActive} hours` : "Inactive"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
