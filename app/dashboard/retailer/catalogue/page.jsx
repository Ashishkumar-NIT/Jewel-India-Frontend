"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { RetailerCatalogueGrid } from "../../../../components/retailer/RetailerCatalogueGrid";

const designsCache = {
  data: [],
  timestamp: 0
};
export default function RetailerCataloguePage() {
  const [designs, setDesigns] = useState(() => designsCache.data || []);
  const [isLoading, setIsLoading] = useState(designsCache.data.length === 0);
  const [error, setError] = useState("");

  // AbortController ref for cancelling in-flight requests
  const abortRef = useRef(null);

  const fetchDesigns = useCallback(async (force = false) => {
    // Cancel any in-flight request before starting a new one
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    // Skip if we have cached data and this isn't a forced refresh
    if (!force && designsCache.data.length > 0) {
      setDesigns(designsCache.data);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/designs/list?archived=true`, {
        signal: controller.signal,
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to load designs.");
      }

      // Update both state and module-level cache
      designsCache.data = result.data || [];
      designsCache.timestamp = Date.now();
      setDesigns(designsCache.data);
    } catch (err) {
      if (err.name === "AbortError") return; // Ignore cancelled requests
      setError(err.message || "Failed to load designs.");
      setDesigns([]);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchDesigns();
  }, [fetchDesigns]);

  const totals = useMemo(() => {
    return { total: designs.length };
  }, [designs]);

  const handleArchiveToggle = async (design) => {
    const nextValue = !design.is_archived;

    // Optimistic update against the cached array
    designsCache.data = designsCache.data.map((item) =>
      item.id === design.id ? { ...item, is_archived: nextValue } : item
    );
    setDesigns(designsCache.data);

    const response = await fetch(`/api/designs/${design.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_archived: nextValue }),
    });

    if (!response.ok) {
      // Revert on failure
      designsCache.data = designsCache.data.map((item) =>
        item.id === design.id ? { ...item, is_archived: design.is_archived } : item
      );
      setDesigns(designsCache.data);
    }
  };

  const handleDelete = async (design) => {
    const confirmed = window.confirm("Delete this design permanently? This cannot be undone.");
    if (!confirmed) return;

    designsCache.data = designsCache.data.filter((item) => item.id !== design.id);
    setDesigns(designsCache.data);

    const response = await fetch(`/api/designs/${design.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      fetchDesigns(true); // Re-fetch on failure to restore correct state
    }
  };

  return (
    <div className="flex flex-col min-h-screen relative bg-[#FAFAFA]">
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-10 py-10 flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-[clamp(28px,3vw,32px)] font-extrabold text-[#111827] tracking-tight">
              Catalogue ({totals.total}/50*)
            </h1>
            <p className="text-[14px] text-[#6B7280]">
              Welcome back! look what all you have to offer
            </p>
            <p className="text-[12px] text-[#9CA3AF] mt-1">
              *50 design upload limit on your current plan
            </p>
          </div>
          
          <Link
            href="/dashboard/retailer/catalogue/upload"
            className="flex items-center justify-center gap-2 bg-[#111827] text-white font-bold rounded-[10px] px-6 py-3 hover:bg-black transition-colors w-fit h-[48px]"
          >
            <Image 
              src="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777306236/retailerProfile_UPLOADblack_tvem8p.svg" 
              alt="Upload" 
              width={16} 
              height={16} 
              loading="lazy"
              className="invert brightness-0"
            />
            <span className="text-[14px]">Upload Design</span>
          </Link>
        </div>

        {/* Error display */}
        {error && (
          <div className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-600 font-medium flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => fetchDesigns(true)}
              className="text-[11px] font-bold text-red-700 hover:underline ml-4"
            >
              Retry
            </button>
          </div>
        )}

        {/* Design grid */}
        <RetailerCatalogueGrid
          designs={designs}
          isLoading={isLoading}
          onArchiveToggle={handleArchiveToggle}
          onDelete={handleDelete}
        />

      </main>
    </div>
  );
}
