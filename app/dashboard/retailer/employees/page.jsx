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
        body: JSON.stringify({ is_active: isActive }),
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
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E5E7EB] bg-white px-4 md:px-10 py-3 shadow-sm">
        <div className="flex flex-row items-center gap-4">
          <SignOutButton />
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-10 py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[clamp(24px,3vw,32px)] font-extrabold text-[#111827] tracking-tight mb-2">
              Staff & Employees
            </h1>
            <p className="text-[15px] text-[#6B7280]">
              Create accounts for your staff, manage their access, and share their credentials.
            </p>
          </div>
          
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-[#111827] text-white font-bold rounded-[10px] px-5 py-2.5 hover:bg-black transition-colors"
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-[18px] h-[18px]">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add Employee
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-[10px] text-sm font-medium">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col gap-4 animate-pulse">
            <div className="h-10 bg-gray-200 rounded-md w-full max-w-sm"></div>
            <div className="h-[300px] bg-gray-100 rounded-[16px] w-full"></div>
          </div>
        ) : (
          <EmployeeTable 
            employees={employees} 
            onToggleStatus={handleToggleStatus}
            onDelete={handleDelete}
          />
        )}
      </main>

      <CreateEmployeeModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onEmployeeCreated={handleEmployeeCreated}
      />

      <EmployeeCredentialsModal 
        isOpen={!!credentialsEmployee}
        employee={credentialsEmployee}
        onClose={() => setCredentialsEmployee(null)}
      />
    </div>
  );
}
