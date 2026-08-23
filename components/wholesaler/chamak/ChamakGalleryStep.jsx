"use client";

function StatusBadge({ status }) {
  switch (status) {
    case "completed":
    case "done":
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
          <span>✓</span> Complete
        </span>
      );
    case "analyzing":
    case "generating":
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1 animate-pulse">
          <span>⏳</span> In Progress
        </span>
      );
    case "awaiting_input":
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 flex items-center gap-1">
          <span>✎</span> Ready to Tune
        </span>
      );
    case "failed":
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-800 flex items-center gap-1">
          <span>✕</span> Failed
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
          {status}
        </span>
      );
  }
}

export default function ChamakGalleryStep({
  galleryGenerations = [],
  onOpenItem,
  onStartNew,
}) {
  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full max-w-5xl mx-auto py-2 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-celestique-taupe pb-5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">🗂️</span>
            <h1 className="text-2xl md:text-3xl font-bold font-cirka text-celestique-dark">
              Fusion Gallery
            </h1>
          </div>
          <p className="text-xs md:text-sm text-celestique-muted font-sans">
            Review and download your historical AI jewelry fusions and in-progress concept designs.
          </p>
        </div>

        <button
          type="button"
          onClick={onStartNew}
          className="px-5 py-2.5 rounded-full bg-celestique-dark hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
        >
          + Create New Fusion
        </button>
      </div>

      {/* Gallery Grid */}
      {galleryGenerations.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-12 bg-white border border-dashed border-celestique-taupe rounded-3xl gap-4 my-6">
          <div className="w-16 h-16 rounded-full bg-celestique-cream flex items-center justify-center text-2xl">
            ✨
          </div>
          <div className="flex flex-col gap-1 max-w-sm">
            <h3 className="font-cirka text-xl font-bold text-celestique-dark">
              No Fusions Created Yet
            </h3>
            <p className="text-xs text-celestique-muted leading-relaxed">
              Combine two designs from your catalogue to create your first AI-synthesized jewelry concept.
            </p>
          </div>
          <button
            type="button"
            onClick={onStartNew}
            className="mt-2 px-6 py-3 rounded-full bg-celestique-dark text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-all"
          >
            Start First Fusion
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {galleryGenerations.map((item) => {
            const hasCompletedImg =
              (item.status === "completed" || item.status === "done") &&
              (item.output_image_url || item.generated_image_url);

            const displayImg =
              hasCompletedImg ||
              item.source_design_1_url ||
              item.source_design_2_url ||
              "";

            const d1Label = item.source_design_1_label || "Design 1";
            const d2Label = item.source_design_2_label || "Design 2";
            const dateStr = item.created_at
              ? new Date(item.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "";

            return (
              <div
                key={item.id}
                onClick={() => onOpenItem(item)}
                className="group flex flex-col bg-white border border-celestique-taupe rounded-2xl overflow-hidden p-4 shadow-xs hover:shadow-md hover:border-celestique-dark cursor-pointer transition-all"
              >
                {/* Visual Thumbnail Frame */}
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gradient-to-b from-[#F8F6F0] to-[#EFEBE1] p-3 flex items-center justify-center mb-3">
                  {displayImg ? (
                    <img
                      src={displayImg}
                      alt="Generation preview"
                      className="w-full h-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="text-xs text-celestique-muted font-sans">
                      No Preview
                    </div>
                  )}

                  {/* Top Badge Overlay */}
                  <div className="absolute top-2.5 left-2.5">
                    <StatusBadge status={item.status} />
                  </div>
                </div>

                {/* Meta details */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-celestique-dark truncate max-w-[170px]">
                      {d1Label} + {d2Label}
                    </span>
                    <span className="text-[10px] text-celestique-muted">{dateStr}</span>
                  </div>

                  {/* Dual source small icons */}
                  <div className="flex items-center gap-1.5 pt-1 border-t border-celestique-taupe/40 text-[10px] text-celestique-muted">
                    <span className="truncate">
                      ID: <span className="font-mono">{item.id.slice(0, 8)}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
