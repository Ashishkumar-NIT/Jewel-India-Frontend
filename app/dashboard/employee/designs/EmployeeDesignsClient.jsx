"use client";

import { useMemo, useState, useEffect } from "react";
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

function FilterDropdown({ label, options, selected, onChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (opt) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((o) => o !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 justify-center rounded-full border border-gray-200 px-4 py-2 bg-white text-[12px] font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors"
      >
        {label}
        {selected.length > 0 && (
          <span className="bg-black text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
            {selected.length}
          </span>
        )}
        <svg className="-mr-1 ml-1 h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="origin-top-left absolute left-0 mt-2 w-48 rounded-[12px] shadow-xl bg-white ring-1 ring-black ring-opacity-5 z-20 overflow-hidden">
            <div className="py-2" role="menu">
              {options.map((opt) => (
                <label key={opt} className="flex items-center px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mr-3 h-4 w-4 rounded-[4px] border-gray-300 text-black focus:ring-black cursor-pointer"
                    checked={selected.includes(opt)}
                    onChange={() => toggleOption(opt)}
                  />
                  <span className="capitalize">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}
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
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Scroll visibility state
  const [showFilters, setShowFilters] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 150) {
        setShowFilters(false); // Hide on scroll down
      } else {
        setShowFilters(true);  // Show on scroll up
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const [filters, setFilters] = useState({
    size: [],
    weight: [],
    availability: [],
    purity: [],
  });

  const FILTER_OPTIONS = {
    size: ["small", "medium", "large", "adjustable"],
    weight: ["0-2g", "3-5g", "5-10g", "11-20g", "20-30g", "30g+"],
    availability: ["in stock", "within 5 days", "within 15 days", "within 30 days", "more than 30 days"],
    purity: ["18k", "22k", "24k"],
  };

  const filteredDesigns = useMemo(() => {
    let result = designs;

    // Category filter
    if (activeCategory !== "all") {
      result = result.filter((d) => {
        const catMatch = (d.category || "uncategorized").toLowerCase() === activeCategory;
        const tags = Array.isArray(d.tags) ? d.tags.map(t => t.toLowerCase()) : [];
        const tagMatch = tags.includes(activeCategory);
        return catMatch || tagMatch;
      });
    }

    // --- Multi-select Filters ---

    // Size
    if (filters.size.length > 0) {
      result = result.filter((d) => {
        const sizeFieldMatch = d.size && filters.size.includes(d.size.toLowerCase());
        const tags = Array.isArray(d.tags) ? d.tags.map(t => t.toLowerCase()) : [];
        const tagMatch = filters.size.some(s => tags.includes(s));
        return sizeFieldMatch || tagMatch;
      });
    }

    // Purity
    if (filters.purity.length > 0) {
      result = result.filter((d) => {
        const purityFieldMatch = d.purity && filters.purity.includes(d.purity.toLowerCase());
        const tags = Array.isArray(d.tags) ? d.tags.map(t => t.toLowerCase()) : [];
        const tagMatch = filters.purity.some(p => tags.includes(p));
        return purityFieldMatch || tagMatch;
      });
    }

    // Weight
    if (filters.weight.length > 0) {
      result = result.filter((d) => {
        const w = Number(d.net_weight);
        if (isNaN(w) || w <= 0) return false;
        
        return filters.weight.some((range) => {
          if (range === "0-2g") return w <= 2;
          if (range === "3-5g") return w > 2 && w <= 5;
          if (range === "5-10g") return w > 5 && w <= 10;
          if (range === "11-20g") return w > 10 && w <= 20;
          if (range === "20-30g") return w > 20 && w <= 30;
          if (range === "30g+") return w > 30;
          return false;
        });
      });
    }

    // Availability
    if (filters.availability.length > 0) {
      result = result.filter((d) => {
        return filters.availability.some((avail) => {
          if (avail === "in stock") return d.is_in_stock === true;
          
          if (d.is_in_stock) return false; // If in stock, it doesn't match the "within X days" rules
          
          const days = Number(d.production_time_days);
          if (isNaN(days)) return false;

          if (avail === "within 5 days") return days <= 5;
          if (avail === "within 15 days") return days > 5 && days <= 15;
          if (avail === "within 30 days") return days > 15 && days <= 30;
          if (avail === "more than 30 days") return days > 30;
          return false;
        });
      });
    }

    return result;
  }, [designs, activeCategory, filters]);

  const updateFilter = (filterKey, selectedList) => {
    setFilters((prev) => ({ ...prev, [filterKey]: selectedList }));
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-white">
      
      {/* Smart Sticky Header containing Title, Categories, and Filters */}
      <div 
        className={`sticky z-40 bg-white/95 backdrop-blur-sm transition-transform duration-300 w-full pt-8 pb-4 border-b border-gray-100 ${
          showFilters ? "translate-y-0 top-0" : "-translate-y-full top-0"
        }`}
      >
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 flex flex-col gap-6">
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
          </div>

          {/* Categories & Filters Container */}
          <div className="flex flex-col gap-4">
            
            {/* Category tabs (Top row) */}
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

            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <FilterDropdown
                label="Size"
                options={FILTER_OPTIONS.size}
                selected={filters.size}
                onChange={(selected) => updateFilter("size", selected)}
              />
              <FilterDropdown
                label="Weight"
                options={FILTER_OPTIONS.weight}
                selected={filters.weight}
                onChange={(selected) => updateFilter("weight", selected)}
              />
              <FilterDropdown
                label="Availability"
                options={FILTER_OPTIONS.availability}
                selected={filters.availability}
                onChange={(selected) => updateFilter("availability", selected)}
              />
              <FilterDropdown
                label="Purity"
                options={FILTER_OPTIONS.purity}
                selected={filters.purity}
                onChange={(selected) => updateFilter("purity", selected)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8">

      {/* Grid */}
      {filteredDesigns.length === 0 ? (
        <div className="rounded-[16px] border border-dashed border-gray-200 bg-gray-50 px-6 py-16 text-center">
          <p className="text-[14px] font-semibold text-gray-500">No designs found.</p>
          <p className="text-[12px] text-gray-400 mt-2">
            Try adjusting your category or feature filters.
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
    </div>
  );
}
