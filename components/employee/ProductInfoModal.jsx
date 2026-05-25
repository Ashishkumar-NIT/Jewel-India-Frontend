"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import FullImageViewer from "../shared/FullImageViewer";

function formatWeight(val) {
  if (val === null || val === undefined || val === "") return null;
  const num = Number(val);
  if (isNaN(num)) return null;
  return `${num % 1 === 0 ? num : num.toFixed(2)}g`;
}

function SectionRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[15px] md:text-[16px] text-gray-500 font-light whitespace-nowrap">{label}</span>
      <span className="text-[15px] md:text-[16px] font-medium text-gray-900">{value}</span>
    </div>
  );
}

function SectionBlock({ title, children }) {
  return (
    <div className="w-full">
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
  const [isFullViewOpen, setIsFullViewOpen] = useState(false);

  // Request sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [formData, setFormData] = useState({ quantity: 1, customization_notes: "" });

  // Reset on open/close
  useEffect(() => {
    if (!isOpen) {
      setActiveImageIndex(0);
      setMainImgError(false);
      setIsSidebarOpen(false);
      setRequestSuccess(false);
      setIsSubmitting(false);
      setFormData({ quantity: 1, customization_notes: "" });
      setIsFullViewOpen(false);
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

  // Normalize fields between wholesaler products and retailer designs
  const title =
    product.title ||
    (product.jewellery_type
      ? product.jewellery_type.charAt(0).toUpperCase() + product.jewellery_type.slice(1)
      : product.type
      ? product.type.charAt(0).toUpperCase() + product.type.slice(1)
      : "Untitled Product");

  const category = product.category || product.jewellery_type || product.type || "Uncategorized";
  const styleAesthetic = product.style_aesthetic || product.style || null;

  const purity = product.purity || product.metal_purity || null;
  const metalType = product.metal_type || "Gold";

  const stockAvailable = 
    product.stock_available !== undefined && product.stock_available !== null
      ? product.stock_available
      : product.is_in_stock;

  const makeToOrderDays = 
    product.make_to_order_days !== undefined && product.make_to_order_days !== null
      ? product.make_to_order_days
      : product.production_time_days;

  // Availability
  const inStock =
    (typeof stockAvailable === "number" && stockAvailable > 0) ||
    stockAvailable === true ||
    stockAvailable === "true";

  const leadTime = makeToOrderDays
    ? `${makeToOrderDays} to ${Number(makeToOrderDays) + 2} days`
    : null;

  // Send request handler — same as handleIndividualSubmit in SelectionReviewClient
  const handleSendRequest = async () => {
    if (!product) return;
    setIsSubmitting(true);
    const items = [{
      product_id: product.id,
      wholesaler_id: product.wholesaler_id,
      quantity: formData.quantity,
      customization_notes: formData.customization_notes,
    }];

    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to submit request");
      setRequestSuccess(true);
    } catch (err) {
      alert(err.message);
      setIsSubmitting(false);
    }
  };

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

          {/* Back arrow */}
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
          <div 
            onClick={() => setIsFullViewOpen(true)}
            className="w-full flex-1 min-h-[220px] bg-[#f0f0f0] rounded-[12px] overflow-hidden relative cursor-pointer group/mainimg"
          >
            {!mainImgError && activeImageUrl ? (
              <>
                <img
                  src={activeImageUrl}
                  alt={title}
                  className="absolute inset-0 w-full h-full object-contain p-4 mix-blend-multiply transition-transform duration-300 group-hover/mainimg:scale-[1.02]"
                  onError={() => setMainImgError(true)}
                />
                <div className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/85 backdrop-blur-sm shadow-sm flex items-center justify-center text-gray-700 opacity-0 group-hover/mainimg:opacity-100 transition-opacity active:scale-90 pointer-events-none md:pointer-events-auto">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                  </svg>
                </div>
              </>
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
                  className={`shrink-0 rounded-[8px] overflow-hidden transition-all duration-200 border-[2px] ${
                    activeImageIndex === idx
                      ? "border-black opacity-100"
                      : "border-transparent opacity-55 hover:opacity-90 hover:scale-[1.03]"
                  }`}
                  style={{ width: 64, height: 64 }}
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
            {purity && (
              <SectionBlock title="Material">
                <SectionRow
                  label={metalType}
                  value={purity}
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
            {stockAvailable !== null && stockAvailable !== undefined && (
              <SectionBlock title="Availability">
                <SectionRow
                  label={inStock ? "In stock" : "Made to order"}
                  value={inStock ? "" : (leadTime || "")}
                />
              </SectionBlock>
            )}
          </div>

          {/* CTA — only shown on Wholesaler Gallery */}
          {onStartChat && (
            <div className="mt-8 flex flex-col items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="w-full bg-[#111] text-white py-[15px] rounded-[10px] text-[15px] font-semibold tracking-wide transition-all hover:bg-black active:scale-[0.98]"
              >
                Send Request
              </button>
              <Link
                href={`/dashboard/employee/messages?productId=${product.id}`}
                className="text-[14px] font-medium text-gray-600 hover:text-gray-900 underline underline-offset-4 decoration-gray-300 hover:decoration-gray-600 transition-all"
              >
                Chat with us
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── REQUEST SIDEBAR OVERLAY ── */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[70] flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => !isSubmitting && setIsSidebarOpen(false)}
          />

          {/* Sidebar panel */}
          <div className="relative w-full max-w-[420px] bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-slide-in-right">

            {/* Success state */}
            {requestSuccess ? (
              <div className="flex flex-col items-center justify-center flex-1 px-8 text-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className="text-[24px] font-serif text-[#111827] mb-2 tracking-tight">Request Sent!</h3>
                <p className="text-gray-500 text-[14px] mb-8 leading-relaxed">
                  Your request has been forwarded to the wholesaler. You can track it in your Orders tab.
                </p>
                <button
                  onClick={() => { setIsSidebarOpen(false); setRequestSuccess(false); onClose(); }}
                  className="bg-black text-white px-8 py-3 rounded-[10px] font-semibold text-[14px] hover:bg-gray-800 transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                  <h3 className="text-[15px] font-semibold text-gray-800">Request this Design</h3>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-black hover:bg-gray-100 transition-all"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-8 py-8 flex flex-col gap-10">

                  {/* Product snippet */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Product</div>
                      <div className="flex gap-2 mb-2">
                        <span className="text-[10px] uppercase border border-gray-200 px-2 py-0.5 text-gray-600 rounded-sm">{category}</span>
                        {styleAesthetic && (
                          <span className="text-[10px] uppercase text-gray-400 py-0.5">{styleAesthetic}</span>
                        )}
                      </div>
                      <h4 className="font-serif text-[18px] text-gray-900 leading-[1.2]">{title}</h4>
                    </div>
                    {activeImageUrl && (
                      <div className="w-20 h-20 rounded-[8px] overflow-hidden shrink-0 bg-gray-100">
                        <img src={activeImageUrl} alt={title} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  {/* Quantity */}
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-4">Quantity</div>
                    <div className="flex items-center gap-5">
                      <button
                        onClick={() => setFormData(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))}
                        className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-gray-100 text-xl transition-colors"
                      >
                        −
                      </button>
                      <span className="font-serif text-[22px] text-gray-800 w-6 text-center">{formData.quantity}</span>
                      <button
                        onClick={() => setFormData(p => ({ ...p, quantity: p.quantity + 1 }))}
                        className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-gray-100 text-xl transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Customization */}
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-4">Customization Notes</div>
                    <textarea
                      value={formData.customization_notes}
                      onChange={e => setFormData(p => ({ ...p, customization_notes: e.target.value }))}
                      rows={4}
                      placeholder="Describe any customization requirements..."
                      className="w-full bg-gray-50 border border-gray-100 rounded-[8px] px-5 py-4 text-[14px] text-gray-700 outline-none focus:ring-2 focus:ring-black/10 resize-none transition-shadow"
                    />
                  </div>
                </div>

                {/* Footer CTA */}
                <div className="px-8 py-6 border-t border-gray-100">
                  <button
                    onClick={handleSendRequest}
                    disabled={isSubmitting}
                    className="w-full bg-[#111] text-white py-4 rounded-[10px] text-[14px] font-bold uppercase tracking-[0.15em] hover:bg-black transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Sending..." : "Send Request"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Immersive Tablet-First Full Image Viewer Overlay */}
      <FullImageViewer
        isOpen={isFullViewOpen}
        onClose={() => setIsFullViewOpen(false)}
        images={processedImages}
        activeIndex={activeImageIndex}
        onChangeIndex={(idx) => setActiveImageIndex(idx)}
      />
    </div>
  );
}
