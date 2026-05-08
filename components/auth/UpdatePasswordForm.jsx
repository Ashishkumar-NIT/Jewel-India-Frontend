"use client";

import { useState } from "react";
import { updatePassword } from "../../lib/actions/auth";
import Link from "next/link";

export function UpdatePasswordForm() {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const formData = new FormData(e.target);
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const result = await updatePassword(password);
    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      {success ? (
        <div className="flex flex-col gap-4 text-center">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">Password updated!</h3>
          <p className="text-sm text-gray-500">
            Your password has been changed successfully.
          </p>
          <div className="pt-4">
            <Link
              href="/signin"
              className="w-full h-[48px] bg-[#1F2937] hover:bg-[#111827] text-white text-[14px] font-bold rounded-[12px] flex items-center justify-center transition-colors"
            >
              Continue to Dashboard
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* New Password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-[13.5px] text-[#6B7280] font-normal"
            >
              New Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                required
                minLength={6}
                className="h-[48px] w-full border-[1.5px] border-[#E5E7EB] bg-white rounded-[8px] px-[12px] pr-[40px] text-[15px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors flex items-center justify-center w-5 h-5 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.638 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="confirmPassword"
              className="text-[13.5px] text-[#6B7280] font-normal"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Confirm new password"
              required
              minLength={6}
              className="h-[48px] w-full border-[1.5px] border-[#E5E7EB] bg-white rounded-[8px] px-[12px] text-[15px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none transition-colors"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 animate-fade-in -mt-[4px]">
              <span className="shrink-0 w-1 h-1 rounded-full bg-red-500 mt-1.5" />
              <p className="text-[12px] text-red-600">{error}</p>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[48px] bg-[#1F2937] hover:bg-[#111827] text-white text-[14px] font-bold rounded-[12px] flex items-center justify-center transition-colors disabled:opacity-70 disabled:cursor-not-allowed border-none"
            >
              {loading ? "Updating..." : "Update password"}
            </button>
          </div>
        </>
      )}
    </form>
  );
}
