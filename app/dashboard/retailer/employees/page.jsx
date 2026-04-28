"use client";

import { useState, useEffect } from "react";
import { SignOutButton } from "../../../../components/auth/SignOutButton";
import { EmployeeTable } from "../../../../components/retailer/EmployeeTable";
import { CreateEmployeeModal } from "../../../../components/retailer/CreateEmployeeModal";
import { EmployeeCredentialsModal } from "../../../../components/retailer/EmployeeCredentialsModal";

export default function RetailerEmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [credentialsEmployee, setCredentialsEmployee] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch("/api/employees/list");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load employees");
      setEmployees(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmployeeCreated = (newEmp) => {
    setIsAddModalOpen(false);
    setEmployees([newEmp, ...employees]);
    setCredentialsEmployee(newEmp); // Show creds right away
  };

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
      
      setEmployees(employees.map(e => e.id === id ? { ...e, is_active: isActive } : e));
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
      
      setEmployees(employees.filter(e => e.id !== id));
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
            Welcome back! Here's employee's overview
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
            onUpdate={fetchEmployees}
          />
        )}
      </main>
    </div>
  );
}
