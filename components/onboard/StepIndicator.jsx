export function StepIndicator({ currentStep = 1, totalSteps = 3 }) {
  const percentage = (currentStep / totalSteps) * 100;
  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="text-[13px] text-[#9CA3AF] font-medium uppercase tracking-widest">
        <span className="font-black text-[#000000]">Step {currentStep}</span> of {totalSteps}
      </div>
      <svg className="w-full h-[6px] rounded-full" preserveAspectRatio="none" viewBox="0 0 100 6" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="6" rx="3" fill="#E0E0E0" />
        <rect width={percentage} height="6" rx="3" fill="#000000" />
      </svg>
    </div>
  );
}