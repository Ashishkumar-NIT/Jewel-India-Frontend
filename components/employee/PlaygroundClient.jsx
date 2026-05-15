"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import InfinityCanvas from "./InfinityCanvas";

export default function PlaygroundClient({ products, employeeId, retailerName }) {
  const router = useRouter();

  const handleNext = () => {
    // Navigate to Selection Review
    router.push('/dashboard/employee/playground/review');
  };

  const handleBack = () => {
    // Go back to dashboard home or questionnaire
    router.push('/dashboard/employee');
  };

  if (products.length === 0) {
    return (
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-6 pb-32">
        <div className="rounded-[16px] border border-dashed border-gray-200 bg-gray-50 px-6 py-16 text-center mt-4">
          <p className="text-[14px] font-semibold text-gray-500">No matches found.</p>
          <p className="text-[12px] text-gray-400 mt-2">
            Try adjusting your questionnaire answers to see more products.
          </p>
          <button 
            onClick={() => router.push('/dashboard/employee/questionnaire')}
            className="mt-6 px-6 py-2 bg-black text-white text-[13px] font-bold rounded-lg shadow hover:bg-gray-800 transition-colors"
          >
            Retake Questionnaire
          </button>
        </div>
      </div>
    );
  }

  // Render InfinityCanvas directly full screen
  return (
    <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center">Loading canvas...</div>}>
      <InfinityCanvas 
        products={products}
        onNext={handleNext}
        onBack={handleBack}
        retailerName={retailerName}
      />
    </Suspense>
  );
}
