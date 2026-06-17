"use client";

import { useState, memo } from "react";
import Image from "next/image";

const TagChip = memo(function TagChip({ type, label }) {
  if (!label) return null;
  
  if (type === "material") {
    return (
      <span className="flex items-center gap-1.5 rounded-[6px] bg-[#FEF3C7] px-2.5 py-1 text-[12px] font-medium text-[#B45309]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></span>
        {label}
      </span>
    );
  }
  return (
    <span className="rounded-[6px] bg-[#E0E7FF] px-2.5 py-1 text-[12px] font-medium text-[#4338CA]">
      {label}
    </span>
  );
});

const ToggleSwitch = memo(function ToggleSwitch({ isOn, onToggle }) {
  return (
    <div 
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      className="group -my-2.5 -mx-1.5 md:my-0 md:mx-0 w-11 h-11 md:w-11 md:h-6 flex items-center justify-center cursor-pointer"
    >
      <div 
        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${isOn ? "bg-black" : "bg-gray-200"}`}
      >
        <div
          className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-300 ${isOn ? "translate-x-5" : "translate-x-0"}`}
        />
      </div>
    </div>
  );
});

const DesignCard = memo(function DesignCard({ design, onArchiveToggle }) {
  const [imgError, setImgError] = useState(false);
  const title = design.title || "Untitled design";
  const tags = Array.isArray(design.tags) ? design.tags : [];
  
  // Extract a material and type from tags if available
  const material = tags.find(t => ["Gold", "Silver", "Platinum", "Diamond", "Rose Gold"].includes(t)) || "Gold";
  const type = tags.find(t => t !== material) || design.category || "Necklace";

  return (
    <article className="flex flex-col rounded-[14px] bg-white overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-shadow">
      <div className="relative aspect-square w-full bg-gray-50 overflow-hidden">
        {!imgError && design.image_url ? (
          <Image
            src={design.image_url}
            alt={title}
            fill
            loading="lazy"
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[12px] text-gray-400 bg-gray-100">
            No image available
          </div>
        )}
      </div>

      <div className="flex flex-col p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[14px] font-bold text-[#111827] truncate pr-2">
            {title}
          </h3>
          <span className="text-[12px] text-[#9CA3AF] font-medium shrink-0">Archive</span>
        </div>

        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-2 overflow-hidden pr-2">
            <TagChip type="material" label={material} />
            <TagChip type="category" label={type} />
          </div>
          <div className="shrink-0">
            <ToggleSwitch 
              isOn={design.is_archived} 
              onToggle={() => onArchiveToggle(design)} 
            />
          </div>
        </div>
      </div>
    </article>
  );
});

export function RetailerCatalogueGrid({ designs, isLoading, onArchiveToggle }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-[14px] bg-white overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)] animate-pulse">
            <div className="aspect-square bg-gray-100" />
            <div className="p-5 space-y-3">
              <div className="flex justify-between">
                <div className="h-4 w-1/2 bg-gray-100 rounded" />
                <div className="h-4 w-12 bg-gray-100 rounded" />
              </div>
              <div className="flex justify-between items-center pt-1">
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-gray-100 rounded-[6px]" />
                  <div className="h-6 w-16 bg-gray-100 rounded-[6px]" />
                </div>
                <div className="h-6 w-11 bg-gray-100 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!designs.length) {
    return (
      <div className="rounded-[14px] border border-dashed border-gray-200 bg-white px-6 py-16 text-center shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
        <p className="text-[15px] font-bold text-[#111827]">No designs yet.</p>
        <p className="text-[13px] text-[#6B7280] mt-1.5">Upload your first design to build your sparkling catalogue.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {designs.map((design) => (
        <DesignCard
          key={design.id}
          design={design}
          onArchiveToggle={onArchiveToggle}
        />
      ))}
    </div>
  );
}
