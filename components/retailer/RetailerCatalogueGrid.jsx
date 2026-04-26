"use client";

import { useState } from "react";

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function TagChip({ label }) {
  return (
    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
      {label}
    </span>
  );
}

function DesignCard({ design, onArchiveToggle, onDelete }) {
  const [imgError, setImgError] = useState(false);
  const title = design.title || "Untitled design";
  const category = design.category || "Uncategorized";
  const tags = Array.isArray(design.tags) ? design.tags : [];
  const uploadedAt = formatDate(design.created_at);

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

        {design.is_archived && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
            <span className="rounded-full border border-gray-300 bg-white px-3 py-1 text-[11px] font-semibold text-gray-500">
              Archived
            </span>
          </div>
        )}

        <div className="absolute top-3 left-3">
          <span className="rounded-full bg-black/70 px-3 py-1 text-[10px] uppercase tracking-widest text-white">
            {category}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 px-4 py-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-[14px] font-bold text-[#111827] leading-snug line-clamp-2">
              {title}
            </h3>
            {uploadedAt && (
              <p className="text-[11px] text-gray-400">Uploaded {uploadedAt}</p>
            )}
          </div>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag) => (
              <TagChip key={tag} label={tag} />
            ))}
            {tags.length > 3 && <TagChip label={`+${tags.length - 3}`} />}
          </div>
        )}

        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            onClick={() => onArchiveToggle(design)}
            className={`rounded-[8px] px-3 py-2 text-[12px] font-semibold transition-colors ${
              design.is_archived
                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {design.is_archived ? "Restore" : "Archive"}
          </button>
          <button
            onClick={() => onDelete(design)}
            className="rounded-[8px] border border-gray-200 px-3 py-2 text-[12px] font-semibold text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

export function RetailerCatalogueGrid({ designs, isLoading, onArchiveToggle, onDelete }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="rounded-[16px] border border-gray-200 bg-white overflow-hidden shadow-sm animate-pulse">
            <div className="aspect-square bg-gray-100" />
            <div className="px-4 py-4 space-y-3">
              <div className="h-4 w-3/4 bg-gray-100 rounded" />
              <div className="h-3 w-1/2 bg-gray-100 rounded" />
              <div className="h-8 w-full bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!designs.length) {
    return (
      <div className="rounded-[16px] border border-dashed border-gray-200 bg-gray-50 px-6 py-16 text-center">
        <p className="text-[14px] font-semibold text-gray-500">No designs yet.</p>
        <p className="text-[12px] text-gray-400 mt-2">Upload your first design to build your catalogue.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {designs.map((design) => (
        <DesignCard
          key={design.id}
          design={design}
          onArchiveToggle={onArchiveToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
