"use client";

import { useMemo, useState } from "react";
import { ProductInfoModal } from "@/components/employee/ProductInfoModal";

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function DesignCard({ design, onClick }) {
  const [imgError, setImgError] = useState(false);
  const title = design.title || "Untitled design";
  const tags = Array.isArray(design.tags) ? design.tags : [];
  return (
    <div
      className="flex flex-col cursor-pointer group/card"
      onClick={onClick}
    >
      {/* Image container — editorial style matching home page */}
      <div
        className="w-full bg-[#f8f8f8] p-4 flex items-center justify-center overflow-hidden"
        style={{ aspectRatio: "5/4" }}
      >
        {!imgError && design.image_url ? (
          <img
            src={design.image_url}
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
        {tags.length > 0 && (
          <p className="text-[10px] text-gray-300 mt-1 tracking-wide">
            {tags.slice(0, 2).join(" · ")}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Client component for the employee designs page.
 * Receives server-fetched designs and category tabs.
 * Provides category filtering and search mirroring the WholesalerGallery layout.
 */
export default function EmployeeDesignsClient({ designs, categoryTabs, businessName }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const filteredDesigns = useMemo(() => {
    let result = designs;

    // Category filter
    if (activeCategory !== "all") {
      result = result.filter(
        (d) => (d.category || "uncategorized").toLowerCase() === activeCategory
      );
    }

    // Search filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((d) => {
        const searchable = [
          d.title,
          d.category,
          ...(Array.isArray(d.tags) ? d.tags : []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return searchable.includes(q);
      });
    }

    return result;
  }, [designs, activeCategory, search]);

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400 font-semibold">
            {businessName}
          </p>
          <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight">
            Designer Collection ({designs.length})
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
            placeholder="Search designs..."
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

      {/* Grid */}
      {filteredDesigns.length === 0 ? (
        <div className="rounded-[16px] border border-dashed border-gray-200 bg-gray-50 px-6 py-16 text-center">
          <p className="text-[14px] font-semibold text-gray-500">No designs found.</p>
          <p className="text-[12px] text-gray-400 mt-2">
            {search.trim() 
              ? "Try adjusting your search or category filter." 
              : "Your store admin has not uploaded any designs yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-x-6 gap-y-12">
          {filteredDesigns.map((design) => (
            <DesignCard 
              key={design.id} 
              design={design} 
              onClick={() => setSelectedProduct(design)}
            />
          ))}
        </div>
      )}

      {/* Product Detail Modal */}
      <ProductInfoModal 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
        product={selectedProduct} 
      />
    </div>
  );
}
