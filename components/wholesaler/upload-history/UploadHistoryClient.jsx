"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ProtectedImage from "../../shared/ProtectedImage";

const formatTime = (dateString) => {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
};

const formatResetTime = (isoString) => {
  if (!isoString) return "";
  try {
    const cleanStr = typeof isoString === "string"
      ? isoString.replace(/\+00:00Z$/, "Z").replace(/\+00:00$/, "Z")
      : isoString;
    const date = new Date(cleanStr);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
};

function HistoryCard({ product }) {
  const isReuploaded = !!product.is_reuploaded;
  const [viewMode, setViewMode] = useState("enhanced"); // 'raw' | 'enhanced'
  const variants = product.generated_image_urls || [];
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);

  const activeEnhancedImage = variants[activeVariantIndex] || product.image_url || product.processed_image_url;
  const rawImage = product.raw_image_url || activeEnhancedImage;

  const hasVariants = variants.length > 0;
  const isProcessing = !activeEnhancedImage;

  // Formatting values
  const title = product.title || (product.jewellery_type ? product.jewellery_type.charAt(0).toUpperCase() + product.jewellery_type.slice(1) : "Jewelry Piece");
  const uploadTime = isReuploaded ? (product.triggered_at || product.created_at) : product.created_at;
  const timeStr = formatTime(uploadTime);

  return (
    <div className="bg-white border border-[#e5e5e5] rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col md:flex-row">
      
      {/* Visual Sandbox: Image Viewer Area */}
      <div className="w-full md:w-[45%] bg-[#F9F9F9] p-5 flex flex-col gap-3 justify-between border-b md:border-b-0 md:border-r border-[#f0f0f0] relative min-h-[300px]">
        {/* Toggle TABS */}
        {!isProcessing && !isReuploaded && (
          <div className="flex justify-center bg-gray-100 p-1 rounded-full w-fit mx-auto self-start z-10">
            <button
              onClick={() => setViewMode("enhanced")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                viewMode === "enhanced"
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              AI Enhanced
            </button>
            <button
              onClick={() => setViewMode("raw")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                viewMode === "raw"
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              Original Photo
            </button>
          </div>
        )}

        {/* Display Image */}
        <div className="flex-1 flex items-center justify-center min-h-[220px] relative rounded-xl overflow-hidden mt-2">
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center text-center p-6 gap-3 animate-pulse">
              <div className="w-10 h-10 border-[1.5px] border-gray-300 border-t-black rounded-full animate-spin" />
              <p className="text-sm font-semibold text-gray-500 font-gilroy">Processing in background...</p>
            </div>
          ) : (viewMode === "enhanced" || isReuploaded) ? (
            activeEnhancedImage ? (
              <ProtectedImage
                src={activeEnhancedImage}
                alt={`${title} Enhanced`}
                className="w-full h-full object-contain max-h-[250px] transition-all duration-300"
              />
            ) : (
              <div className="text-gray-400 text-sm font-gilroy">No enhanced image available</div>
            )
          ) : (
            rawImage ? (
              <ProtectedImage
                src={rawImage}
                alt={`${title} Original`}
                className="w-full h-full object-contain max-h-[250px] transition-all duration-300"
              />
            ) : (
              <div className="text-gray-400 text-sm font-gilroy">No original image available</div>
            )
          )}
        </div>

        {/* Variant Selectors */}
        {!isProcessing && viewMode === "enhanced" && hasVariants && (
          <div className="flex flex-col gap-1.5 mt-2">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider text-center">AI Variations</span>
            <div className="flex justify-center gap-2 overflow-x-auto py-1">
              {variants.map((vUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveVariantIndex(idx)}
                  className={`w-10 h-10 rounded-md overflow-hidden bg-white border-2 relative shrink-0 transition-all ${
                    activeVariantIndex === idx ? "border-black scale-105 shadow-sm" : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <ProtectedImage src={vUrl} alt={`Variant ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Info and Metadata Area */}
      <div className="flex-1 p-6 flex flex-col justify-between gap-6">
        <div>
          {/* Header Title and Timestamp */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 font-gilroy leading-snug">{title}</h3>
              <p className="text-xs text-gray-400 mt-1 font-medium">Uploaded today at {timeStr}</p>
            </div>
            {/* Status & Re-uploaded Badges */}
            <div className="flex flex-col sm:flex-row gap-2 items-end sm:items-center shrink-0">
              {isReuploaded && (
                <span className="text-[11px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full shrink-0">
                  Re-uploaded
                </span>
              )}
              {isProcessing ? (
                <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full shrink-0">
                  Processing
                </span>
              ) : (
                <span className="text-[11px] font-bold text-green-800 bg-green-50 border border-green-200 px-3 py-1 rounded-full shrink-0">
                  Enhancement Completed
                </span>
              )}
            </div>
          </div>

          {/* Details / Spec Badge list */}
          <div className="mt-6 flex flex-wrap gap-2.5">
            {product.jewellery_type && (
              <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5 flex flex-col">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Type</span>
                <span className="text-xs font-semibold text-gray-800 uppercase tracking-wide">{product.jewellery_type}</span>
              </div>
            )}
            {product.category && (
              <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5 flex flex-col">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Material</span>
                <span className="text-xs font-semibold text-gray-800 capitalize">{product.category}</span>
              </div>
            )}
            {product.metal_purity && (
              <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5 flex flex-col">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Purity</span>
                <span className="text-xs font-semibold text-gray-800 uppercase">{product.metal_purity}</span>
              </div>
            )}
            {product.net_weight && (
              <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5 flex flex-col">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Net Weight</span>
                <span className="text-xs font-semibold text-gray-800">{product.net_weight} g</span>
              </div>
            )}
            {product.style && (
              <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5 flex flex-col">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Style</span>
                <span className="text-xs font-semibold text-gray-800 capitalize">{product.style}</span>
              </div>
            )}
            <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5 flex flex-col">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Stock Status</span>
              <span className={`text-xs font-semibold ${product.stock_available ? "text-green-600" : "text-gray-500"}`}>
                {product.stock_available ? "In Stock" : "Make to Order"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="flex items-center gap-3 border-t border-gray-100 pt-5">
          <Link
            href={`/dashboard/wholesaler/edit-product/${product.id}?from=upload-history`}
            className="flex-1 text-center bg-black hover:bg-black/90 text-white text-sm font-semibold py-2.5 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow"
          >
            Edit Product
          </Link>
          <Link
            href="/dashboard/wholesaler/catalogue"
            className="flex-1 text-center bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 text-sm font-semibold py-2.5 rounded-xl transition-all cursor-pointer"
          >
            View in Catalogue
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function UploadHistoryClient({ initialProducts = [], usedCount = 0, limitCount = 20, resetsAt }) {
  const isLimitReached = usedCount >= limitCount;

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Header and Back navigation */}
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl md:text-4xl font-semibold text-[#111827] font-cirka">Uploads Today</h1>
        <p className="text-sm text-gray-500 font-medium font-gilroy">
          Manage and review the items you have uploaded and generated today.
        </p>
      </div>

      {/* Progress and Quota Panel */}
      {limitCount !== Infinity && (
        <div className={`w-full rounded-2xl border p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all duration-300 ${
          isLimitReached 
            ? "bg-[#FFFDF5] border-[#FBEFBE] text-[#856404]" 
            : "bg-white border-[#e5e5e5]"
        }`}>
          <div className="flex flex-col gap-1.5 flex-1">
            <div className="flex items-center justify-between text-sm font-bold font-gilroy">
              <span>Daily Upload Quota</span>
              <span>{usedCount} / {limitCount} Used</span>
            </div>
            {/* Progress Track */}
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mt-1">
              <div
                className={`h-full transition-all duration-500 ease-out ${isLimitReached ? "bg-amber-500" : "bg-black"}`}
                style={{ width: `${Math.min(100, (usedCount / limitCount) * 100)}%` }}
              />
            </div>
          </div>
          {resetsAt && (
            <div className="shrink-0 flex flex-col md:text-right font-gilroy">
              <span className="text-[11px] text-gray-400 uppercase font-bold tracking-wider">Quota Resets At</span>
              <span className="text-sm font-bold text-gray-800 mt-0.5">{formatResetTime(resetsAt)}</span>
            </div>
          )}
        </div>
      )}

      {/* Uploads History List */}
      {initialProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-[#e5e5e5] rounded-[24px]">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 text-2xl mb-4 border border-gray-100">
            📸
          </div>
          <h3 className="text-lg font-bold text-gray-900 font-gilroy">No uploads today</h3>
          <p className="text-sm text-gray-500 max-w-sm mt-1 mb-6 font-gilroy">
            You haven't uploaded any product listings today. Upload your first design to see it here!
          </p>
          <Link
            href="/dashboard/wholesaler/add-product"
            className="bg-black text-white hover:bg-black/90 px-6 py-3 rounded-full text-sm font-bold transition-all shadow-sm"
          >
            Upload design
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {initialProducts.map((product) => (
            <HistoryCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
