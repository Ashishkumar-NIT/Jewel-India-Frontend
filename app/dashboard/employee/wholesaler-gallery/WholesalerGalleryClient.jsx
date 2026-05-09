"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function formatWeight(val) {
  if (!val && val !== 0) return null;
  return `${Number(val).toFixed(2)}g`;
}
function ProductCard({ product, onClick }) {
  const [imgError, setImgError] = useState(false);

  const imageUrl = product.processed_image_url || product.raw_image_url || product.image_url;
  const title = product.title || product.jewellery_type || "Untitled";

  return (
    <div
      onClick={() => onClick && onClick(product)}
      className="flex flex-col cursor-pointer group/card"
    >
      {/* Image — editorial style */}
      <div
        className="w-full bg-[#f8f8f8] p-4 flex items-center justify-center overflow-hidden"
        style={{ aspectRatio: "5/4" }}
      >
        {!imgError && imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-contain transition-transform group-hover/card:scale-105 duration-700"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-[12px] text-gray-300 font-light">No image</span>
        )}
      </div>

      {/* Label */}
      <div className="mt-4 text-center px-1">
        <span className="font-serif text-[12px] text-gray-500 italic tracking-wide line-clamp-1">
          {title}
        </span>
        {(product.metal_purity || product.net_weight) && (
          <p className="text-[10px] text-gray-300 mt-1 tracking-wide">
            {[product.metal_purity, product.net_weight ? `${product.net_weight}g` : null].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>
    </div>
  );
}

import { ProductInfoModal } from "@/components/employee/ProductInfoModal";

/**
 * Client component for the wholesaler gallery.
 * Provides search and category filtering over products.
 * Filters are applied server-side via URL searchParams on first load;
 * client can further refine via URL updates for shareable/bookmarkable state.
 */
export default function WholesalerGalleryClient({ products, categoryTabs, initialCategory = "all", initialSearch = "" }) {
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [search, setSearch] = useState(initialSearch);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Sync client filters with URL so server-side filtering gets triggered
  const router = useRouter();

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    const params = new URLSearchParams();
    if (cat !== "all") params.set("category", cat);
    if (search.trim()) params.set("q", search.trim());
    router.push(`?${params.toString()}`);
  };

  const handleSearchChange = (val) => {
    setSearch(val);
    const params = new URLSearchParams();
    if (activeCategory !== "all") params.set("category", activeCategory);
    if (val.trim()) params.set("q", val.trim());
    router.push(`?${params.toString()}`);
  };

  // Since server already filtered, show results directly.
  // Client still applies client-side refinement in case server filter was loose.
  const filteredProducts = useMemo(() => {
    let result = products;

    // Category filter (should already be filtered, but refine for safety)
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
            onChange={(e) => handleSearchChange(e.target.value)}
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
              onClick={() => handleCategoryChange(key)}
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
        <div className="grid grid-cols-3 gap-x-6 gap-y-12">
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
