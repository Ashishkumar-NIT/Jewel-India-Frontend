"use client";

import { useMemo, useState } from "react";

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function DesignCard({ design }) {
  const [imgError, setImgError] = useState(false);
  const title = design.title || "Untitled design";
  const category = design.category || "Uncategorized";
  const tags = Array.isArray(design.tags) ? design.tags : [];
  return (
    <article className="group flex flex-col rounded-[16px] border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative aspect-square w-full bg-gray-50 overflow-hidden">
        {!imgError && design.image_url ? (
          <img
            src={design.image_url}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[12px] text-gray-400">
            No image
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="rounded-full bg-black/70 px-3 py-1 text-[10px] uppercase tracking-widest text-white">
            {category}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2 px-4 py-4">
        <div>
          <h3 className="text-[14px] font-bold text-[#111827] leading-snug line-clamp-2">
            {title}
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {formatDate(design.created_at)}
          </p>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-semibold text-gray-500">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

/**
 * Client component for the employee designs page.
 * Receives server-fetched designs and category tabs.
 * Provides category filtering (read-only — no archive/delete controls).
 */
export default function EmployeeDesignsClient({ designs, categoryTabs, businessName }) {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredDesigns = useMemo(() => {
    if (activeCategory === "all") return designs;
    return designs.filter(
      (d) => (d.category || "uncategorized").toLowerCase() === activeCategory
    );
  }, [designs, activeCategory]);

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-6">
      {/* Header */}
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400 font-semibold">
          {businessName}
        </p>
        <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight">
          Our Designs ({designs.length})
        </h1>
      </div>

      {/* Category filters */}
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
          <p className="text-[14px] font-semibold text-gray-500">No designs in this category.</p>
          <p className="text-[12px] text-gray-400 mt-2">
            Your store admin can upload designs from the retailer dashboard.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDesigns.map((design) => (
            <DesignCard key={design.id} design={design} />
          ))}
        </div>
      )}
    </div>
  );
}
