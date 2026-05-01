"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import CatalogueGrid from "./CatalogueGrid";
import { createClient } from "../../../lib/supabase/client";

const LIMIT = 20;

// Module-level cache that persists across navigation (survives component unmount)
const productsCache = {
  data: null,
  count: 0,
  category: "all",
  filters: { trending: [], size: [], weight: [], availability: [], purity: [] },
  page: 1
};

const FILTER_CONFIG = [
  { 
    id: "trending", 
    label: "Trending", 
    options: ["Most saved", "Most Liked", "Most viewed"] 
  },
  { 
    id: "size", 
    label: "Size", 
    options: ["XS", "S", "M", "L", "XL", "Free Size"] 
  },
  { 
    id: "weight", 
    label: "Weight", 
    options: ["0-2 g", "2-4 g", "4-6 g", "6-10 g", "10-20 g", "20-35 g", "35-50 g", "50-75 g", "75-100 g", "100+ g"] 
  },
  { 
    id: "availability", 
    label: "Availability", 
    options: ["In stock", "Within 5 days", "Within 15 days", "Within 30 days", "More than 30 days"] 
  },
  { 
    id: "purity", 
    label: "Purity", 
    options: ["24K (999)", "22K (916)", "18K (750)", "14K (585)", "925 Silver", "950 Platinum"] 
  }
];

export default function CatalogueClient({
  initialProducts,
  initialCount,
  initialCategory,
  dynamicCategories,
  wholesalerId,
  userEmail,
  artisanName
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [activeCategory, setActiveCategory] = useState(() => {
    // Restore from cache if available, otherwise use initial
    return productsCache.category !== "all" ? productsCache.category : (initialCategory || "all");
  });
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  const [filters, setFilters] = useState(() => {
    // Restore from cache if we have cached filters
    const hasCachedFilters = productsCache.filters &&
      Object.values(productsCache.filters).some(arr => arr.length > 0);
    return hasCachedFilters ? productsCache.filters : {
      trending: [],
      size: [],
      weight: [],
      availability: [],
      purity: []
    };
  });

  const [products, setProducts] = useState(() => {
    // Restore from cache if we have cached data for current category
    if (productsCache.data && productsCache.category === (initialCategory || "all")) {
      return productsCache.data;
    }
    return initialProducts || [];
  });
  const [totalCount, setTotalCount] = useState(() => {
    // Restore from cache if we have cached count for current category
    if (productsCache.count && productsCache.category === (initialCategory || "all")) {
      return productsCache.count;
    }
    return initialCount || 0;
  });
  const [page, setPage] = useState(() => {
    // Restore from cache if we have cached page for current category
    return productsCache.category === (initialCategory || "all") ? productsCache.page : 1;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const totalPages = Math.max(1, Math.ceil(totalCount / LIMIT));

  // Handle outside click for dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch logic
  // Uses window.history.replaceState instead of router.replace() to update
  // the URL without triggering Next.js route transitions (avoids server re-render loop).
  const fetchProducts = useCallback(async (cat, p, f, skipLoading = false) => {
    if (!skipLoading) setIsLoading(true);
    setIsError(false);

    try {
      const params = new URLSearchParams();
      if (cat && cat !== "all") params.set("category", cat);
      params.set("page", String(p));
      params.set("limit", String(LIMIT));

      if (f.size.length) f.size.forEach(v => params.append("size[]", v));
      if (f.weight.length) f.weight.forEach(v => params.append("weight[]", v));
      if (f.availability.length) f.availability.forEach(v => params.append("availability[]", v));
      if (f.purity.length) f.purity.forEach(v => params.append("purity[]", v));

      const res = await fetch(`/api/catalogue/products?${params.toString()}`);
      if (!res.ok) throw new Error("Fetch failed");

      const json = await res.json();
      const newData = json.data || [];
      const newCount = json.count || 0;

      // Update state
      setProducts(newData);
      setTotalCount(newCount);

      // Update module-level cache (persists across navigation)
      productsCache.data = newData;
      productsCache.count = newCount;
      productsCache.category = cat || "all";
      productsCache.filters = { ...f };
      productsCache.page = p;

      // Update URL via History API — no Next.js router involvement,
      // so no server component re-execution on every filter/page change.
      window.history.replaceState({}, "", `?${params.toString()}`);

    } catch (err) {
      console.error(err);
      setIsError(true);
    } finally {
      if (!skipLoading) setIsLoading(false);
    }
  }, []);

  // When filters or page or activeCategory change, trigger fetch
  useEffect(() => {
    // Skip fetch if we have cached data for current state
    const hasCachedData = productsCache.data &&
      productsCache.category === activeCategory &&
      productsCache.page === page &&
      JSON.stringify(productsCache.filters) === JSON.stringify(filters);

    // Only fetch if we don't have cached data or if data is empty
    if (!hasCachedData || products.length === 0) {
      fetchProducts(activeCategory, page, filters);
    }
  }, [page, filters, activeCategory]); // eslint-disable-line

  // Sign out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/signin"); // or "/"
  };

  // Category Row interactions
  const handleCategoryClick = (slug) => {
    const newCat = (activeCategory === slug) ? "all" : slug;
    
    // Reset all filters and set page 1
    setActiveCategory(newCat);
    setFilters({ trending: [], size: [], weight: [], availability: [], purity: [] });
    setPage(1);
    setOpenDropdown(null);

    // Scroll to grid (using basic auto scroll next frame)
    setTimeout(() => {
      document.getElementById("product-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  // Filter Checks
  const toggleFilter = (filterId, option) => {
    setFilters(prev => {
      const current = prev[filterId];
      if (current.includes(option)) {
        return { ...prev, [filterId]: current.filter(o => o !== option) };
      } else {
        return { ...prev, [filterId]: [...current, option] };
      }
    });
    // The useEffect will catch this and trigger fetch (page stays the same per prompt)
  };

  const clearFilter = (filterId, e) => {
    e.stopPropagation();
    setFilters(prev => ({ ...prev, [filterId]: [] }));
  };

  const handlePageChange = (newPage) => {
     if (newPage === page || newPage < 1 || newPage > totalPages) return;
     setPage(newPage);
     window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getActiveCatName = () => {
    if (activeCategory === "all") return "All Categories";
    const match = dynamicCategories?.find(c => c.slug === activeCategory);
    return match ? match.name : activeCategory;
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9]">


      {/* ── Page Content ── */}
      <main className="max-w-[1280px] mx-auto px-6 pb-24">
        
        {/* Heading Section */}
        <section className="mt-[32px] mb-[28px]">
          <h1 className="text-[32px] font-bold text-[#111] mb-[8px]">My Catalogue</h1>
          <p className="text-[15px] text-[#666]">See and manage all your catalogue categories from one place.</p>
        </section>

        {/* ── Category Row ── */}
        <div className="relative mb-[28px] flex items-center pr-24">
          <div className="flex items-center gap-6 overflow-x-auto whitespace-nowrap scroll-smooth pb-4 pt-2 px-2 custom-scrollbar">
            {dynamicCategories?.map((cat) => {
              const isActive = activeCategory === cat.slug;
              return (
                <button
                  key={cat.slug}
                  onClick={() => handleCategoryClick(cat.slug)}
                  className="flex flex-col items-center gap-2 group outline-none shrink-0"
                >
                  <div 
                    className={`w-[90px] h-[90px] rounded-[10px] overflow-hidden transition-all duration-300 ease-out ${isActive ? "scale-115 border-[2px] border-[#111] shadow-md" : "hover:shadow-sm"}`}
                    style={isActive ? { transform: 'scale(1.15)' } : {}}
                  >
                    {cat.image ? (
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        width={90}
                        height={90}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center text-white text-xl font-bold">
                        {cat.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {/* The label space is maintained, but visually pushed if scale applies. We handle spacing via gap. */}
                  <span 
                    className="text-[12px] text-[#666] text-center w-[90px] truncate"
                    style={isActive ? { marginTop: '8px', color: '#111', fontWeight: 600 } : {}}
                  >
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
          {/* View All Button fixed at end visually */}
          <button 
            onClick={() => handleCategoryClick("all")}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-[14px] text-[#111] hover:text-[#000] underline underline-offset-4 decoration-[#111] bg-gradient-to-l from-[#f9f9f9] via-[#f9f9f9] to-transparent pl-8 py-8"
          >
            View All &#8594;
          </button>
        </div>

        {/* ── Filter Bar ── */}
        <div id="product-grid" className="flex flex-wrap items-center gap-3 pb-6 pt-2 mb-2 relative" ref={dropdownRef}>
          {FILTER_CONFIG.map(fc => {
            const activeOptions = filters[fc.id];
            const isActive = activeOptions.length > 0;
            const isOpen = openDropdown === fc.id;

            let pillLabel = fc.label;
            if (isActive) {
              if (activeOptions.length === 1) {
                // Label: "1 ×" instead of "Size" if single selection for Size? 
                // Wait, prompt says: "Label: 'Weight ×' for 1 selection. Active pill (2+): Label: 'Weight · 3 ×'".
                // Oh I see, just "Feature ×" or "Feature · N ×".
                pillLabel = `${fc.label}`;
              } else {
                pillLabel = `${fc.label} · ${activeOptions.length}`;
              }
            }

            return (
              <div key={fc.id} className="relative inline-block">
                <button
                  onClick={() => setOpenDropdown(isOpen ? null : fc.id)}
                  className={`flex items-center justify-between gap-2 px-[18px] py-[10px] rounded-full border text-[14px] font-medium transition-colors ${
                    isActive || isOpen
                      ? "bg-[#111] text-white border-[#111]"
                      : "bg-white text-[#333] border-[#ddd] hover:bg-[#f2f2f2]"
                  }`}
                >
                  <span>{pillLabel}</span>
                  {isActive ? (
                    <span 
                      onClick={(e) => clearFilter(fc.id, e)} 
                      className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                      aria-label="Clear filter"
                    >
                      ×
                    </span>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  )}
                </button>

                {/* Dropdown panel */}
                {isOpen && (
                  <div className="absolute top-[calc(100%+8px)] left-0 min-w-[260px] bg-white rounded-[14px] shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-[#eee] z-50 overflow-hidden flex flex-col">
                    <div className="px-5 py-4 border-b border-[#eee]">
                      <span className="text-[14px] text-[#999]">{fc.label}</span>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {fc.options.map(opt => {
                        const checked = activeOptions.includes(opt);
                        return (
                          <label key={opt} className="flex items-center justify-between px-5 py-4 hover:bg-[#f9f9f9] cursor-pointer group transition-colors">
                            <span className="text-[16px] text-[#111] select-none">{opt}</span>
                            <div className={`w-6 h-6 rounded-[6px] border flex items-center justify-center transition-colors ${checked ? "bg-[#111] border-[#111]" : "border-[#ddd] group-hover:border-[#999] bg-white"}`}>
                              {checked && (
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              )}
                            </div>
                            {/* Hidden actual checkbox */}
                            <input 
                              type="checkbox" 
                              className="hidden" 
                              checked={checked}
                              onChange={() => toggleFilter(fc.id, opt)}
                            />
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Product Grid ── */}
        <CatalogueGrid 
          products={products}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => fetchProducts(activeCategory, page, filters)}
          activeCategory={getActiveCatName()}
          artisanName={artisanName}
        />

        {/* ── Pagination ── */}
        {!isLoading && !isError && totalPages > 1 && products.length > 0 && (
          <div className="mt-[48px] flex items-center justify-center gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="text-[#666] hover:text-[#111] disabled:opacity-30 disabled:cursor-not-allowed px-3 py-2 text-[14px] font-medium transition-colors"
            >
              &#8592; Previous
            </button>

            <div className="flex items-center gap-1 mx-4">
              {Array.from({ length: totalPages }).map((_, i) => {
                const n = i + 1;
                // Show up to 5 page numbers strategy: 
                // Always show 1, last, and +/- 1 around current.
                const show = n === 1 || n === totalPages || Math.abs(n - page) <= 1;
                const isEllipsis = !show && (n === 2 || n === totalPages - 1);
                
                if (isEllipsis) return <span key={n} className="text-[#999] px-2">...</span>;
                if (!show) return null;

                return (
                  <button
                    key={n}
                    onClick={() => handlePageChange(n)}
                    className={`w-8 h-8 flex items-center justify-center text-[14px] font-medium rounded-full transition-all ${
                      page === n
                        ? "bg-[#111] text-white"
                        : "text-[#666] hover:bg-[#eee]"
                    }`}
                  >
                    {n}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="text-[#666] hover:text-[#111] disabled:opacity-30 disabled:cursor-not-allowed px-3 py-2 text-[14px] font-medium transition-colors"
            >
              Next &#8594;
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
