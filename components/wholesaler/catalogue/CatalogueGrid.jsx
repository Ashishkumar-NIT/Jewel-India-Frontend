"use client";

import { useState, memo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// ── Product Detail Modal ──────────────────────────────────────────────────────
function ProductDetailModal({ product, onClose }) {
  if (!product) return null;

  // TODO: replace with Supabase product/processed/{product.sku} fetch once SKU is available
  const images = Array.from(new Set([
    product.processed_image_url,
    ...(product.generated_image_urls || []),
  ].filter(Boolean)));

  const hasImages = images.length > 0;
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const activeImageUrl = images[activeImageIndex] || null;

  const router = useRouter();
  const [isUpdatingPublish, setIsUpdatingPublish] = useState(false);
  const [isPublished, setIsPublished] = useState(product.is_published ?? true);

  // Data fallbacks/parsing
  const title = product.title || (product.jewellery_type ? product.jewellery_type.charAt(0).toUpperCase() + product.jewellery_type.slice(1) : "Jewelry Piece");
  const skuStr = product.sku || `JWL-${(product.id || "0000").slice(-6).toUpperCase()}`;
  const category = product.category || "Jewellery";
  const purity = product.purity || product.metal_purity || "24K";
  
  // Mock stats
  const savesCount = product.saves_count ?? "1.2k";
  const likesCount = product.likes_count ?? "3.4k";
  const viewsCount = product.views_count ?? "12.5k";
  const isInStock = product.stock_available ?? false;
  const weightStr = product.net_weight ? `${product.net_weight}g` : "20g";

  const handleTogglePublish = async () => {
    const newValue = !isPublished;
    setIsPublished(newValue);
    setIsUpdatingPublish(true);
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: newValue }),
      });
      if (!res.ok) throw new Error("Failed");
    } catch (err) {
      setIsPublished(!newValue);
    } finally {
      setIsUpdatingPublish(false);
    }
  };

  const handleEdit = () => {
    router.push(`/dashboard/wholesaler/edit-product/${product.id}`);
  };

  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/dashboard/wholesaler/products/${product.id}`;
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Link copied!");
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.4)] backdrop-blur-sm p-4 overflow-hidden" onClick={onClose}>
      <div 
        className="relative bg-white rounded-[24px] shadow-[0_16px_40px_rgba(0,0,0,0.12)] w-full max-w-[1000px] max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Column - Image Viewer (~58%) */}
        <div className="w-full md:w-[58%] p-6 flex flex-col gap-4 border-r border-[#f0f0f0]">
          {/* Main Image */}
          <div className="w-full aspect-square bg-[#F5F5F5] rounded-[16px] flex items-center justify-center overflow-hidden relative">
            {activeImageUrl ? (
              <Image
                src={activeImageUrl}
                alt={title}
                fill
                loading="lazy"
                className="w-full h-full object-contain mix-blend-multiply"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-[#999] gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6.5 2h11l4 6-9.5 14L2.5 8l4-6z" />
                </svg>
                <span className="text-[14px]">No Image Found</span>
              </div>
            )}
          </div>
          
          {/* Thumbnail Strip */}
          {hasImages && (
            <div className="flex gap-3 pb-2 custom-scrollbar overflow-x-auto">
              {images.slice(0, 4).map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`shrink-0 w-[64px] h-[64px] md:w-[72px] md:h-[72px] rounded-[10px] bg-[#f5f5f5] overflow-hidden transition-all border-2 ${activeImageIndex === idx ? 'border-[#111]' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <Image
                    src={imgUrl}
                    alt={`Thumb ${idx}`}
                    width={72}
                    height={72}
                    loading="lazy"
                    className="w-full h-full object-cover mix-blend-multiply"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Product Info (~42%) */}
        <div className="w-full md:w-[42%] p-8 flex flex-col relative">
          
          {/* Top Right Actions */}
          <div className="absolute top-6 right-6 flex items-center gap-3">
            <button onClick={handleEdit} className="text-[#999] hover:text-[#111] transition-colors bg-transparent border-none p-0 outline-none cursor-pointer" aria-label="Edit">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button onClick={onClose} className="text-[#999] hover:text-[#111] transition-colors ml-2 bg-transparent border-none p-0 outline-none cursor-pointer" aria-label="Close">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div className="pr-[100px] mb-6">
            <h2 className="text-[20px] font-bold text-[#1A1A1A] leading-tight break-all sm:break-normal">{title}</h2>
            <p className="text-[14px] text-[#888] mt-1">{category} • {skuStr}</p>
          </div>


          {/* Stock Line */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isInStock ? 'bg-[#22c55e]' : 'bg-[#ef4444]'}`}></span>
              <span className={`text-[14px] font-bold ${isInStock ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                {isInStock ? 'In stock' : 'Out of stock'}
              </span>
            </div>
            <span className="text-[#ccc]">|</span>
            <span className="text-[14px] text-[#888]">{weightStr}</span>
          </div>

          {/* Specifications Card */}
          <div className="bg-[#F8F8F8] rounded-[12px] p-5 mb-8">
            <h3 className="text-[14px] font-semibold text-[#1A1A1A] mb-4">Specifications</h3>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-[14px] text-[#666]">Purity</span>
                <span className="text-[14px] font-semibold text-[#1A1A1A]">{purity}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[14px] text-[#666]">Gross weight</span>
                <span className="text-[14px] font-semibold text-[#1A1A1A]">{product.gross_weight ? `${product.gross_weight}g` : '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[14px] text-[#666]">Net weight</span>
                <span className="text-[14px] font-semibold text-[#1A1A1A]">{product.net_weight ? `${product.net_weight}g` : '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[14px] text-[#666]">Stone weight</span>
                <span className="text-[14px] font-semibold text-[#1A1A1A]">{product.stone_weight ? `${product.stone_weight}g` : '-'}</span>
              </div>
            </div>
          </div>

          {/* Publish Toggle */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#f0f0f0]">
            <span className="text-[15px] font-semibold text-[#1A1A1A]">Publish to Collection</span>
            <button
              onClick={handleTogglePublish}
              disabled={isUpdatingPublish}
              className={`relative w-[50px] h-7 rounded-full transition-colors duration-300 ease-in-out focus:outline-none disabled:opacity-50 border-none cursor-pointer ${isPublished ? 'bg-[#34C759]' : 'bg-[#E5E5EA]'}`}
            >
              <span className={`absolute top-[2px] left-[2px] bg-white w-[24px] h-[24px] rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.2)] transition-transform duration-300 ease-in-out ${isPublished ? 'translate-x-[22px]' : 'translate-x-0'}`} />
            </button>
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
// Memoize to prevent re-renders when parent re-renders but product hasn't changed.
const CatalogueProductCard = memo(function CatalogueProductCard({ product, onClick }) {
  const router = useRouter();
  const [imgError, setImgError] = useState(false);
  const [isInStock, setIsInStock] = useState(product.stock_available ?? false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Use the best available image URL (never raw)
  const imgUrl = product.processed_image_url || product.generated_image_urls?.[0];

  const title = product.title || (product.jewellery_type ? product.jewellery_type.charAt(0).toUpperCase() + product.jewellery_type.slice(1) : "Jewelry Piece");
  const weight = product.net_weight ? `${product.net_weight}g` : "";


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

  return (
    <article
      onClick={() => onClick && onClick(product)}
      className="cursor-pointer group flex flex-col bg-celestique-light rounded-xl border border-[#eee] transition-all duration-200 ease shadow-[0_2px_12px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:-translate-y-[2px] active:scale-[0.98]"
    >
      <div className="w-full aspect-square bg-[#f9f9f9] rounded-t-xl overflow-hidden relative">
        {imgUrl && !imgError ? (
          <Image
            src={imgUrl}
            alt={title}
            fill
            loading="lazy"
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
        <div className="flex flex-row justify-between items-start">
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
          <button 
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/dashboard/wholesaler/edit-product/${product.id}`);
            }}
            className="text-[#999] hover:text-[#111] transition-colors p-1"
            title="Edit Product"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
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
  );
});

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
        <Image
          src="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1775076102/image_1613_bslbzg.png"
          alt="No products"
          width={220}
          height={220}
          loading="lazy"
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
