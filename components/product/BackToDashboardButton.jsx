"use client";

import { useRouter } from "next/navigation";

export function BackToDashboardButton({ href = "/dashboard/wholesaler", label = "Back to dashboard" }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.push(href)}
      className="flex items-center gap-2 text-sm text-[#374151] hover:text-[#111827] transition-colors cursor-pointer font-sfpro"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}
