"use client";

import { useEffect, useState } from "react";

function formatWeight(val) {
  if (!val && val !== 0) return null;
  return `${Number(val).toFixed(2)}g`;
}
export function ProductInfoModal({ isOpen, onClose, product, onStartChat }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setImgError(false);
      setActiveImageIndex(0);
    }
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const images = [];
  // Prioritize processed and generated images
  if (product.processed_image_url) images.push(product.processed_image_url);
  
  if (product.generated_image_urls && Array.isArray(product.generated_image_urls)) {
    product.generated_image_urls.forEach(url => {
      if (!images.includes(url)) images.push(url);
    });
  }

  // Only show original/raw images if no processed images exist
  if (images.length === 0) {
    if (product.image_url) images.push(product.image_url);
    if (product.raw_image_url && !images.includes(product.raw_image_url)) {
      images.push(product.raw_image_url);
    }
  }

  const activeImageUrl = images[activeImageIndex] || null;
  const title = product.title || (product.jewellery_type ? product.jewellery_type.charAt(0).toUpperCase() + product.jewellery_type.slice(1) : "Untitled Product");
  const category = product.category || product.jewellery_type || "Uncategorized";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-[900px] bg-white rounded-[24px] shadow-2xl overflow-hidden flex flex-col md:flex-row relative max-h-[95vh]">
        {/* Top Control Bar (Mobile friendly) */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 pointer-events-none">
          {/* Back Arrow */}
          <button
            onClick={onClose}
            className="pointer-events-auto w-10 h-10 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-md text-gray-900 shadow-md transition-all hover:scale-105 active:scale-95"
            aria-label="Go back"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </button>

          {/* Close Button (Optional if Back Arrow exists, but keeping for desktop feel) */}
          <button
            onClick={onClose}
            className="pointer-events-auto w-10 h-10 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-md text-gray-900 shadow-md transition-all hover:scale-105 active:scale-95 hidden md:flex"
            aria-label="Close"
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Image Section */}
        <div className="w-full md:w-1/2 bg-gray-50 flex flex-col p-6 border-r border-gray-100">
          <div className="flex-1 w-full bg-white rounded-2xl overflow-hidden shadow-sm relative min-h-[300px] mb-4">
            {!imgError && activeImageUrl ? (
              <img
                src={activeImageUrl}
                alt={title}
                className="absolute inset-0 w-full h-full object-contain p-4"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-400 font-medium">No image available</div>
            )}
          </div>
          
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {images.slice(0, 4).map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveImageIndex(idx);
                    setImgError(false);
                  }}
                  className={`relative w-[60px] h-[60px] md:w-[72px] md:h-[72px] shrink-0 rounded-xl overflow-hidden transition-all duration-300 ${
                    activeImageIndex === idx 
                    ? "ring-2 ring-black ring-offset-2 scale-100" 
                    : "opacity-60 hover:opacity-100 hover:scale-105"
                  }`}
                >
                  <img src={imgUrl} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="w-full md:w-1/2 flex flex-col p-6 md:p-8 max-h-[80vh] overflow-y-auto">
          <div className="flex-1">
            {/* Category Badge */}
            <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-[11px] uppercase tracking-widest text-gray-600 font-bold mb-4">
              {category}
            </span>

            {/* Title */}
            <h2 className="text-[32px] md:text-[44px] font-serif text-[#111827] leading-[1.1] mb-6 tracking-tight">
              {title}
            </h2>

            {product.style && (
              <p className="text-[14px] text-gray-500 font-medium mb-4">{product.style}</p>
            )}

            {/* Tags (designer collection designs) */}
            {Array.isArray(product.tags) && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {product.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Date added (designer collection) */}
            {product.created_at && !product.wholesaler_email && !product.metal_purity && (
              <div className="mb-6 pt-4 border-t border-gray-100">
                <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Added On</p>
                <p className="text-[14px] font-bold text-gray-800">
                  {new Date(product.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            )}

            {/* Wholesaler product specs */}
            <div className="flex flex-col gap-8 mb-10">
              
              {product.metal_purity && (
                <div className="w-full">
                  <div className="flex items-baseline gap-4 mb-1">
                    <p className="text-[12px] uppercase tracking-[0.2em] text-gray-400 font-bold whitespace-nowrap">Material</p>
                    <div className="flex-1 border-b border-dotted border-gray-300 translate-y-[-4px]"></div>
                  </div>
                  <p className="text-[16px] font-medium text-gray-900">{product.metal_purity}</p>
                </div>
              )}

              {formatWeight(product.net_weight) && (
                <div className="w-full">
                  <div className="flex items-baseline gap-4 mb-1">
                    <p className="text-[12px] uppercase tracking-[0.2em] text-gray-400 font-bold whitespace-nowrap">Weight</p>
                    <div className="flex-1 border-b border-dotted border-gray-300 translate-y-[-4px]"></div>
                  </div>
                  <p className="text-[16px] font-medium text-gray-900">{formatWeight(product.net_weight)}</p>
                </div>
              )}

              {product.stock_available !== null && product.stock_available !== undefined && (
                <div className="w-full">
                  <div className="flex items-baseline gap-4 mb-1">
                    <p className="text-[12px] uppercase tracking-[0.2em] text-gray-400 font-bold whitespace-nowrap">Availability</p>
                    <div className="flex-1 border-b border-dotted border-gray-300 translate-y-[-4px]"></div>
                  </div>
                  <p className={`text-[16px] font-medium ${typeof product.stock_available === 'number' && product.stock_available > 0 ? "text-emerald-600" : "text-amber-600"}`}>
                    {typeof product.stock_available === 'number' && product.stock_available > 0 
                      ? `${product.stock_available} in stock` 
                      : (product.stock_available === true || product.stock_available === 'true')
                        ? "In stock"
                        : "Made to order"}
                  </p>
                </div>
              )}
              
              {product.make_to_order_days && (
                <div className="w-full">
                  <div className="flex items-baseline gap-4 mb-1">
                    <p className="text-[12px] uppercase tracking-[0.2em] text-gray-400 font-bold whitespace-nowrap">Lead Time</p>
                    <div className="flex-1 border-b border-dotted border-gray-300 translate-y-[-4px]"></div>
                  </div>
                  <p className="text-[16px] font-medium text-gray-900">{product.make_to_order_days} days</p>
                </div>
              )}
            </div>
            
            {/* Wholesaler info */}
            {product.wholesaler_email && (
              <div className="pt-6 border-t border-gray-100">
                <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-2">Wholesaler</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[14px] font-bold text-blue-600 shrink-0">
                    W
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-gray-900">{product.wholesaler_email}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

            {/* Action Button - Only show if onStartChat handler is provided (e.g. Wholesaler Gallery) */}
            {onStartChat && (
              <div className="mt-auto pt-8">
                <button
                  onClick={() => onStartChat(product)}
                  className="w-full bg-black text-white py-5 rounded-[12px] text-[16px] font-bold tracking-wide transition-all hover:bg-gray-900 active:scale-[0.98] shadow-lg shadow-black/10"
                >
                  Send Request
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
}
