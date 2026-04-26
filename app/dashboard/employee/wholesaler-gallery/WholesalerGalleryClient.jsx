"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function formatWeight(val) {
  if (!val && val !== 0) return null;
  return `${Number(val).toFixed(2)}g`;
}

function ProductCard({ product, onClick }) {
  const [imgError, setImgError] = useState(false);

  const imageUrl = product.processed_image_url || product.raw_image_url;
  const title = product.title || product.jewellery_type || "Untitled";
  const category = product.category || product.jewellery_type || "Uncategorized";

  return (
    <article 
      onClick={() => onClick && onClick(product)}
      className="group flex flex-col rounded-[16px] border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Image */}
      <div className="relative aspect-square w-full bg-gray-50 overflow-hidden">
        {!imgError && imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[12px] text-gray-400">
            No image
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="rounded-full bg-black/70 px-3 py-1 text-[10px] uppercase tracking-widest text-white">
            {category}
          </span>
        </div>

        {/* Stock badge */}
        {product.stock_available !== null && product.stock_available !== undefined && (
          <div className="absolute top-3 right-3">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              product.stock_available > 0
                ? "bg-emerald-100 text-emerald-700"
                : "bg-red-100 text-red-600"
            }`}>
              {product.stock_available > 0 ? "In Stock" : "Made to Order"}
            </span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col gap-2.5 px-4 py-4">
        <div>
          <h3 className="text-[14px] font-bold text-[#111827] leading-snug line-clamp-2">
            {title}
          </h3>
          {product.style && (
            <p className="text-[12px] text-[#6B7280] mt-0.5">{product.style}</p>
          )}
        </div>

        {/* Specs row */}
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {product.metal_purity && (
            <span className="text-[11px] text-[#6B7280]">
              <span className="font-semibold text-[#374151]">{product.metal_purity}</span>
            </span>
          )}
          {formatWeight(product.net_weight) && (
            <span className="text-[11px] text-[#6B7280]">
              Net: <span className="font-semibold text-[#374151]">{formatWeight(product.net_weight)}</span>
            </span>
          )}
          {formatWeight(product.gross_weight) && (
            <span className="text-[11px] text-[#6B7280]">
              Gross: <span className="font-semibold text-[#374151]">{formatWeight(product.gross_weight)}</span>
            </span>
          )}
        </div>

        {/* Wholesaler info */}
        {product.wholesaler_email && (
          <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 shrink-0">
              W
            </div>
            <span className="text-[11px] text-[#6B7280] truncate" title={product.wholesaler_email}>
              {product.wholesaler_email}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}

import { ProductInfoModal } from "../../../../components/employee/ProductInfoModal";

/**
 * Client component for the wholesaler gallery.
 * Provides search and category filtering over all wholesaler products.
 */
export default function WholesalerGalleryClient({ products, categoryTabs }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const filteredProducts = useMemo(() => {
    let result = products;

    // Category filter
    if (activeCategory !== "all") {
      result = result.filter((p) => {
        const cat = (p.category || p.jewellery_type || "").toLowerCase();
        return cat === activeCategory.toLowerCase();
      });
    }

    // Search filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((p) => {
        const searchable = [
          p.title,
          p.jewellery_type,
          p.category,
          p.style,
          p.metal_purity,
          p.wholesaler_email,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return searchable.includes(q);
      });
    }

    return result;
  }, [products, activeCategory, search]);

  const router = useRouter();
  const [isStartingChat, setIsStartingChat] = useState(false);

  const handleStartChat = async (product) => {
    setIsStartingChat(true);
    try {
      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: product.id }),
      });
      
      if (!res.ok) {
        throw new Error("Failed to start chat");
      }
      
      const json = await res.json();
      router.push("/dashboard/employee/messages");
    } catch (err) {
      console.error(err);
      alert("Could not start chat. Please try again.");
    } finally {
      setIsStartingChat(false);
    }
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400 font-semibold">
            All Wholesalers
          </p>
          <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight">
            Wholesaler Gallery ({products.length})
          </h1>
        </div>

        {/* Search */}
        <div className="relative w-full max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-[10px] pl-10 pr-4 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-black/5"
          />
        </div>
      </div>

      {/* Category filter tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {categoryTabs.map((tab) => {
          const key = tab.toLowerCase();
          const isActive = activeCategory === key;
          return (
            <button
              key={tab}
              onClick={() => setActiveCategory(key)}
              className={`rounded-full px-4 py-2 text-[12px] font-semibold transition-colors ${
                isActive
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Products grid */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-[16px] border border-dashed border-gray-200 bg-gray-50 px-6 py-16 text-center">
          <p className="text-[14px] font-semibold text-gray-500">No products found.</p>
          <p className="text-[12px] text-gray-400 mt-2">
            {search.trim()
              ? "Try adjusting your search or category filter."
              : "No wholesaler products are available yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onClick={(p) => setSelectedProduct(p)} 
            />
          ))}
        </div>
      )}

      {/* Product Info Modal */}
      <ProductInfoModal 
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        product={selectedProduct}
        onStartChat={handleStartChat}
      />
    </div>
  );
}
