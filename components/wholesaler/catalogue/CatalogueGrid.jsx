"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ── Product Detail Modal ──────────────────────────────────────────────────────
function ProductDetailModal({ product, onClose }) {
  if (!product) return null;

  const images = Array.from(new Set([
    product.processed_image_url,
    product.image_url,
    product.raw_image_url,
    ...(product.generated_image_urls || []),
  ].filter(Boolean)));

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const title = product.title || (product.jewellery_type ? product.jewellery_type.charAt(0).toUpperCase() + product.jewellery_type.slice(1) : "Jewelry Piece");
  const typeDisplay = product.jewellery_type ? product.jewellery_type.charAt(0).toUpperCase() + product.jewellery_type.slice(1) : "";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(0,0,0,0.6)] p-4" onClick={onClose}>
      <div 
        className="relative bg-[#1a1a1a] rounded-[16px] w-full max-w-[780px] p-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-[16px] right-[16px] text-[#aaaaaa] hover:text-[#ffffff] text-[24px] bg-transparent border-none cursor-pointer leading-[1]"
        >
          &times;
        </button>

        <div className="flex flex-col md:flex-row gap-[24px]">
          {/* Left Column */}
          <div className="w-full md:w-[45%] flex flex-col gap-[16px] shrink-0">
            <div className="w-full h-[400px] bg-[#222] rounded-[12px] overflow-hidden">
              {images[activeImageIndex] ? (
                <img 
                  src={images[activeImageIndex]} 
                  alt={title} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#666]">
                  No Image
                </div>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="flex gap-[8px] overflow-x-auto pb-1 scrollbar-hide">
                {images.map((img, idx) => (
                  <img 
                    key={idx}
                    src={img}
                    alt={`Thumbnail ${idx}`}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`shrink-0 w-[60px] h-[60px] object-cover rounded-[8px] cursor-pointer box-border transition-colors ${activeImageIndex === idx ? 'border-[2px] border-[#ff69b4]' : 'border-[2px] border-transparent'}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="w-full md:w-[55%] flex flex-col flex-1 shrink-0">
            <div className="flex items-center gap-3 flex-wrap mb-[16px]">
              <h2 className="text-[22px] font-[700] text-[#ffffff] m-0 leading-tight">{title}</h2>
              {typeDisplay && (
                <span className="bg-[rgba(255,105,180,0.15)] text-[#ff69b4] border border-[#ff69b4] rounded-[999px] text-[12px] px-[10px] py-[4px]">
                  {typeDisplay}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-3 py-4 border-t border-b border-[rgba(255,255,255,0.05)] mb-[16px]">
              {product.metal_category && (
                <div className="flex justify-between items-center text-[14px]">
                  <span className="text-[#aaaaaa]">Metal category</span>
                  <span className="text-[#ffffff] font-medium">{product.metal_category}</span>
                </div>
              )}
              {product.purity && (
                <div className="flex justify-between items-center text-[14px]">
                  <span className="text-[#aaaaaa]">Purity</span>
                  <span className="text-[#ffffff] font-medium">{product.purity}</span>
                </div>
              )}
              {(product.design_style || product.style) && (
                <div className="flex justify-between items-center text-[14px]">
                  <span className="text-[#aaaaaa]">Style</span>
                  <span className="text-[#ffffff] font-medium">{product.design_style || product.style}</span>
                </div>
              )}
              {product.size && (
                <div className="flex justify-between items-center text-[14px]">
                  <span className="text-[#aaaaaa]">Size</span>
                  <span className="text-[#ffffff] font-medium">{product.size}</span>
                </div>
              )}
            </div>

            {(product.gross_weight || product.stone_weight || product.net_weight) && (
              <div className="flex gap-[8px] mb-[16px]">
                {product.gross_weight && (
                  <div className="flex-1 bg-[rgba(255,255,255,0.05)] rounded-[8px] px-[14px] py-[10px] flex flex-col gap-1">
                    <span className="text-[11px] text-[#aaaaaa]">Gross weight</span>
                    <span className="text-[14px] text-[#ffffff] font-[600]">{product.gross_weight}g</span>
                  </div>
                )}
                {product.stone_weight && (
                  <div className="flex-1 bg-[rgba(255,255,255,0.05)] rounded-[8px] px-[14px] py-[10px] flex flex-col gap-1">
                    <span className="text-[11px] text-[#aaaaaa]">Stone weight</span>
                    <span className="text-[14px] text-[#ffffff] font-[600]">{product.stone_weight}g</span>
                  </div>
                )}
                {product.net_weight && (
                  <div className="flex-1 bg-[rgba(255,255,255,0.05)] rounded-[8px] px-[14px] py-[10px] flex flex-col gap-1">
                    <span className="text-[11px] text-[#aaaaaa]">Net weight</span>
                    <span className="text-[14px] text-[#ffffff] font-[600]">{product.net_weight}g</span>
                  </div>
                )}
              </div>
            )}

            <div className="mt-auto pt-2">
              <div className="flex items-center gap-1.5">
                <div className={`w-[8px] h-[8px] rounded-full ${product.stock_available !== false ? 'bg-[#00c853]' : 'bg-[#ff1744]'}`} />
                <span className={`text-[13px] font-[500] ${product.stock_available !== false ? 'text-[#00c853]' : 'text-[#ff1744]'}`}>
                  {product.stock_available !== false ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────────────────
export function CatalogueCardSkeleton() {
  return (
    <div className="flex flex-col bg-white border border-[#eee] rounded-xl overflow-hidden min-h-[300px]">
      <div className="catalogue-skeleton-bg w-full aspect-square relative" />
      <div className="p-3 space-y-3">
        <div className="catalogue-skeleton-bg h-4 rounded" style={{ width: "80%" }} />
        <div className="catalogue-skeleton-bg h-3 rounded" style={{ width: "50%" }} />
        <div className="flex justify-between items-center pt-2">
          <div className="catalogue-skeleton-bg h-5 w-16 rounded-full" />
          <div className="catalogue-skeleton-bg h-3 w-8 rounded" />
        </div>
      </div>
    </div>
  );
}

// ── Product Card ──────────────────────────────────────────────────────────────
function CatalogueProductCard({ product, onClick }) {
  const [imgError, setImgError] = useState(false);
  const [isInStock, setIsInStock] = useState(product.stock_available ?? false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Use the best available image URL
  const imgUrl = product.processed_image_url || product.image_url || product.raw_image_url || product.generated_image_urls?.[0];

  const title = product.title || (product.jewellery_type ? product.jewellery_type.charAt(0).toUpperCase() + product.jewellery_type.slice(1) : "Jewelry Piece");
  const weight = product.net_weight ? `${product.net_weight}g` : "";

  // Mock likes & orders per prompt
  const likes = product.likes ?? 0; // TODO: wire to retailer phase
  const orders = product.order_count ?? 0; // TODO: wire to retailer phase

  const handleToggle = async (e) => {
    e.stopPropagation(); // prevent card click if we add one later
    if (isUpdating) return;

    const newValue = !isInStock;
    setIsInStock(newValue); // Optimistic UI
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ in_stock: newValue }),
      });
      if (!res.ok) {
        throw new Error("Failed to update stock");
      }
    } catch (err) {
      console.error(err);
      setIsInStock(!newValue); // Revert on failure
    } finally {
      setIsUpdating(false);
    }
  };

  return <article 
    onClick={() => onClick && onClick(product)}
    className="cursor-pointer group flex flex-col bg-[#ffffff] rounded-xl border border-[#eee] transition-all duration-200 ease shadow-[0_2px_12px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:-translate-y-[2px]"
  >
    <div className="w-full aspect-square bg-[#f9f9f9] rounded-t-xl overflow-hidden relative">
      {imgUrl && !imgError ? (
        <img
          src={imgUrl}
          alt={title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-[#999]">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6.5 2h11l4 6-9.5 14L2.5 8l4-6z" />
          </svg>
        </div>
      )}
    </div>

    <div className="border-t border-[#eee] p-3 md:p-4 flex flex-col gap-2">
      <div className="flex flex-col">
        <h3 className="font-bold text-[14px] text-[#111] leading-tight truncate">
          {title}
        </h3>
        {product.jewellery_type && (
          <span className="text-[11px] text-[#aaaaaa] mt-0.5">
            {product.jewellery_type.charAt(0).toUpperCase() + product.jewellery_type.slice(1)}
          </span>
        )}
      </div>

      <div className="text-[13px] text-[#666] flex items-center gap-2">
        <span>
          <span className="text-red-500 mr-1">❤</span>
          {likes}
        </span>
        <span className="text-[#e0e0e0]">|</span>
        <span>{orders} orders</span>
      </div>

      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggle}
            disabled={isUpdating}
            className={`relative w-9 h-5 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#111] ${isInStock ? 'bg-[#22c55e]' : 'bg-[#e0e0e0]'}`}
          >
            <span
              className={`absolute top-[2px] left-[2px] bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${isInStock ? 'translate-x-4' : 'translate-x-0'}`}
            />
          </button>
          <span className="text-[12px] text-[#999]">
            {isInStock ? "In stock" : "Out of stock"}
          </span>
        </div>
        {weight && (
          <span className="text-[12px] text-[#999]">{weight}</span>
        )}
      </div>
    </div>
  </article>
    ;
}

// ── CatalogueGrid ─────────────────────────────────────────────────────────────
export default function CatalogueGrid({
  products = [],
  isLoading = false,
  isError = false,
  onRetry,
  activeCategory = "All",
}) {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState(null);

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
        <p className="text-[14px] text-[#666]">Something went wrong. Please try again.</p>
        <button
          onClick={onRetry}
          className="text-[#111] text-[14px] font-medium border border-[#ddd] px-4 py-2 rounded-full hover:bg-[#f9f9f9] transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[16px]">
        {Array.from({ length: 8 }).map((_, i) => (
          <CatalogueCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    const isFiltered = activeCategory !== "all" && activeCategory !== "All";
    const displayName = isFiltered ? activeCategory : "jewelry";

    return (
      <div className="flex flex-col items-center justify-center py-16 text-center w-full">
        <img
          src="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1775076102/image_1613_bslbzg.png"
          alt="No products"
          className="w-[220px] h-auto mb-6"
        />
        <h3 className="font-bold text-[18px] text-[#111] mb-2">
          Nothing here yet
        </h3>
        <p className="text-[14px] text-[#666] max-w-sm mb-6">
          You haven't added any {displayName} to your catalogue. Upload your first design.
        </p>
        <button
          onClick={() => router.push("/dashboard/wholesaler/add-product")}
          className="bg-[#111] text-white text-[14px] rounded-full px-[28px] py-[12px] hover:bg-[#333] transition-colors"
        >
          Upload design
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[16px]">
        {products.map((product) => (
          <CatalogueProductCard 
            key={product.id} 
            product={product} 
            onClick={() => setSelectedProduct(product)}
          />
        ))}
      </div>
      {selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </>
  );
}
