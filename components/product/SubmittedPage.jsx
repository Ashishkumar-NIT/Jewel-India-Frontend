"use client";

import { useRouter } from "next/navigation";

export function SubmittedPage() {
  const router = useRouter();
  return (
    <main className="flex-1 w-full flex flex-col items-center justify-center min-h-dvh px-4 py-20 bg-[#FFFFFF] font-sans">
      <div className="w-full flex flex-col items-center text-center">
        <h1
          className="text-[#000000] font-normal mb-6 text-[40px] md:text-[48px] lg:text-[54px]"
          style={{ fontFamily: "Georgia, 'Playfair Display', serif" }}
        >
          Submitted
        </h1>
        <p className="text-[16px] lg:text-[17px] text-[#6B6B6B] font-normal leading-[1.6] mb-10 max-w-[320px] md:max-w-[420px] lg:max-w-[480px]">
          Your design is in good hands. We&apos;ve received your photo and details. Our AI is getting to work you&apos;ll see your studio-ready images within 24 hours.
        </p>
        <button
          onClick={() => router.push("/dashboard/wholesaler")}
          className="bg-[#0A0A0A] text-[#FFFFFF] w-full min-w-[60px] max-w-[160px] lg:max-w-[320px] py-[18px] lg:py-[16px] rounded-[14px] md:rounded-[16px] text-[16px] font-semibold hover:bg-black shadow-[0px_6px_16px_rgba(0,0,0,0.25)] transition-all flex items-center justify-center cursor-pointer"
        >
          Back to dashboard
        </button>
      </div>
    </main>
  );
}
