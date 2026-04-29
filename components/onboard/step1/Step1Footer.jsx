"use client";
import { useRouter } from "next/navigation";

export function Step1Footer({ isFormValid, onSubmitAttempt }) {
  const router = useRouter();

  const handleNext = () => {
    if (isFormValid) {
      router.push('/onboard/step2');
    } else {
      onSubmitAttempt();
    }
  };
  return (
    <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0 pt-6 border-t border-[#E0E0E0] mt-4">
      <p className="text-[12px] text-[#9CA3AF] max-w-[340px] text-center md:text-left leading-relaxed font-medium">
        *Your documents are encrypted and only used for verification. We never share them.
      </p>
      <button 
        type="button"
        onClick={handleNext}
        disabled={!isFormValid}
        className={`w-full md:w-auto font-extrabold rounded-[10px] px-[clamp(24px,3vw,40px)] py-[clamp(10px,1.2vw,14px)] text-[clamp(13px,1.4vw,15px)] transition-colors tracking-wide ${isFormValid ? 'bg-[#000000] text-white hover:bg-black/90 cursor-pointer' : 'bg-[#D1D5DB] text-white cursor-not-allowed'}`}
      >
        Next
      </button>
    </div>
  );
}
