"use client";

import { useState } from "react";
import { requestPasswordReset } from "../../lib/actions/auth";
import Link from "next/link";

export function ForgotPasswordForm() {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const formData = new FormData(e.target);
    const email = formData.get("email");

    const result = await requestPasswordReset(email);
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
          <h3 className="text-lg font-medium text-gray-900">Check your email</h3>
          <p className="text-sm text-gray-500">
            We've sent a password reset link to your email address. Please check your inbox.
          </p>
          <div className="pt-4">
            <Link
              href="/signin"
              className="w-full h-[48px] bg-white border-[1.5px] border-[#E5E7EB] hover:bg-gray-50 text-[#1F2937] text-[14px] font-bold rounded-[12px] flex items-center justify-center transition-colors"
            >
              Return to sign in
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13.5px] text-[#6B7280] font-normal">
              Email address
            </label>
            <div className="flex h-[48px] w-full items-center">
              <input
                name="email"
                type="email"
                placeholder="Enter your email"
                className="h-full w-full border-[1.5px] border-[#E5E7EB] bg-white rounded-[8px] px-[12px] text-[15px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 animate-fade-in -mt-[4px]">
              <span className="shrink-0 w-1 h-1 rounded-full bg-red-500 mt-1.5" />
              <p className="text-[12px] text-red-600">{error}</p>
            </div>
          )}

          <div className="pt-2 flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[48px] bg-[#1F2937] hover:bg-[#111827] text-white text-[14px] font-bold rounded-[12px] flex items-center justify-center transition-colors disabled:opacity-70 disabled:cursor-not-allowed border-none"
            >
              {loading ? "Sending reset link..." : "Send reset link"}
            </button>
            <Link
              href="/signin"
              className="w-full h-[48px] bg-white border-[1.5px] border-[#E5E7EB] hover:bg-gray-50 text-[#1F2937] text-[14px] font-bold rounded-[12px] flex items-center justify-center transition-colors"
            >
              Back to sign in
            </Link>
          </div>
        </>
      )}
    </form>
  );
}
