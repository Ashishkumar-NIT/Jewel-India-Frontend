"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import InfinityCanvas from "./InfinityCanvas";
import PlaygroundCatalogueGrid from "./PlaygroundCatalogueGrid";

export default function PlaygroundClient({ products, employeeId, retailerName }) {
  const router = useRouter();
  
  // Shared state between InfinityCanvas and PlaygroundCatalogueGrid
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [viewMode, setViewMode] = useState("playground"); // "playground" (infinite canvas) or "catalogue" (grid)

  const handleNext = () => {
    // Save to session storage and proceed
    sessionStorage.setItem('employee_selected_products', JSON.stringify(Array.from(selectedItems)));
    router.push('/dashboard/employee/playground/review');
  };

  const handleBack = () => {
    // Go back to dashboard home
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

  return (
    <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center bg-[#FAFAFA] text-gray-500 font-medium">Loading layout...</div>}>
      {viewMode === "playground" ? (
        <InfinityCanvas 
          products={products}
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
          onNext={handleNext}
          onBack={handleBack}
          retailerName={retailerName}
          onToggleLayout={setViewMode}
        />
      ) : (
        <PlaygroundCatalogueGrid 
          products={products}
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
          onNext={handleNext}
          onBack={handleBack}
          retailerName={retailerName}
          onToggleLayout={setViewMode}
        />
      )}
    </Suspense>
  );
}
