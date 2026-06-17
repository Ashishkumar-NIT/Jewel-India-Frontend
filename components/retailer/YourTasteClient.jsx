"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import Image from "next/image";

const ProductInfoModal = dynamic(
  () => import("../employee/ProductInfoModal").then((mod) => mod.ProductInfoModal),
  { loading: () => null }
);

function formatWeight(val) {
  if (!val && val !== 0) return null;
  return `${Number(val).toFixed(2)}g`;
}

function ProductCard({ product, isSelected, onToggle, onClick }) {
  const [imgError, setImgError] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const imageUrl = product.processed_image_url || 
                   (product.generated_image_urls && product.generated_image_urls.length > 0 ? product.generated_image_urls[0] : null) || 
                   product.raw_image_url;
  const title = product.title || product.jewellery_type || "Untitled";

  const handleToggle = async (e) => {
    e.stopPropagation();
    if (isUpdating) return;
    setIsUpdating(true);
    await onToggle(product.id, !isSelected);
    setIsUpdating(false);
  };

  return (
    <article 
      className="group flex flex-col bg-transparent overflow-hidden cursor-pointer"
      onClick={() => onClick && onClick(product)}
    >
      {/* Image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-[16px] bg-[#F9F9F9]">
        {!imgError && imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="h-full w-full object-cover mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[12px] text-gray-400">
            No image
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col pt-3 border-t border-[#111] mt-4">
        <h3 className="text-[13px] font-bold text-[#111827] leading-snug line-clamp-1 mb-1">
          {title}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#6B7280]">
            {formatWeight(product.net_weight) || "20g"}
          </span>
          
          {/* Toggle */}
          <div 
            onClick={handleToggle}
            className="w-11 h-11 flex items-center justify-end cursor-pointer -my-3 md:my-0 md:w-auto md:h-auto"
          >
            <button
              disabled={isUpdating}
              tabIndex={-1}
              className="pointer-events-none relative w-9 h-5 rounded-full transition-colors duration-300 ease-in-out focus:outline-none disabled:opacity-50 border-none cursor-pointer bg-[#E5E5EA] data-[selected=true]:bg-[#22C55E]"
              data-selected={isSelected}
            >
              <span className={`absolute top-[2px] left-[2px] bg-white w-4 h-4 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.2)] transition-transform duration-300 ease-in-out ${isSelected ? 'translate-x-[16px]' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function YourTasteClient({ products, selectedProductIds, categoryTabs }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [filterState, setFilterState] = useState("all"); // "all", "selected", "unselected"
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  
  // Local optimistic state for selections
  const [selections, setSelections] = useState(() => new Set(selectedProductIds));

  const handleToggleSelection = async (productId, isSelected) => {
    setSelections(prev => {
      const newSet = new Set(prev);
      if (isSelected) newSet.add(productId);
      else newSet.delete(productId);
      return newSet;
    });

    try {
      const res = await fetch("/api/retailer/your-taste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, selected: isSelected })
      });
      if (!res.ok) throw new Error("Failed");
    } catch (err) {
      setSelections(prev => {
        const newSet = new Set(prev);
        if (isSelected) newSet.delete(productId);
        else newSet.add(productId);
        return newSet;
      });
    }
  };

  // filteredProducts computed first so handleBulkToggle can reference it
  const filteredProducts = useMemo(() => {
    let result = products;

    if (activeCategory !== "all") {
      result = result.filter(p => {
        const title = (p.title || "").toLowerCase();
        const type = (p.jewellery_type || "").toLowerCase();
        const cat = (p.category || "").toLowerCase();
        const style = (p.style || "").toLowerCase();
        
        const baseActive = activeCategory.toLowerCase().replace(/s$/, ''); // necklace, pendant, etc.
        
        const fields = [title, type, cat, style];
        const isMatch = fields.some(f => f.includes(baseActive) || f.replace(/s$/, '') === baseActive);
        
        if (baseActive === "mangalsutra") {
          return isMatch || fields.some(f => f.includes("mangal"));
        }
        
        return isMatch;
      });
    }

    if (filterState === "selected") {
      result = result.filter(p => selections.has(p.id));
    } else if (filterState === "unselected") {
      result = result.filter(p => !selections.has(p.id));
    }

    return result;
  }, [products, activeCategory, filterState, selections]);

  // Bulk select/deselect the CURRENTLY visible (filtered) products
  const handleBulkToggle = async (selectAll) => {
    setIsBulkUpdating(true);
    const targets = filteredProducts.map(p => p.id);
    if (targets.length === 0) { setIsBulkUpdating(false); return; }

    setSelections(prev => {
      const newSet = new Set(prev);
      targets.forEach(id => selectAll ? newSet.add(id) : newSet.delete(id));
      return newSet;
    });

    try {
      await Promise.all(
        targets.map(id =>
          fetch("/api/retailer/your-taste", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ product_id: id, selected: selectAll }),
          })
        )
      );
    } catch (err) {
      setSelections(prev => {
        const newSet = new Set(prev);
        targets.forEach(id => selectAll ? newSet.delete(id) : newSet.add(id));
        return newSet;
      });
    } finally {
      setIsBulkUpdating(false);
    }
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-[clamp(24px,3vw,28px)] font-extrabold text-[#111827] tracking-tight mb-1">
          Your Taste
        </h1>
        <p className="text-[14px] text-[#6B7280]">
          Let&apos;s curate the product which justifies your store and your taste
        </p>
      </div>

      {/* Main Box Area */}
      <div className="flex flex-col gap-8 relative mt-2">
        
        {/* Categories Row */}
        <div className="flex flex-wrap gap-3 md:gap-4 justify-start pb-6 pt-4 px-2">
          {categoryTabs.map((tab) => {
            const isActive = activeCategory === tab.slug;
            return (
              <button
                key={tab.slug}
                onClick={() => setActiveCategory(tab.slug === activeCategory ? "all" : tab.slug)}
                className="flex flex-col items-center gap-3 group outline-none w-[calc(33.33%-8px)] sm:w-auto"
              >
                <div 
                  className={`w-[65px] h-[65px] md:w-[75px] md:h-[75px] rounded-[16px] overflow-hidden transition-all duration-300 bg-[#F9F9F9] relative shadow-sm ${isActive ? 'scale-110 ring-2 ring-black ring-offset-4 z-10' : 'hover:scale-105'}`}
                  style={isActive ? { transform: 'scale(1.1)' } : {}}
                >
                  {tab.image ? (
                    <Image 
                      src={tab.image} 
                      alt={tab.name} 
                      width={75} 
                      height={75} 
                      className="w-full h-full object-contain block" 
                    />
                  ) : (
                    <div className="w-full h-full bg-[#F9F9F9] flex items-center justify-center text-[#111827] text-xs font-bold">
                      {tab.name.charAt(0)}
                    </div>
                  )}
                </div>
                <span className={`text-[13px] text-center transition-colors ${isActive ? 'text-[#111827] font-extrabold' : 'text-[#9CA3AF] font-bold group-hover:text-[#6B7280]'}`}>
                  {tab.name}
                </span>
              </button>
            );
          })}
          
          <button 
            onClick={() => setActiveCategory("all")}
            className="flex items-center gap-2 ml-2 text-[#111827] font-bold text-[14px] hover:underline w-[calc(33.33%-8px)] sm:w-auto justify-center sm:justify-start"
          >
            View All <span className="text-xl leading-none">→</span>
          </button>
        </div>

        {/* Filters + Bulk Actions bar */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          {/* Left: view-filter chips */}
          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={() => setFilterState(filterState === "selected" ? "all" : "selected")}
              className={`flex items-center gap-1.5 px-4 h-11 md:h-auto py-0 md:py-2 rounded-full text-[12px] font-bold tracking-wide transition-colors ${filterState === "selected" ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Already selected
              {filterState === "selected" && <span className="text-[14px] ml-1 leading-none font-normal">×</span>}
            </button>
            <button
              onClick={() => setFilterState(filterState === "unselected" ? "all" : "unselected")}
              className={`flex items-center gap-1.5 px-4 h-11 md:h-auto py-0 md:py-2 rounded-full text-[12px] font-bold tracking-wide transition-colors ${filterState === "unselected" ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Show Unselected
              {filterState === "unselected" && <span className="text-[14px] ml-1 leading-none font-normal">×</span>}
            </button>
          </div>

          {/* Right: bulk action buttons */}
          <div className="flex gap-2 items-center">
            <button
              onClick={() => handleBulkToggle(true)}
              disabled={isBulkUpdating || filteredProducts.length === 0}
              className="flex items-center gap-2 px-4 h-11 md:h-auto py-0 md:py-2 rounded-full text-[12px] font-bold tracking-wide bg-[#22C55E] text-white hover:bg-[#16a34a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isBulkUpdating ? (
                <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              )}
              Publish All
            </button>
            <button
              onClick={() => handleBulkToggle(false)}
              disabled={isBulkUpdating || filteredProducts.length === 0}
              className="flex items-center gap-2 px-4 h-11 md:h-auto py-0 md:py-2 rounded-full text-[12px] font-bold tracking-wide bg-gray-800 text-white hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isBulkUpdating ? (
                <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              )}
              Unpublish All
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12 mt-4">
          {filteredProducts.map((p) => (
            <ProductCard 
              key={p.id} 
              product={p} 
              isSelected={selections.has(p.id)}
              onToggle={handleToggleSelection}
              onClick={(prod) => setSelectedProduct(prod)}
            />
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-20 text-center text-[#6B7280]">
              <p className="text-lg font-medium">No products found matching the criteria.</p>
              <p className="text-sm mt-1">Try selecting a different category or clearing filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Product Detail Modal */}
      <ProductInfoModal 
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        product={selectedProduct}
      />
    </div>
  );
}
