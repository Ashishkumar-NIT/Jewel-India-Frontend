"use client";

import { useState, useEffect } from "react";

/**
 * EmployeePortalCard — Displayed on the retailer dashboard.
 * Shows the employee login URL that the retailer can copy and share
 * with employees so they can sign in through the dedicated login page.
 */
export default function EmployeePortalCard() {
  const [copied, setCopied] = useState(false);
  const [portalUrl, setPortalUrl] = useState("");

  useEffect(() => {
    // Build the employee login URL from current origin
    const origin = window.location.origin;
    setPortalUrl(`${origin}/employee-login`);
  }, []);

  // Display-friendly URL (strip protocol)
  const displayUrl = portalUrl.replace(/^https?:\/\//, "");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(portalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = portalUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpen = () => {
    window.open(portalUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="bg-white rounded-[20px] p-5 w-full flex flex-col justify-between shadow-[0_2px_12px_rgba(0,0,0,0.05)] h-[160px]"
    >
      {/* Header Row */}
      <div className="flex items-start justify-between">
        <h3 className="text-[15px] font-medium text-[#111111]">
          Employee portal
        </h3>

        {/* Open in new tab button */}
        <button
          onClick={handleOpen}
          className="w-[44px] h-[44px] rounded-full bg-black flex items-center justify-center hover:bg-gray-900 transition-colors shrink-0"
          title="Open employee login page"
          aria-label="Open employee login page in new tab"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="7" y1="17" x2="17" y2="7" />
            <polyline points="7 7 17 7 17 17" />
          </svg>
        </button>
      </div>

      {/* Content Area */}
      <div>
        {/* URL Copy Box */}
        <div
          className="flex items-center justify-between gap-3 bg-[#FCFCFC] rounded-[12px] px-4 py-2.5 mb-2 border border-[#F0F0F0]"
        >
          <span className="text-[14px] font-semibold text-[#111111] truncate">
            {displayUrl || "Loading..."}
          </span>

          <button
            onClick={handleCopy}
            className="shrink-0 transition-opacity hover:opacity-70"
            title={copied ? "Copied!" : "Copy URL"}
            aria-label="Copy employee portal URL"
          >
            {copied ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#16A34A"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="9.6" y="9.6" width="10.8" height="10.8" rx="2.4" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14.4 9.6V6C14.4 4.67452 13.3255 3.6 12 3.6H6C4.67452 3.6 3.6 4.67452 3.6 6V12C3.6 13.3255 4.67452 14.4 6 14.4H9.6" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>

        {/* Description */}
        <p className="text-[12px] text-[#9CA3AF] leading-snug">
          Employee access for catalogue and order management.
        </p>
      </div>
    </div>
  );
}
