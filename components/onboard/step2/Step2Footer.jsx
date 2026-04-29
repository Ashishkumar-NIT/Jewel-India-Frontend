"use client";
import { useRouter } from "next/navigation";

export function Step2Footer({ isFormValid, onSubmitAttempt }) {
  const router = useRouter();

  const handleNext = () => {
    if (isFormValid) {
      router.push('/onboard/step3');
    } else {
      onSubmitAttempt();
    }
  };
  return (
    <div className="w-full flex justify-end">
      <button
        type="button"
        onClick={handleNext}
        disabled={!isFormValid}
        className={`w-full md:w-[140px] font-extrabold rounded-[10px] px-4 py-[clamp(10px,1.2vw,14px)] text-[clamp(13px,1.4vw,15px)] transition-all tracking-wide transform translate-x-0 md:translate-x-[46px] ${isFormValid ? 'bg-[#000000] text-white hover:bg-black/90 cursor-pointer' : 'bg-[#D1D5DB] text-white cursor-not-allowed'}`}
      >
        Next
      </button>
    </div>
  );
}
