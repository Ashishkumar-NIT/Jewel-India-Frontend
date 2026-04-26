"use client";

import { useState } from "react";

export function EmployeeTable({ employees, onToggleStatus, onDelete }) {
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [search, setSearch] = useState("");

  const filteredEmployees = employees.filter(emp => 
    emp.full_name.toLowerCase().includes(search.toLowerCase()) ||
    emp.designation.toLowerCase().includes(search.toLowerCase()) ||
    emp.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = async (emp) => {
    setTogglingId(emp.id);
    await onToggleStatus(emp.id, !emp.is_active);
    setTogglingId(null);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to permanently delete this employee? This action cannot be undone.")) {
      setDeletingId(id);
      await onDelete(id);
      setDeletingId(null);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Search Input */}
      <div className="relative w-full max-w-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-[16px] h-[16px] text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input 
          type="text" 
          placeholder="Search employees..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-[10px] pl-10 pr-4 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-black/5"
        />
      </div>

      {filteredEmployees.length === 0 ? (
        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-[16px] p-10 flex flex-col items-center justify-center text-center">
          <span className="text-gray-400 mb-2">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </span>
          <p className="text-[14px] text-gray-500 font-medium">No employees found.</p>
        </div>
      ) : (
        <div className="bg-white border text-left border-gray-200 rounded-[16px] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-[#F9FAFB] border-b text-left border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider text-left">Employee</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider text-left">Designation</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider text-left">Credentials</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider text-left">Status</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Name & Email Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-[14px] font-bold text-gray-900">{emp.full_name}</span>
                        {emp.phone && <span className="text-[13px] text-gray-500">{emp.phone}</span>}
                      </div>
                    </td>

                    {/* Designation */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-blue-50 text-blue-700">
                        {emp.designation}
                      </span>
                    </td>

                    {/* Copiable Credentials */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1 w-fit">
                        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigator.clipboard.writeText(emp.email)}>
                          <span className="text-[13px] text-gray-600 font-mono" title="Click to copy block">{emp.email}</span>
                          <span className="text-[10px] font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">COPY</span>
                        </div>
                        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigator.clipboard.writeText(emp.password_plain)}>
                          <span className="text-[13px] text-gray-900 font-mono tracking-tight bg-gray-100 px-1 py-0.5 rounded" title="Click to copy password">{emp.password_plain}</span>
                          <span className="text-[10px] font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">COPY</span>
                        </div>
                      </div>
                    </td>

                    {/* Active Status Badge + Toggle */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => handleToggle(emp)}
                        disabled={togglingId === emp.id}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-bold transition-colors ${
                          emp.is_active 
                            ? "bg-[#DCFCE7] text-[#166534] hover:bg-green-200" 
                            : "bg-[#F3F4F6] text-[#4B5563] hover:bg-gray-200"
                        } ${togglingId === emp.id ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${emp.is_active ? "bg-[#16A34A]" : "bg-[#9CA3AF]"}`}></span>
                        {emp.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>

                    {/* Delete Action */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleDelete(emp.id)}
                        disabled={deletingId === emp.id}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors focus:outline-none"
                        title="Delete employee record"
                      >
                        {deletingId === emp.id ? (
                          <svg className="animate-spin h-[18px] w-[18px]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-[18px] h-[18px]">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
