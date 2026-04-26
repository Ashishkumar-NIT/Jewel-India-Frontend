"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { DesignUploadModal } from "../../../../components/retailer/DesignUploadModal";
import { RetailerCatalogueGrid } from "../../../../components/retailer/RetailerCatalogueGrid";
import { categories as baseCategories } from "../../../../lib/config/catalogueCategories";

export default function RetailerCataloguePage() {
  const [designs, setDesigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDesigns = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const queryParams = new URLSearchParams();
      if (showArchived) queryParams.set("archived", "true");

      const response = await fetch(`/api/designs/list?${queryParams.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to load designs.");
      }

      setDesigns(result.data || []);
    } catch (err) {
      setError(err.message || "Failed to load designs.");
      setDesigns([]);
    }

    setIsLoading(false);
  }, [showArchived]);

  useEffect(() => {
    fetchDesigns();
  }, [fetchDesigns]);

  const categoryTabs = useMemo(() => {
    const fromDesigns = designs
      .map((design) => design.category)
      .filter(Boolean)
      .map((value) => value.trim());

    const merged = [
      "All",
      ...baseCategories.map((item) => item.name),
      ...fromDesigns,
    ];

    const seen = new Set();
    return merged.filter((value) => {
      const key = value.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [designs]);

  const filteredDesigns = useMemo(() => {
    const categoryKey = activeCategory.toLowerCase();
    return designs.filter((design) => {
      if (!showArchived && design.is_archived) return false;
      if (categoryKey === "all") return true;
      return (design.category || "uncategorized").toLowerCase() === categoryKey;
    });
  }, [designs, activeCategory, showArchived]);

  const totals = useMemo(() => {
    const total = designs.length;
    const active = designs.filter((design) => !design.is_archived).length;
    const archived = total - active;
    return { total, active, archived };
  }, [designs]);

  const handleUploadComplete = (newDesign) => {
    if (!newDesign) return;
    setDesigns((prev) => [newDesign, ...prev]);
  };

  const handleArchiveToggle = async (design) => {
    const nextValue = !design.is_archived;

    // Optimistic update
    setDesigns((prev) =>
      prev.map((item) =>
        item.id === design.id ? { ...item, is_archived: nextValue } : item
      )
    );

    const response = await fetch(`/api/designs/${design.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_archived: nextValue }),
    });

    if (!response.ok) {
      // Revert on failure
      setDesigns((prev) =>
        prev.map((item) =>
          item.id === design.id ? { ...item, is_archived: design.is_archived } : item
        )
      );
    }
  };

  const handleDelete = async (design) => {
    const confirmed = window.confirm("Delete this design permanently? This cannot be undone.");
    if (!confirmed) return;

    // Optimistic removal
    setDesigns((prev) => prev.filter((item) => item.id !== design.id));

    const response = await fetch(`/api/designs/${design.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      // Re-fetch if delete failed
      fetchDesigns();
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E5E7EB] bg-white px-4 md:px-10 py-4 shadow-sm">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400 font-semibold">Retailer Catalogue</p>
          <h1 className="text-[20px] font-extrabold text-[#111827]">
            Catalogue ({totals.active}/{totals.total})
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowArchived((prev) => !prev)}
            className={`rounded-[10px] border px-4 py-2 text-[12px] font-semibold transition-colors ${
              showArchived
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
            }`}
          >
            {showArchived ? "Showing All" : "Show Archived"}
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-[10px] bg-[#111827] px-4 py-2 text-[12px] font-bold text-white hover:bg-black transition-colors"
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Upload Design
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-10 py-10 flex flex-col gap-8">
        {/* Category filter tabs */}
        <div className="flex flex-wrap items-center gap-3">
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

        {/* Error display */}
        {error && (
          <div className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-600 font-medium flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={fetchDesigns}
              className="text-[11px] font-bold text-red-700 hover:underline ml-4"
            >
              Retry
            </button>
          </div>
        )}

        {/* Design grid */}
        <RetailerCatalogueGrid
          designs={filteredDesigns}
          isLoading={isLoading}
          onArchiveToggle={handleArchiveToggle}
          onDelete={handleDelete}
        />

        {/* Empty state hint when no archived designs */}
        {!isLoading && !showArchived && totals.archived > 0 && filteredDesigns.length === 0 && (
          <div className="text-center text-[13px] text-gray-400 py-4">
            {totals.archived} archived design{totals.archived !== 1 ? "s" : ""} hidden.{" "}
            <button
              onClick={() => setShowArchived(true)}
              className="text-gray-600 font-semibold hover:underline"
            >
              Show archived
            </button>
          </div>
        )}
      </main>

      <DesignUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
}
