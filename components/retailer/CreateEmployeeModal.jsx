"use client";

import { useState } from "react";

export function CreateEmployeeModal({ isOpen, onClose, onEmployeeCreated }) {
  const [formData, setFormData] = useState({
    full_name: "",
    designation: "",
    phone: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name || !formData.designation) {
      setError("Name and Designation are required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/employees/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create employee.");
      }

      onEmployeeCreated(data.data); // pass the returned employee up
      setFormData({ full_name: "", designation: "", phone: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-[20px] w-full max-w-[420px] shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[20px] font-extrabold text-[#111827] tracking-tight">Add New Employee</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-[18px] h-[18px]">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-semibold text-[#374151]">Full Name*</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="E.g. Rohan Verma"
              className="w-full bg-[#F5F5F5] rounded-[8px] border-none px-4 py-3 text-[14px] text-[#374151] placeholder:text-[#9CA3AF] focus:ring-2 focus:ring-black/10 outline-none transition-shadow"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-semibold text-[#374151]">Designation / Role*</label>
            <input
              type="text"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              placeholder="E.g. Sales Manager"
              className="w-full bg-[#F5F5F5] rounded-[8px] border-none px-4 py-3 text-[14px] text-[#374151] placeholder:text-[#9CA3AF] focus:ring-2 focus:ring-black/10 outline-none transition-shadow"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-semibold text-[#374151]">Phone Number (Optional)</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              className="w-full bg-[#F5F5F5] rounded-[8px] border-none px-4 py-3 text-[14px] text-[#374151] placeholder:text-[#9CA3AF] focus:ring-2 focus:ring-black/10 outline-none transition-shadow"
            />
          </div>

          {error && <span className="text-[12px] text-red-500 font-medium">{error}</span>}

          <p className="text-[11px] text-gray-500 leading-relaxed mt-2 mb-1">
            We will automatically generate a secure email login and password for this employee. You'll be able to copy the credentials on the next screen.
          </p>

          <button
            type="submit"
            disabled={isSubmitting || !formData.full_name || !formData.designation}
            className="w-full mt-2 bg-[#111827] text-white font-bold py-3.5 rounded-[12px] hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating..." : "Generate Credentials & Add Employee"}
          </button>
        </form>
      </div>
    </div>
  );
}
