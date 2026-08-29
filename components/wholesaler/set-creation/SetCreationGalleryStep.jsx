"use client";

export default function SetCreationGalleryStep({ flow }) {
  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-cirka text-2xl font-bold text-celestique-dark">
          Your sets
        </h1>
        <button
          type="button"
          onClick={flow.reset}
          className="px-4 py-2 rounded-lg bg-celestique-dark text-white text-xs font-bold hover:opacity-90"
        >
          Create a set
        </button>
      </div>

      {flow.galleryGenerations.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-celestique-taupe rounded-xl">
          <p className="text-sm font-semibold text-celestique-dark/70">
            No sets yet
          </p>
          <p className="text-xs text-celestique-dark/45 mt-1">
            Pick two pieces and stage them together.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {flow.galleryGenerations.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => flow.openGalleryItem(item)}
              className="text-left rounded-xl border border-celestique-taupe overflow-hidden hover:border-celestique-dark transition-colors"
            >
              <div className="aspect-[3/4] bg-celestique-cream flex items-center justify-center">
                {item.source_image_1_url ? (
                  <img
                    src={item.source_image_1_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </div>
              <div className="p-2">
                <p className="text-[11px] font-bold text-celestique-dark capitalize">
                  {(item.set_backdrop || "set").replace(/_/g, " ")}
                </p>
                <p className="text-[10px] text-celestique-dark/45">
                  {item.status === "done"
                    ? new Date(item.created_at).toLocaleDateString()
                    : item.status}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
