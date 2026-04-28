"use client";

import { useState, useEffect, useRef } from "react";
import { EmployeeTable } from "../../../../components/retailer/EmployeeTable";

export default function RetailerEmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cache fetched employees in a ref so revisits don't cause redundant refetches.
  // Only refetch if explicitly needed (e.g., after mutation via onUpdate).
  const cachedEmployees = useRef([]);

  const fetchEmployees = async (force = false) => {
    // Skip if we already have data and this isn't a forced refresh
    if (!force && cachedEmployees.current.length > 0) {
      setEmployees(cachedEmployees.current);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/employees/list");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load employees");
      cachedEmployees.current = data.data || [];
      setEmployees(cachedEmployees.current);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []); // Only run once on mount — data persists in ref

  const handleToggleStatus = async (id, isActive) => {
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_active: isActive,
          status: isActive ? "active" : "inactive"
        }),
      });
      if (!res.ok) throw new Error("Failed to update status");

      // Update cache in-place without refetch
      cachedEmployees.current = cachedEmployees.current.map(e =>
        e.id === id ? { ...e, is_active: isActive } : e
      );
      setEmployees(cachedEmployees.current);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete employee");

      cachedEmployees.current = cachedEmployees.current.filter(e => e.id !== id);
      setEmployees(cachedEmployees.current);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen relative">
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-10 py-10">
        <div className="flex flex-col gap-1 mb-8">
          <h1 className="text-[clamp(28px,3vw,32px)] font-extrabold text-[#111827] tracking-tight">
            Employees
          </h1>
          <p className="text-[14px] text-[#6B7280]">
            Welcome back! Here's an overview of your employees
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-[10px] text-sm font-medium">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col gap-4 animate-pulse">
            <div className="h-[52px] bg-gray-200 rounded-[12px] w-full"></div>
            <div className="h-[300px] bg-gray-100 rounded-[16px] w-full"></div>
          </div>
        ) : (
          <EmployeeTable
            employees={employees}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDelete}
            onUpdate={() => fetchEmployees(true)} // Force refresh after designation change
          />
        )}
      </main>
    </div>
  );
}
