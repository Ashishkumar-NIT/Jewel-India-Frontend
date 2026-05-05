"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { validateIndianMobile } from "../../lib/utils/credentials";

export default function AddEmployeeModal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const isOpen = searchParams.get("modal") === "add-employee";
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    personal_email: "",
    designation: "",
    login_email: "",
    password_plain: "",
    confirm_password: "",
  });

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setError("");
      setFormData({
        full_name: "",
        phone: "",
        personal_email: "",
        designation: "",
        login_email: "",
        password_plain: "",
        confirm_password: "",
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const closeModal = () => {
    router.replace(pathname, { scroll: false });
  };

  const handleNextStep1 = async () => {
    if (!formData.full_name || !formData.phone || !formData.personal_email || !formData.designation) {
      setError("Please fill all fields.");
      return;
    }
    const mobileCheck = validateIndianMobile(formData.phone);
    if (!mobileCheck.valid) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/employees/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: formData.full_name }),
      });
      const data = await res.json();
      if (data.email) {
        setFormData(prev => ({ ...prev, login_email: data.email }));
        setStep(2);
      } else {
        setError(data.error || "Failed to generate email.");
      }
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep2 = () => {
    if (!formData.password_plain || !formData.confirm_password) {
      setError("Please enter a password.");
      return;
    }
    if (formData.password_plain !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setStep(3);
  };

  const handleFinish = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/employees/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.full_name,
          phone: formData.phone,
          personal_email: formData.personal_email,
          designation: formData.designation,
          login_email: formData.login_email,
          password_plain: formData.password_plain,
          status: "inactive",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        closeModal();
        router.refresh();
      } else {
        setError(data.error || "Failed to save employee.");
      }
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-[480px] rounded-[16px] border border-white shadow-[0_10px_40px_rgba(0,0,0,0.1)] relative flex flex-col p-6 sm:p-8">
        
        {/* Close Button */}
        <button onClick={closeModal} className="absolute top-6 right-6 text-[#111827] hover:opacity-70 transition-opacity">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-[24px] font-bold text-[#111827] leading-tight">Add New Employee</h2>
          <p className="text-[15px] text-[#9CA3AF] mt-1">New Member, New Access</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-[13px] font-medium rounded-lg border border-red-100">
            {error}
          </div>
        )}

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-[#111827] uppercase tracking-wide">Employee Name</label>
              <input
                type="text"
                placeholder="Eg. parash"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full h-[56px] bg-[#F8F8F8] rounded-[12px] px-[20px] font-medium text-[15px] text-[#111827] outline-none border border-transparent focus:bg-white focus:border-gray-100 transition-all"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-[#111827] uppercase tracking-wide">Mobile No</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={10}
                placeholder="Eg. 9834874****"
                value={formData.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setFormData({ ...formData, phone: val });
                  if (error.includes("mobile")) setError("");
                }}
                className={`w-full h-[56px] bg-[#F8F8F8] rounded-[12px] px-[20px] font-medium text-[15px] text-[#111827] outline-none border transition-all focus:bg-white ${error.includes("mobile") ? 'border-red-400 focus:border-red-400' : 'border-transparent focus:border-gray-100'}`}
              />
              {error.includes("mobile") && (
                <span className="text-[12px] text-red-500 font-medium">{error}</span>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-[#111827] uppercase tracking-wide">Email Id</label>
              <input
                type="email"
                placeholder="Eg. Parashe@gmail.com"
                value={formData.personal_email}
                onChange={(e) => setFormData({ ...formData, personal_email: e.target.value })}
                className="w-full h-[56px] bg-[#F8F8F8] rounded-[12px] px-[20px] font-medium text-[15px] text-[#111827] outline-none border border-transparent focus:bg-white focus:border-gray-100 transition-all"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-[#111827] uppercase tracking-wide">Designation</label>
              <input
                type="text"
                placeholder="Eg. Sales"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full h-[56px] bg-[#F8F8F8] rounded-[12px] px-[20px] font-medium text-[15px] text-[#111827] outline-none border border-transparent focus:bg-white focus:border-gray-100 transition-all"
              />
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleNextStep1}
                disabled={isLoading}
                className="h-[52px] px-8 bg-black text-white font-bold text-[16px] rounded-[12px] hover:bg-black/90 transition-all shadow-[0_4px_14px_rgba(0,0,0,0.3)] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? "Loading..." : "Set Password"}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Set Password */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-extrabold text-[#4B5563] uppercase tracking-wide">Login Email</label>
              <input
                type="text"
                readOnly
                value={formData.login_email}
                className="w-full h-[56px] bg-[#F9FAFB] rounded-[10px] px-[16px] text-[15px] font-bold text-[#111827] outline-none"
              />
              <span className="text-[12px] font-medium text-[#4B5563] mt-0.5">*this is your employees email</span>
            </div>

            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-[13px] font-extrabold text-[#4B5563] uppercase tracking-wide">Set Password</label>
              <input
                type="text"
                placeholder="Eg. 9834874****"
                value={formData.password_plain}
                onChange={(e) => setFormData({ ...formData, password_plain: e.target.value })}
                className="w-full h-[56px] bg-[#F9FAFB] rounded-[10px] px-[16px] font-medium text-[15px] text-[#4B5563] outline-none focus:ring-2 focus:ring-black/5"
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-extrabold text-[#4B5563] uppercase tracking-wide">Confirm Password</label>
              <input
                type="text"
                placeholder="Eg. 9834874****"
                value={formData.confirm_password}
                onChange={(e) => {
                  setFormData({ ...formData, confirm_password: e.target.value });
                  if (error === "Passwords do not match.") setError("");
                }}
                className={`w-full h-[56px] bg-[#F9FAFB] rounded-[10px] px-[16px] font-medium text-[15px] text-[#4B5563] outline-none focus:ring-2 ${error === "Passwords do not match." ? "ring-2 ring-red-400" : "focus:ring-black/5"}`}
              />
              {error === "Passwords do not match." && (
                <span className="text-[12px] font-semibold text-red-500 mt-0.5">Passwords do not match.</span>
              )}
            </div>

            <div className="mt-8 flex items-center justify-between">
              <span className="text-[14px] text-[#9CA3AF]">Set them to access the employee account</span>
              <button
                onClick={handleNextStep2}
                className="h-[48px] px-6 bg-black text-white font-medium text-[15px] rounded-[12px] hover:bg-gray-800 shadow-md shadow-black/20 transition-colors"
              >
                Save password
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Summary */}
        {step === 3 && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-extrabold text-[#4B5563] uppercase tracking-wide">Login Email</label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={formData.login_email}
                  className="w-full h-[56px] bg-[#F9FAFB] rounded-[10px] pl-[16px] pr-[48px] text-[15px] font-bold text-[#111827] outline-none"
                />
                <button 
                  onClick={() => copyToClipboard(formData.login_email)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-200 rounded-md transition-colors"
                >
                  <Image src="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777306236/retailerProfile_COPY_szewo3.svg" alt="Copy" width={20} height={20} loading="lazy" className="object-contain" />
                </button>
              </div>
              <span className="text-[12px] font-medium text-[#4B5563] mt-0.5">*this is your employees EMAIL</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-extrabold text-[#4B5563] uppercase tracking-wide">Login Password</label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={formData.password_plain}
                  className="w-full h-[56px] bg-[#F9FAFB] rounded-[10px] pl-[16px] pr-[48px] text-[15px] font-bold text-[#111827] outline-none"
                />
                <button 
                  onClick={() => copyToClipboard(formData.password_plain)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-200 rounded-md transition-colors"
                >
                  <Image src="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777306236/retailerProfile_COPY_szewo3.svg" alt="Copy" width={20} height={20} loading="lazy" className="object-contain" />
                </button>
              </div>
              <span className="text-[12px] font-medium text-[#4B5563] mt-0.5">*this is your employees login PASSWORD</span>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <span className="text-[14px] text-[#9CA3AF]">Save these before you close.</span>
              <button
                onClick={handleFinish}
                disabled={isLoading}
                className="h-[48px] px-10 bg-black text-white font-medium text-[15px] rounded-[12px] hover:bg-gray-800 shadow-md shadow-black/20 transition-colors disabled:opacity-70"
              >
                {isLoading ? "Saving..." : "Finish"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
