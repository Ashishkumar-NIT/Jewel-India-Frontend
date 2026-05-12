"use client";

import { useEffect, useState } from "react";

function formatWeight(val) {
  if (val === null || val === undefined || val === "") return null;
  const num = Number(val);
  if (isNaN(num)) return null;
  return `${num % 1 === 0 ? num : num.toFixed(2)}g`;
}

function SectionRow({ label, value, valueClass = "" }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[15px] md:text-[16px] text-gray-500 font-light whitespace-nowrap">{label}</span>
      <span className={`text-[15px] md:text-[16px] font-medium text-gray-900 ${valueClass}`}>{value}</span>
    </div>
  );
}

function SectionBlock({ title, children }) {
  return (
    <div className="w-full">
      {/* Section label + dotted rule */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-[11px] uppercase tracking-[0.2em] text-gray-400 font-bold whitespace-nowrap">{title}</span>
        <div className="flex-1" style={{ borderTop: "1.5px dashed #d1d5db" }} />
      </div>
      <div className="flex flex-col gap-1.5">{children}</div>
    </div>
  );
}

export function ProductInfoModal({ isOpen, onClose, product, onStartChat }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [mainImgError, setMainImgError] = useState(false);

  // Reset on open/close
  useEffect(() => {
    if (!isOpen) {
      setActiveImageIndex(0);
      setMainImgError(false);
    }
  }, [isOpen]);

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  // Build processed-only image list for thumbnails
  const processedImages = [];
  if (product.processed_image_url) processedImages.push(product.processed_image_url);
  if (product.generated_image_urls && Array.isArray(product.generated_image_urls)) {
    product.generated_image_urls.forEach((url) => {
      if (url && !processedImages.includes(url)) processedImages.push(url);
    });
  }
  // Fallback to raw images if no processed ones
  if (processedImages.length === 0) {
    if (product.image_url) processedImages.push(product.image_url);
    if (product.raw_image_url && !processedImages.includes(product.raw_image_url)) {
      processedImages.push(product.raw_image_url);
    }
  }

  const activeImageUrl = processedImages[activeImageIndex] || null;
  const title =
    product.title ||
    (product.jewellery_type
      ? product.jewellery_type.charAt(0).toUpperCase() + product.jewellery_type.slice(1)
      : "Untitled Product");
  const category = product.category || product.jewellery_type || "Uncategorized";
  const styleAesthetic = product.style_aesthetic || product.style || null;

  // Availability text
  const inStock =
    (typeof product.stock_available === "number" && product.stock_available > 0) ||
    product.stock_available === true ||
    product.stock_available === "true";
  const availabilityLabel = inStock
    ? `${typeof product.stock_available === "number" ? product.stock_available + " in stock" : "In stock"}`
    : "Made to order";
  const leadTime = product.make_to_order_days
    ? `${product.make_to_order_days} to ${Number(product.make_to_order_days) + 2} days`
    : null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-3 md:p-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal card */}
      <div className="relative w-full max-w-[860px] bg-white rounded-[20px] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[95dvh] md:max-h-[88dvh]">

        {/* ── LEFT PANEL: Image + Thumbnails ── */}
        <div className="w-full md:w-[48%] shrink-0 flex flex-col bg-[#f5f5f5] p-4 md:p-5">

          {/* Back arrow — top left, outside the image */}
          <button
            onClick={onClose}
            aria-label="Go back"
            className="self-start mb-3 w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-md text-gray-800 hover:bg-gray-50 transition-all active:scale-95"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>

          {/* Main image */}
          <div className="w-full flex-1 min-h-[220px] bg-[#f0f0f0] rounded-[12px] overflow-hidden relative">
            {!mainImgError && activeImageUrl ? (
              <img
                src={activeImageUrl}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover"
                onError={() => setMainImgError(true)}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-400 font-medium min-h-[220px]">
                No image
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {processedImages.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pt-3 pb-1 scrollbar-hide" style={{ WebkitOverflowScrolling: "touch" }}>
              {processedImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => { setActiveImageIndex(idx); setMainImgError(false); }}
                  className={`shrink-0 rounded-[10px] overflow-hidden transition-all duration-200 border-[2.5px] ${
                    activeImageIndex === idx
                      ? "border-black opacity-100 scale-100"
                      : "border-transparent opacity-55 hover:opacity-90 hover:scale-[1.03]"
                  }`}
                  style={{ width: 88, height: 88 }}
                  aria-label={`Image ${idx + 1}`}
                >
                  <img src={imgUrl} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL: Details ── */}
        <div className="w-full md:flex-1 flex flex-col overflow-y-auto px-6 md:px-8 py-6 md:py-8">

          {/* Category + Style tags */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-[12px] font-bold uppercase tracking-[0.18em] text-gray-700">
              {category}
            </span>
            {styleAesthetic && (
              <span className="text-[11px] font-semibold text-gray-500 border border-gray-300 rounded-full px-2.5 py-0.5 tracking-wide">
                {styleAesthetic}
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="font-serif text-[30px] md:text-[38px] text-[#111] leading-[1.1] tracking-tight mb-7">
            {title}
          </h2>

          {/* Detail Sections */}
          <div className="flex flex-col gap-6 flex-1">

            {/* MATERIAL */}
            {product.metal_purity && (
              <SectionBlock title="Material">
                <SectionRow
                  label={product.metal_type || "Gold"}
                  value={product.metal_purity}
                />
              </SectionBlock>
            )}

            {/* WEIGHT */}
            {(formatWeight(product.net_weight) || formatWeight(product.gross_weight) || formatWeight(product.stone_weight)) && (
              <SectionBlock title="Weight">
                {formatWeight(product.net_weight) && (
                  <SectionRow label="Net weight" value={formatWeight(product.net_weight)} />
                )}
                {formatWeight(product.gross_weight) && (
                  <SectionRow label="Gross weight" value={formatWeight(product.gross_weight)} />
                )}
                {formatWeight(product.stone_weight) && (
                  <SectionRow label="Stone weight" value={formatWeight(product.stone_weight)} />
                )}
              </SectionBlock>
            )}

            {/* AVAILABILITY */}
            {product.stock_available !== null && product.stock_available !== undefined && (
              <SectionBlock title="Availability">
                <SectionRow
                  label={inStock ? "In stock" : "Made to order"}
                  value={inStock ? "" : leadTime || ""}
                />
              </SectionBlock>
            )}
          </div>

          {/* CTA — only shown on Wholesaler Gallery (when onStartChat is provided) */}
          {onStartChat && (
            <div className="mt-8 flex flex-col items-center gap-3">
              <button
                onClick={() => onStartChat(product)}
                className="w-full bg-[#111] text-white py-[15px] rounded-[10px] text-[15px] font-semibold tracking-wide transition-all hover:bg-black active:scale-[0.98]"
              >
                Send Request
              </button>
              <button
                onClick={() => onStartChat(product)}
                className="text-[14px] font-medium text-gray-600 hover:text-gray-900 underline underline-offset-4 decoration-gray-300 hover:decoration-gray-600 transition-all"
              >
                Chat with us
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
