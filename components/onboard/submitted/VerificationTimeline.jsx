// ── Status config map ────────────────────────────────────────────────────────
// Defines the icon, circle style, label, and text color for each verification_status.
const STATUS_CONFIG = {
  // ✅ Verified — green checkmark (matches steps 1 & 2)
  verified: {
    circleClass: "bg-[#22C55E] text-white",
    label: "Verification (Your account have been verified)",
    labelClass: "text-[#22C55E] font-[700]",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-[16px] h-[16px]">
        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
      </svg>
    ),
  },

  // 🔄 Resubmission required — yellow circle with refresh icon
  resubmission_required: {
    circleClass: "bg-[#CCCC00] text-white",
    label: "Verification (resubmit documents)",
    labelClass: "text-[#AAAA00] font-[700]",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[15px] h-[15px]">
        <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0020 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 004 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
      </svg>
    ),
  },

  // 🔄 Rejected — same as resubmission_required per spec
  rejected: {
    circleClass: "bg-[#CCCC00] text-white",
    label: "Verification (resubmit documents)",
    labelClass: "text-[#AAAA00] font-[700]",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[15px] h-[15px]">
        <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0020 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 004 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
      </svg>
    ),
  },

  // ⏳ Pending — grey circle with clock icon
  pending: {
    circleClass: "bg-[#E5E7EB] text-[#6B7280]",
    label: "Under verification",
    labelClass: "text-[#111827] font-[700]",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-[16px] h-[16px]">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },

  // ⏳ On hold — same as pending per spec
  on_hold: {
    circleClass: "bg-[#E5E7EB] text-[#6B7280]",
    label: "Under verification",
    labelClass: "text-[#111827] font-[700]",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-[16px] h-[16px]">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },

  // 🚫 Banned — red circle with ✕
  banned: {
    circleClass: "bg-[#EF4444] text-white",
    label: "verification (you have been banned)",
    labelClass: "text-[#EF4444] font-[700]",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-[14px] h-[14px]">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    ),
  },
};

// Checkmark SVG reused for steps 1 & 2
const CheckIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-[16px] h-[16px]">
    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
  </svg>
);

/**
 * VerificationTimeline
 * @param {{ status: string }} props - verification_status from the wholesalers table
 */
export function VerificationTimeline({ status = "pending" }) {
  // Fall back to "pending" config for any unknown status
  const step3 = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;

  return (
    <div className="flex flex-col items-start w-full max-w-[340px] mx-auto mt-6 mb-2">

      {/* Step 1 — Account created (always green) */}
      <div className="flex items-start gap-5 w-full relative">
        <div className="flex flex-col items-center">
          <div className="w-[28px] h-[28px] shrink-0 rounded-full bg-[#22C55E] flex items-center justify-center text-white z-10">
            <CheckIcon />
          </div>
          <div className="w-[2px] h-[34px] bg-[#D1D5DB]" />
        </div>
        <div className="pt-1">
          <span className="text-[15px] font-medium text-[#6B7280]">Account created</span>
        </div>
      </div>

      {/* Step 2 — Details submitted (always green) */}
      <div className="flex items-start gap-5 w-full relative">
        <div className="flex flex-col items-center">
          <div className="w-[28px] h-[28px] shrink-0 rounded-full bg-[#22C55E] flex items-center justify-center text-white z-10">
            <CheckIcon />
          </div>
          <div className="w-[2px] h-[34px] bg-[#D1D5DB]" />
        </div>
        <div className="pt-1">
          <span className="text-[15px] font-medium text-[#6B7280]">Details submitted</span>
        </div>
      </div>

      {/* Step 3 — Dynamic based on verification_status */}
      <div className="flex items-start gap-5 w-full relative">
        <div className="flex flex-col items-center">
          <div className={`w-[28px] h-[28px] shrink-0 rounded-full flex items-center justify-center z-10 ${step3.circleClass}`}>
            {step3.icon}
          </div>
        </div>
        <div className="pt-1">
          <span className={`text-[15px] ${step3.labelClass}`}>{step3.label}</span>
        </div>
      </div>

    </div>
  );
}

