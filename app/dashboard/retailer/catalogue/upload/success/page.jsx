"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SuccessPage() {
  return (
    <>
      <style>{`
        aside { display: none !important; }
        main { margin-left: 0 !important; max-width: 100% !important; background: white !important; }
      `}</style>
      
      <div className="bg-white min-h-[calc(100vh-80px)] w-full flex items-center justify-center font-sans">
        
        <div className="flex flex-col items-center justify-center text-center px-4 max-w-[500px]">
          <h1 className="text-[clamp(28px,4vw,32px)] font-extrabold text-[#111827] tracking-tight mb-4 leading-tight">
            Design uploaded successfully
          </h1>
          
          <p className="text-[14px] text-[#6B7280] mb-8 max-w-[400px] leading-relaxed">
            Your designs will be available to your employees shortly (within a few minutes).
          </p>
          
          <Link
            href="/dashboard/retailer"
            className="flex items-center justify-center w-fit min-w-[200px] h-[48px] bg-[#111827] text-white font-bold text-[14px] rounded-[10px] hover:bg-black transition-colors mb-6 shadow-[0_4px_14px_rgba(0,0,0,0.15)]"
          >
            Back to dashboard
          </Link>
          
          <Link
            href="/dashboard/retailer/catalogue/upload"
            className="text-[14px] font-bold text-[#111827] hover:underline decoration-2 underline-offset-4"
          >
            Upload more designs
          </Link>
        </div>
      </div>
    </>
  );
}
