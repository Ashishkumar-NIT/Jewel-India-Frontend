"use client";

import { useState, useMemo, useDeferredValue } from "react";
import Image from "next/image";

export function EmployeeTable({ employees, onToggleStatus, onDelete, onUpdate }) {
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [actionsEmployee, setActionsEmployee] = useState(null);

  // Actions Modal State
  const [editDesignation, setEditDesignation] = useState("");
  const [isUpdatingDesignation, setIsUpdatingDesignation] = useState(false);

  // Defer search value to keep filter non-blocking during re-renders
  const search = useDeferredValue(searchInput);

  // Memoize filtered list so it's not recomputed on every render
  const filteredEmployees = useMemo(() => {
    const q = search.toLowerCase();
    return employees.filter(emp =>
      !q ||
      emp.full_name?.toLowerCase().includes(q) ||
      emp.email?.toLowerCase().includes(q)
    );
  }, [employees, search]);

  const handleToggle = async (emp) => {
    setTogglingId(emp.id);
    const newStatus = emp.status === "active" ? false : (emp.is_active ? false : true);
    await onToggleStatus(emp.id, newStatus);
    setTogglingId(null);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to permanently delete this employee? This action cannot be undone.")) {
      setDeletingId(id);
      await onDelete(id);
      setDeletingId(null);
      if (actionsEmployee?.id === id) {
        setActionsEmployee(null);
      }
    }
  };

  const openActions = (emp) => {
    setActionsEmployee(emp);
    setEditDesignation(emp.designation || "");
  };

  const closeActions = () => {
    setActionsEmployee(null);
  };

  const handleApplyDesignation = async () => {
    if (!actionsEmployee || editDesignation === actionsEmployee.designation) return;
    setIsUpdatingDesignation(true);
    try {
      const res = await fetch(`/api/employees/${actionsEmployee.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ designation: editDesignation }),
      });
      if (!res.ok) throw new Error("Failed to update designation");
      if (onUpdate) onUpdate(); // Refresh parent
      closeActions();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsUpdatingDesignation(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const getPastelColor = (name) => {
    const colors = ["#fef3c7", "#e0e7ff", "#dcfce7", "#fce7f3", "#f3e8ff"];
    return colors[(name?.charCodeAt(0) || 0) % colors.length];
  };

  const getStatus = (emp) => {
    if (emp.status === "active" || emp.is_active === true) return "Active";
    return "Inactive";
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Search Input */}
      <div className="relative w-full shadow-[0_2px_10px_rgba(0,0,0,0.03)] rounded-[12px]">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-[18px] h-[18px] text-[#9CA3AF]">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input 
          type="text"
          placeholder="Search employees by name or email..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full bg-white border border-gray-100 rounded-[12px] pl-11 pr-4 h-[52px] text-[14px] outline-none focus:ring-2 focus:ring-black/5 text-[#111827] placeholder-[#9CA3AF]"
        />
      </div>

      {/* Employee Table */}
      <div className="bg-white border border-gray-100 rounded-[16px] shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left border-collapse">
            <thead>
              <tr>
                <th className="px-6 py-4 text-[13px] font-normal text-[#6B7280]">Employee</th>
                <th className="px-6 py-4 text-[13px] font-normal text-[#6B7280]">Contact</th>
                <th className="px-6 py-4 text-[13px] font-normal text-[#6B7280]">Role</th>
                <th className="px-6 py-4 text-[13px] font-normal text-[#6B7280]">Status</th>
                <th className="px-6 py-4 text-[13px] font-normal text-[#6B7280]">Last Active</th>
                <th className="px-6 py-4 text-[13px] font-normal text-[#6B7280] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEmployees.map((emp) => {
                const isActive = getStatus(emp) === "Active";
                return (
                  <tr key={emp.id} className="hover:bg-gray-50/30 transition-colors">
                    {/* Employee */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-[40px] h-[40px] rounded-full flex items-center justify-center text-[15px] font-bold text-[#4B5563] shrink-0 border border-black/5"
                          style={{ backgroundColor: getPastelColor(emp.full_name) }}
                        >
                          {emp.full_name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <span className="text-[14px] font-bold text-[#111827]">{emp.full_name}</span>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-medium text-[#111827]">{emp.email}</span>
                        {emp.phone && <span className="text-[13px] text-[#6366F1]">{emp.phone}</span>}
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-[13px] text-[#6B7280]">{emp.designation}</span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-2.5 py-1 rounded-[6px] text-[12px] font-semibold ${
                        isActive ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#FEF3C7] text-[#B45309]"
                      }`}>
                        {isActive ? "Active" : "Inactive"}
                      </div>
                    </td>

                    {/* Last Active */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-[13px] text-[#9CA3AF]">
                        {emp.last_active_at ? emp.last_active_at : "---"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => handleToggle(emp)}
                          disabled={togglingId === emp.id}
                          className="px-3 py-1.5 border border-gray-200 rounded-[8px] text-[13px] font-medium text-[#4B5563] hover:border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          {isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button 
                          onClick={() => openActions(emp)}
                          className="p-1 text-[#9CA3AF] hover:text-[#111827] transition-colors"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z" />
                            <path d="M19 14C20.1046 14 21 13.1046 21 12C21 10.8954 20.1046 10 19 10C17.8954 10 17 10.8954 17 12C17 13.1046 17.8954 14 19 14Z" />
                            <path d="M5 14C6.10457 14 7 13.1046 7 12C7 10.8954 6.10457 10 5 10C3.89543 10 3 10.8954 3 12C3 13.1046 3.89543 14 5 14Z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-[#9CA3AF] text-[14px]">
                    No employees found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions Modal Overlay */}
      {actionsEmployee && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-[480px] rounded-[16px] border border-white shadow-[0_10px_40px_rgba(0,0,0,0.1)] relative flex flex-col p-6 sm:p-8">
            
            <button onClick={closeActions} className="absolute top-6 right-6 text-black hover:opacity-70 transition-opacity">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <h2 className="text-[20px] font-extrabold text-[#111827] mb-6">Actions</h2>

            <div className="flex flex-col gap-5">
              {/* Email id */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[14px] font-bold text-[#111827]">Email id</label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={actionsEmployee.email}
                    className="w-full h-[48px] bg-[#F3F4F6] rounded-[10px] pl-[14px] pr-[48px] text-[15px] text-[#6B7280] outline-none"
                  />
                  <button 
                    onClick={() => copyToClipboard(actionsEmployee.email)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    <Image src="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777306236/retailerProfile_COPY_szewo3.svg" alt="Copy" width={20} height={20} className="object-contain" />
                  </button>
                </div>
              </div>

              {/* Passwords */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[14px] font-bold text-[#111827]">Passwords</label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value="****************"
                    className="w-full h-[48px] bg-[#F3F4F6] rounded-[10px] pl-[14px] pr-[48px] text-[15px] text-[#6B7280] outline-none tracking-widest"
                  />
                  <button 
                    onClick={() => copyToClipboard(actionsEmployee.password_plain)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    <Image src="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777306236/retailerProfile_COPY_szewo3.svg" alt="Copy" width={20} height={20} className="object-contain" />
                  </button>
                </div>
              </div>

              {/* Designation */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[14px] font-bold text-[#111827]">Designation</label>
                <div className="relative w-fit">
                  <input
                    type="text"
                    value={editDesignation}
                    onChange={(e) => setEditDesignation(e.target.value)}
                    className="h-[40px] bg-[#F3F4F6] rounded-[10px] pl-[14px] pr-[44px] text-[14px] text-[#4B5563] outline-none focus:ring-2 focus:ring-black/10 min-w-[140px] max-w-full"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-[10px] p-4 mt-2">
                <p className="text-[13px] text-[#1D4ED8] leading-relaxed">
                  <span className="font-bold">Auto-generated credentials:</span> Login credentials will be automatically generated and displayed after creation.
                </p>
              </div>

              {/* Bottom Buttons */}
              <div className="flex items-center justify-end gap-3 mt-4 pt-2">
                <button
                  onClick={() => handleDelete(actionsEmployee.id)}
                  disabled={deletingId === actionsEmployee.id}
                  className="flex items-center gap-2 h-[44px] px-5 bg-[#FEE2E2] text-[#B91C1C] font-bold text-[13px] rounded-full hover:bg-red-200 transition-colors mr-auto uppercase tracking-wide disabled:opacity-70"
                >
                  <Image src="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777306235/retailerProfile_TRASH_v21ak2.svg" alt="Trash" width={16} height={16} />
                  {deletingId === actionsEmployee.id ? "Deleting..." : "Delete Account"}
                </button>

                {editDesignation !== actionsEmployee.designation ? (
                  <button
                    onClick={handleApplyDesignation}
                    disabled={isUpdatingDesignation}
                    className="h-[44px] px-6 bg-black text-white font-medium text-[14px] rounded-[10px] hover:bg-gray-800 transition-colors disabled:opacity-70"
                  >
                    {isUpdatingDesignation ? "Applying..." : "Apply"}
                  </button>
                ) : (
                  <button
                    onClick={closeActions}
                    className="h-[44px] px-6 bg-white border border-gray-300 text-[#111827] font-medium text-[14px] rounded-[10px] hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
