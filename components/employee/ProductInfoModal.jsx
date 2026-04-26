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
  if (product.processed_image_url) images.push(product.processed_image_url);
  if (product.generated_image_urls && Array.isArray(product.generated_image_urls)) {
    product.generated_image_urls.forEach(url => {
      if (!images.includes(url)) images.push(url);
    });
  }
  if (product.raw_image_url && !images.includes(product.raw_image_url)) {
    images.push(product.raw_image_url);
  }

  const activeImageUrl = images[activeImageIndex] || null;
  const title = product.title || product.jewellery_type || "Untitled Product";
  const category = product.category || product.jewellery_type || "Uncategorized";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-[900px] bg-white rounded-[24px] shadow-2xl overflow-hidden flex flex-col md:flex-row relative max-h-[95vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-gray-700 shadow-sm transition-colors md:bg-gray-100 md:hover:bg-gray-200"
          aria-label="Close"
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

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
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveImageIndex(idx);
                    setImgError(false);
                  }}
                  className={`relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                    activeImageIndex === idx ? "border-blue-500 opacity-100" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="w-full md:w-1/2 flex flex-col p-6 md:p-8 max-h-[80vh] overflow-y-auto">
          <div className="flex-1">
            <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-[11px] uppercase tracking-widest text-gray-600 font-bold mb-4">
              {category}
            </span>
            <h2 className="text-[24px] md:text-[28px] font-extrabold text-[#111827] leading-tight mb-2">
              {title}
            </h2>
            {product.style && (
              <p className="text-[14px] text-gray-500 font-medium mb-6">{product.style}</p>
            )}

            <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8">
              {product.stock_available !== null && product.stock_available !== undefined && (
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Availability</p>
                  <p className={`text-[14px] font-bold ${product.stock_available > 0 ? "text-emerald-600" : "text-amber-600"}`}>
                    {product.stock_available > 0 ? `${product.stock_available} in stock` : "Made to order"}
                  </p>
                </div>
              )}
              
              {product.make_to_order_days && (
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Lead Time</p>
                  <p className="text-[14px] font-bold text-gray-800">{product.make_to_order_days} days</p>
                </div>
              )}

              {product.metal_purity && (
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Metal Purity</p>
                  <p className="text-[14px] font-bold text-gray-800">{product.metal_purity}</p>
                </div>
              )}

              {formatWeight(product.net_weight) && (
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Net Weight</p>
                  <p className="text-[14px] font-bold text-gray-800">{formatWeight(product.net_weight)}</p>
                </div>
              )}

              {formatWeight(product.gross_weight) && (
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Gross Weight</p>
                  <p className="text-[14px] font-bold text-gray-800">{formatWeight(product.gross_weight)}</p>
                </div>
              )}

              {formatWeight(product.stone_weight) && (
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Stone Weight</p>
                  <p className="text-[14px] font-bold text-gray-800">{formatWeight(product.stone_weight)}</p>
                </div>
              )}
            </div>
            
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
          </div>

          {/* Action Footer */}
          <div className="pt-8 mt-auto">
            <button
              onClick={() => onStartChat && onStartChat(product)}
              className="w-full flex items-center justify-center gap-2 rounded-[12px] bg-[#111827] px-6 py-3.5 text-[14px] font-bold text-white hover:bg-black transition-colors shadow-md hover:shadow-lg"
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Chat with Wholesaler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
