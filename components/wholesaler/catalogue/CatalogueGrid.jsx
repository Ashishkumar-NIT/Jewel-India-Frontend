"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
function CatalogueProductCard({ product }) {
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

  return <article className="group flex flex-col bg-[#ffffff] rounded-xl border border-[#eee] transition-all duration-200 ease bg-white shadow-[0_2px_12px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:-translate-y-[2px]">
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
      <h3 className="font-bold text-[14px] text-[#111] leading-tight truncate">
        {title}
      </h3>

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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-[16px]">
      {products.map((product) => (
        <CatalogueProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
