"use client";

import { useEffect, useState } from "react";

// Checkmark SVG with path drawing fallback safety
const AnimatedCheckIcon = ({ active }) => (
  <svg viewBox="0 0 24 24" fill="none" className="w-[15px] h-[15px] text-white">
    <path
      d="M20 6L9 17L4 12"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={active ? "animate-check-draw" : ""}
      style={{ strokeDasharray: 24, strokeDashoffset: active ? undefined : 0 }}
    />
  </svg>
);

export function VerificationTimeline({ status = "pending", submittedAt = "", updatedAt = "" }) {
  // 1. Session Storage Revisit Protection (Skip animation on subsequent loads)
  const isVisited = () => {
    if (typeof window !== "undefined") {
      try {
        return sessionStorage.getItem("onboard_submitted_visited") === "true";
      } catch (e) {
        return false;
      }
    }
    return false;
  };

  const skipAnim = isVisited();

  // 2. Timeline Step States
  // States: 'pending' (grey), 'active' (black active border), 'done' (completed green/resolved)
  const [step1State, setStep1State] = useState(skipAnim ? "done" : "pending");
  const [step2State, setStep2State] = useState(skipAnim ? "done" : "pending");
  const [step3State, setStep3State] = useState(skipAnim ? "done" : "pending");

  useEffect(() => {
    if (skipAnim) return;

    // Trigger first visit session marker
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("onboard_submitted_visited", "true");
      } catch (e) {
        // Safe catch-all
      }
    }

    // 3. Staggered Timeline Sequence (Total duration ~ 900ms for high responsiveness)
    // 0ms -> Step 1 Active
    const t1 = setTimeout(() => setStep1State("active"), 50);

    // 300ms -> Step 1 Done & Step 2 Active
    const t2 = setTimeout(() => {
      setStep1State("done");
      setStep2State("active");
    }, 300);

    // 600ms -> Step 2 Done & Step 3 Active
    const t3 = setTimeout(() => {
      setStep2State("done");
      setStep3State("active");
    }, 600);

    // 900ms -> Step 3 Done (Resolved visual state triggers)
    const t4 = setTimeout(() => {
      setStep3State("done");
    }, 900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [skipAnim]);

  // 4. Dynamic Verification Status styling based on status state
  const getStep3Config = () => {
    switch (status) {
      case "verified":
        return {
          circleClass: `border-2 border-[#22C55E] bg-[#22C55E] text-white ${
            step3State === "done" && !skipAnim ? "animate-ripple-green" : ""
          }`,
          label: "Verification Approved",
          labelClass: "text-[#22C55E] font-bold",
          icon: <AnimatedCheckIcon active={step3State === "done"} />,
        };

      case "rejected":
      case "resubmission_required":
        return {
          circleClass: `border-2 border-[#EF4444] bg-[#FEF2F2] text-[#EF4444] ${
            step3State === "done" && !skipAnim ? "animate-shake-red" : ""
          }`,
          label: status === "rejected" ? "Application Rejected" : "Revision Required",
          labelClass: "text-[#EF4444] font-bold",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-[14px] h-[14px]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
        };

      case "banned":
        return {
          circleClass: "border-2 border-red-700 bg-red-950 text-white animate-shake-red",
          label: "Access Suspended",
          labelClass: "text-red-700 font-bold",
          icon: (
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-[14px] h-[14px]">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          ),
        };

      case "on_hold":
      case "pending":
      default:
        return {
          circleClass: `border-2 border-amber-500 bg-amber-50/50 text-amber-600 ${
            step3State === "done" ? "animate-pulse-amber" : ""
          }`,
          label: status === "on_hold" ? "Application On Hold" : "Under Verification",
          labelClass: "text-amber-700 font-bold",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-[15px] h-[15px]">
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" className={step3State === "done" ? "animate-spin-slow" : ""} />
            </svg>
          ),
        };
    }
  };

  const step3 = getStep3Config();

  return (
    <div className="flex flex-col items-start w-full max-w-[340px] mx-auto mt-6 mb-2 select-none">
      
      {/* Step 1 — Account Created (Sequenced) */}
      <div 
        className={`flex items-start gap-5 w-full relative transition-all duration-300 ${
          step1State !== "pending" ? "opacity-100 animate-step-fade" : "opacity-0"
        }`}
      >
        <div className="flex flex-col items-center">
          <div 
            className={`w-[28px] h-[28px] shrink-0 rounded-full flex items-center justify-center transition-all duration-300 z-10 ${
              step1State === "done" 
                ? "bg-[#22C55E] border-2 border-[#22C55E] text-white" 
                : step1State === "active" 
                  ? "border-2 border-[#111827] bg-white text-[#111827]" 
                  : "border-2 border-[#E5E7EB] bg-white text-transparent"
            }`}
          >
            {step1State === "done" ? <AnimatedCheckIcon active={!skipAnim} /> : null}
          </div>
          <div 
            className={`w-[2px] h-[34px] transition-all duration-500 origin-top ${
              step1State === "done" ? "bg-[#22C55E] scale-y-100" : "bg-[#E5E7EB] scale-y-0"
            }`} 
          />
        </div>
        <div className="pt-1.5 flex flex-col">
          <span 
            className={`text-[14.5px] tracking-wide transition-colors duration-300 ${
              step1State === "done" ? "text-emerald-700 font-bold" : "text-[#9CA3AF] font-medium"
            }`}
          >
            Account Created
          </span>
          <span className="text-[11.5px] text-[#9CA3AF] mt-0.5">Success</span>
        </div>
      </div>

      {/* Step 2 — Details Submitted (Sequenced) */}
      <div 
        className={`flex items-start gap-5 w-full relative transition-all duration-300 ${
          step2State !== "pending" ? "opacity-100 animate-step-fade" : "opacity-0"
        }`}
      >
        <div className="flex flex-col items-center">
          <div 
            className={`w-[28px] h-[28px] shrink-0 rounded-full flex items-center justify-center transition-all duration-300 z-10 ${
              step2State === "done" 
                ? "bg-[#22C55E] border-2 border-[#22C55E] text-white" 
                : step2State === "active" 
                  ? "border-2 border-[#111827] bg-white text-[#111827]" 
                  : "border-2 border-[#E5E7EB] bg-white text-transparent"
            }`}
          >
            {step2State === "done" ? <AnimatedCheckIcon active={!skipAnim && step2State === "done"} /> : null}
          </div>
          <div 
            className={`w-[2px] h-[34px] transition-all duration-500 origin-top ${
              step2State === "done" ? "bg-[#22C55E] scale-y-100" : "bg-[#E5E7EB] scale-y-0"
            }`} 
          />
        </div>
        <div className="pt-1.5 flex flex-col">
          <span 
            className={`text-[14.5px] tracking-wide transition-colors duration-300 ${
              step2State === "done" ? "text-emerald-700 font-bold" : "text-[#9CA3AF] font-medium"
            }`}
          >
            Details Submitted
          </span>
          {submittedAt ? (
            <span className="text-[11.5px] text-[#9CA3AF] mt-0.5">{submittedAt}</span>
          ) : (
            <span className="text-[11.5px] text-[#9CA3AF] mt-0.5">Under Review</span>
          )}
        </div>
      </div>

      {/* Step 3 — Dynamic Verification Status */}
      <div 
        className={`flex items-start gap-5 w-full relative transition-all duration-300 ${
          step3State !== "pending" ? "opacity-100 animate-step-fade" : "opacity-0"
        }`}
      >
        <div className="flex flex-col items-center">
          <div 
            className={`w-[28px] h-[28px] shrink-0 rounded-full flex items-center justify-center transition-all duration-300 z-10 ${
              step3State === "done" 
                ? step3.circleClass 
                : step3State === "active"
                  ? "border-2 border-[#111827] bg-white text-[#111827]" 
                  : "border-2 border-[#E5E7EB] bg-white text-transparent"
            }`}
          >
            {step3State === "done" ? step3.icon : null}
          </div>
        </div>
        <div className="pt-1.5 flex flex-col">
          <span 
            className={`text-[14.5px] tracking-wide transition-colors duration-300 ${
              step3State === "done" ? step3.labelClass : "text-[#9CA3AF] font-medium"
            }`}
          >
            {step3State === "done" ? step3.label : "Verification Status"}
          </span>
          {step3State === "done" ? (
            <span className="text-[11.5px] text-[#9CA3AF] mt-0.5">
              {status === "verified" ? (updatedAt || "Completed") : "Pending Review"}
            </span>
          ) : (
            <span className="text-[11.5px] text-[#9CA3AF] mt-0.5">Awaiting Analysis</span>
          )}
        </div>
      </div>

    </div>
  );
}
