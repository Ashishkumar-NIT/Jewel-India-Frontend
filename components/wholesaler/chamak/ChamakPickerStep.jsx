"use client";

import { useState, useRef } from "react";
import Image from "next/image";

function SlotCard({
  slotNumber,
  title,
  subtitle,
  accentColor,
  accentBg,
  selectedDesign,
  onSelectProduct,
  onCustomImageChange,
  catalogProducts,
  isLoadingProducts,
}) {
  const [mode, setMode] = useState("catalog"); // 'catalog' | 'upload'
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onCustomImageChange(slotNumber, e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white border border-celestique-taupe rounded-2xl p-5 md:p-6 shadow-sm transition-all hover:shadow-md">
      {/* Slot Header */}
      <div className="flex items-center justify-between pb-4 border-b border-celestique-taupe/60 mb-4">
        <div className="flex items-center gap-3">
          <span
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
            style={{ backgroundColor: accentColor }}
          >
            {slotNumber}
          </span>
          <div>
            <h3 className="font-cirka text-lg font-bold text-celestique-dark">{title}</h3>
            <p className="text-xs text-celestique-muted font-sans">{subtitle}</p>
          </div>
        </div>

        {/* Source Mode Switcher */}
        <div className="flex items-center bg-celestique-cream p-1 rounded-lg border border-celestique-taupe/80 text-xs">
          <button
            type="button"
            onClick={() => setMode("catalog")}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              mode === "catalog"
                ? "bg-white text-celestique-dark shadow-xs font-semibold"
                : "text-celestique-muted hover:text-celestique-dark"
            }`}
          >
            Catalogue
          </button>
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              mode === "upload"
                ? "bg-white text-celestique-dark shadow-xs font-semibold"
                : "text-celestique-muted hover:text-celestique-dark"
            }`}
          >
            Upload
          </button>
        </div>
      </div>

      {/* Selected Preview or Empty Slate */}
      {selectedDesign ? (
        <div className="flex flex-col gap-3">
          <div
            className="relative aspect-square w-full rounded-xl overflow-hidden border-2 flex items-center justify-center p-3 bg-celestique-cream/30"
            style={{ borderColor: accentColor }}
          >
            {selectedDesign.imageUrl ? (
              <img
                src={selectedDesign.imageUrl}
                alt={selectedDesign.label}
                className="w-full h-full object-contain mix-blend-multiply"
              />
            ) : (
              <div className="text-xs text-celestique-muted">No preview available</div>
            )}

            <div
              className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider shadow-sm"
              style={{ backgroundColor: accentColor }}
            >
              Slot {slotNumber} Selected
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-celestique-dark line-clamp-1">
                {selectedDesign.label}
              </span>
              <span className="text-[11px] text-celestique-muted">
                {selectedDesign.customFile ? "Custom Upload" : "From Catalogue"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                if (selectedDesign.customFile) {
                  onCustomImageChange(slotNumber, null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                } else {
                  onSelectProduct(slotNumber, null);
                }
              }}
              className="text-xs font-semibold text-red-600 hover:text-red-700 underline underline-offset-2"
            >
              Change
            </button>
          </div>
        </div>
      ) : mode === "upload" ? (
        /* Drag & Drop Upload View */
        <div className="flex flex-col flex-1 min-h-[260px]">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${
              dragOver
                ? "border-celestique-dark bg-celestique-cream"
                : "border-celestique-taupe hover:border-celestique-dark hover:bg-celestique-cream/40 bg-celestique-cream/20"
            }`}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-transform group-hover:scale-105"
              style={{ backgroundColor: accentBg }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke={accentColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <span className="text-xs font-bold text-celestique-dark font-sans">
              Click to upload or drag & drop
            </span>
            <span className="text-[11px] text-celestique-muted mt-1">
              Supports JPEG, PNG, WebP up to 10MB
            </span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                onCustomImageChange(slotNumber, e.target.files[0]);
              }
            }}
          />
        </div>
      ) : (
        /* Catalogue Grid Selector */
        <div className="flex flex-col flex-1 min-h-[260px]">
          {isLoadingProducts ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 py-10">
              <div className="w-6 h-6 border-2 border-celestique-taupe border-t-celestique-dark rounded-full animate-spin" />
              <span className="text-xs text-celestique-muted">Loading catalogue...</span>
            </div>
          ) : catalogProducts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-celestique-taupe rounded-xl">
              <p className="text-xs font-semibold text-celestique-dark">No live products found</p>
              <p className="text-[11px] text-celestique-muted mt-1">
                Upload a custom image above or add products to your catalogue first.
              </p>
              <button
                type="button"
                onClick={() => setMode("upload")}
                className="mt-3 px-3 py-1.5 bg-black text-white text-xs font-semibold rounded-lg"
              >
                Switch to Upload
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2.5 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
              {catalogProducts.map((prod) => {
                const img =
                  (Array.isArray(prod.generated_image_urls) && prod.generated_image_urls[0]) ||
                  prod.processed_image_url ||
                  prod.raw_image_url ||
                  "";
                return (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => onSelectProduct(slotNumber, prod)}
                    className="group relative flex flex-col aspect-square rounded-lg overflow-hidden border border-celestique-taupe bg-celestique-cream/30 hover:border-celestique-dark transition-all p-1 text-left"
                  >
                    <div className="relative w-full flex-1">
                      {img ? (
                        <img
                          src={img}
                          alt={prod.title || "Jewellery"}
                          className="w-full h-full object-contain mix-blend-multiply transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-[10px] text-gray-400">
                          No img
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-medium text-celestique-dark truncate w-full mt-1 px-1">
                      {prod.title || prod.jewellery_type || "Jewellery"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ChamakPickerStep({
  selectedDesign1,
  selectedDesign2,
  catalogProducts,
  isLoadingProducts,
  onSelectProduct,
  onCustomImageChange,
  onStartAnalysis,
  canStartAnalysis,
  uploadError,
  errorMessage,
  isQuotaUnlimited,
  remainingQuota,
  totalQuota,
  onViewGallery,
  galleryCount = 0,
}) {
  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full max-w-5xl mx-auto py-2">
      {/* Header & Tagline */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-celestique-taupe/70 pb-5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <h1 className="text-2xl md:text-3xl font-bold font-cirka text-celestique-dark">
              Chamak AI Jewelry Fusion
            </h1>
          </div>
          <p className="text-xs md:text-sm text-celestique-muted font-sans">
            Select two designs to fuse their form, detailing, and aesthetics into a brand-new concept.
          </p>
        </div>

        {/* Gallery CTA button */}
        <button
          type="button"
          onClick={onViewGallery}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-celestique-cream hover:bg-celestique-taupe/60 text-celestique-dark border border-celestique-taupe transition-all text-xs font-semibold tracking-wide"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          Past Fusions {galleryCount > 0 && `(${galleryCount})`}
        </button>
      </div>

      {/* Quota Banner (Fix #4: Real "Unlimited" banner vs credit progress) */}
      {isQuotaUnlimited ? (
        <div className="w-full bg-gradient-to-r from-[#FFFDF5] to-[#F7F4E9] border border-[#E9DFBE] rounded-xl p-4 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#997A15] font-bold">
              ✦
            </div>
            <div>
              <h4 className="text-xs md:text-sm font-bold text-[#6D5400] font-sans">
                Unlimited AI Fusion Account
              </h4>
              <p className="text-[11px] text-[#6D5400]/80 font-sans">
                You can create and experiment with AI jewelry fusions without daily quota limits.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-[#6D5400] bg-[#FBEFBE] px-3 py-1 rounded-full border border-[#E4CC8F]">
            Unlimited
          </span>
        </div>
      ) : (
        <div className="w-full bg-white border border-celestique-taupe rounded-xl p-4 flex flex-col gap-2 shadow-xs">
          <div className="flex justify-between items-center text-xs font-sans">
            <span className="text-celestique-dark font-semibold">Daily Fusion Credits</span>
            <span className="text-celestique-muted font-medium">
              {remainingQuota} / {totalQuota} credits remaining today
            </span>
          </div>
          <div className="w-full bg-celestique-cream h-2 rounded-full overflow-hidden">
            <div
              className="bg-celestique-dark h-full transition-all duration-500"
              style={{
                width: `${Math.min(100, (remainingQuota / (totalQuota || 1)) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Error Banners (Fix #1: Inline Upload error display) */}
      {(uploadError || errorMessage) && (
        <div className="border border-red-200 bg-red-50 p-4 rounded-xl flex items-start gap-3 animate-fade-in">
          <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
            !
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-red-900">Unable to proceed</h4>
            <p className="text-xs text-red-700 mt-0.5">{uploadError || errorMessage}</p>
          </div>
        </div>
      )}

      {/* 2-Slot Picker Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* Slot 1: Gold / Foundation */}
        <SlotCard
          slotNumber={1}
          title="Design 1 (Foundation)"
          subtitle="Provides core silhouette, structure & proportions"
          accentColor="#D4AF37"
          accentBg="#FEF9E7"
          selectedDesign={selectedDesign1}
          onSelectProduct={onSelectProduct}
          onCustomImageChange={onCustomImageChange}
          catalogProducts={catalogProducts}
          isLoadingProducts={isLoadingProducts}
        />

        {/* Slot 2: Blue / Upgrade */}
        <SlotCard
          slotNumber={2}
          title="Design 2 (Upgrade)"
          subtitle="Injects stone setting, ornamentation & motif style"
          accentColor="#3B82F6"
          accentBg="#EFF6FF"
          selectedDesign={selectedDesign2}
          onSelectProduct={onSelectProduct}
          onCustomImageChange={onCustomImageChange}
          catalogProducts={catalogProducts}
          isLoadingProducts={isLoadingProducts}
        />
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-celestique-taupe/70">
        <p className="text-xs text-celestique-muted text-center sm:text-left">
          Stage 1 of 4: Vision Analysis examines both pieces before you tune weights.
        </p>

        <button
          type="button"
          disabled={!canStartAnalysis}
          onClick={onStartAnalysis}
          className={`w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-xs md:text-sm tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2.5 ${
            canStartAnalysis
              ? "bg-celestique-dark text-white hover:bg-black hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
          }`}
        >
          <span>Begin Vision Analysis</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
