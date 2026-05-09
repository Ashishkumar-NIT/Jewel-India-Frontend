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
      className="bg-white rounded-[32px] p-6 w-full flex flex-col justify-between"
      style={{
        boxShadow: "0 8px 30px rgba(0,0,0,0.04)",
        minHeight: "180px",
      }}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-[22px] text-[#111111]"
          style={{ fontWeight: 500, letterSpacing: "-0.01em", fontFamily: "'Switzer', 'SF Pro', system-ui, sans-serif" }}
        >
          Employee portal
        </h3>

        {/* Open in new tab button */}
        <button
          onClick={handleOpen}
          className="w-[48px] h-[48px] rounded-full bg-black flex items-center justify-center hover:bg-gray-900 transition-colors shrink-0"
          title="Open employee login page"
          aria-label="Open employee login page in new tab"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="7" y1="17" x2="17" y2="7" />
            <polyline points="7 7 17 7 17 17" />
          </svg>
        </button>
      </div>

      {/* URL Copy Box */}
      <div
        className="flex items-center justify-between gap-3 bg-[#FCFCFC] rounded-[16px] px-5 py-4 mb-4"
        style={{
          border: "1px solid #F0F0F0",
        }}
      >
        <span
          className="text-[16px] text-[#111111] truncate"
          style={{ fontWeight: 600, letterSpacing: "0.01em", fontFamily: "'Switzer', 'SF Pro', system-ui, sans-serif" }}
        >
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
              width="24"
              height="24"
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="9.6" y="9.6" width="10.8" height="10.8" rx="2.4" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14.4 9.6V6C14.4 4.67452 13.3255 3.6 12 3.6H6C4.67452 3.6 3.6 4.67452 3.6 6V12C3.6 13.3255 4.67452 14.4 6 14.4H9.6" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>

      {/* Description */}
      <p
        className="text-[15px] text-[#9CA3AF] leading-snug"
        style={{ fontWeight: 400, fontFamily: "'Switzer', 'SF Pro', system-ui, sans-serif" }}
      >
        Employee access for catalogue and order management.
      </p>
    </div>
  );
}
