"use client";
const checkered = {
  backgroundImage: `
    linear-gradient(45deg, #e5e5e5 25%, transparent 25%),
    linear-gradient(-45deg, #e5e5e5 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #e5e5e5 75%),
    linear-gradient(-45deg, transparent 75%, #e5e5e5 75%)
  `,
  backgroundSize: "16px 16px",
  backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
  backgroundColor: "#f8f6f0", // celestique-cream
};

// ── Variant metadata ──────────────────────────────────────────────────────────
const VARIANTS = [
  { key: "v1", label: "Stone — Classic",    scene: "Dark navy-blue stone" },
  { key: "v2", label: "Velvet — Boutique",  scene: "Burgundy velvet cushion" },
  { key: "v3", label: "Marble — Editorial", scene: "White Carrara marble" },
  { key: "v4", label: "Charcoal — Dramatic",scene: "Deep charcoal gradient" },
];

// ── Stage definitions ─────────────────────────────────────────────────────────
const STAGES = [
  { key: "uploading",   label: "Upload",             icon: "↑" },
  { key: "processing",  label: "Bg Removal",         icon: "✂" },
  { key: "bg_removed",  label: "4 Variants",         icon: "✦" },
  { key: "saving",      label: "Saving",             icon: "↓" },
  { key: "done",        label: "Complete",           icon: "✓" },
];

const STAGE_INDEX = { uploading: 0, processing: 1, bg_removed: 2, saving: 3, done: 4 };

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner({ size = "md" }) {
  const sz = size === "sm" ? "w-4 h-4 border" : "w-10 h-10 border-[1.5px]";
  return (
    <div className={`${sz} border-celestique-taupe border-t-celestique-dark rounded-full animate-spin`} />
  );
}

// ── Progress stepper ──────────────────────────────────────────────────────────
function Stepper({ status }) {
  const current = STAGE_INDEX[status] ?? 0;
  return (
    <div className="flex items-center gap-0 w-full">
      {STAGES.map((s, i) => {
        const done    = i < current;
        const active  = i === current;
        const pending = i > current;
        return (
          <div key={s.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all duration-500 border
                ${done    ? "bg-celestique-dark text-celestique-cream border-celestique-dark" : ""}
                ${active  ? "bg-transparent text-celestique-dark border-celestique-dark animate-pulse" : ""}
                ${pending ? "bg-transparent text-celestique-taupe border-celestique-taupe" : ""}
              `}>
                {done ? "✓" : s.icon}
              </div>
              <span className={`text-[9px] uppercase tracking-[0.2em] whitespace-nowrap
                ${active ? "text-celestique-dark font-medium" : done ? "text-celestique-dark" : "text-celestique-taupe"}`}>
                {s.label}
              </span>
            </div>
            {i < STAGES.length - 1 && (
              <div className={`flex-1 h-px mx-2 mb-5 transition-all duration-700 ${i < current ? "bg-celestique-dark" : "bg-celestique-taupe"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Single variant panel ──────────────────────────────────────────────────────
function VariantPanel({ variant, url, index }) {
  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between min-h-6">
        <div>
          <span className="text-[9px] uppercase tracking-[0.2em] text-celestique-dark">
            {variant.label}
          </span>
          <p className="text-[10px] text-celestique-dark/60 mt-1 font-serif italic">{variant.scene}</p>
        </div>
        {url && (
          <span className="text-[9px] uppercase tracking-[0.2em] text-celestique-dark border border-celestique-dark px-2 py-1">
            Done
          </span>
        )}
      </div>

      {/* Image */}
      <div className="relative aspect-[4/5] w-full bg-celestique-taupe/20">
        {url ? (
          <img
            src={url}
            alt={variant.label}
            className="w-full h-full object-cover transition-opacity duration-700 mix-blend-multiply"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <Spinner size="md" />
            <span className="text-[9px] uppercase tracking-[0.2em] text-celestique-dark/60">Generating</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function ProcessingView({ status, bgRemovedUrl, variantUrls = [], onReset }) {
  const isDone       = status === "done";
  const hasBgRemoved = !!bgRemovedUrl;
  const doneCount    = variantUrls.length;

  return (
    <div className="w-full animate-fade-in py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-12">

        {/* ── Stepper ── */}
        <div className="border-b border-celestique-taupe pb-8">
          <Stepper status={status} />
        </div>

        {/* ── Phase 1: uploading / processing — no images yet ── */}
        {!hasBgRemoved && !isDone ? (
          <div className="py-24 text-center space-y-8 relative overflow-hidden">
            <div className="relative z-10 flex flex-col items-center gap-8">
              <Spinner size="md" />
              <div>
                <h3 className="font-serif text-3xl text-celestique-dark tracking-tight">
                  {status === "uploading"
                    ? "Uploading your image"
                    : "Removing background"}
                </h3>
                <p className="text-celestique-dark/60 text-sm mt-4 uppercase tracking-[0.1em]">
                  {status === "uploading"
                    ? "Preparing for Reve AI pipeline"
                    : "Isolating the jewellery piece"}
                </p>
              </div>
            </div>
          </div>

        ) : (
          /* ── Phase 2+: bg_removed / saving / done — show images ── */
          <div className="space-y-12">

            {/* ── Reve AI bg-removed preview ── */}
            <div className="border border-celestique-taupe p-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[9px] uppercase tracking-[0.2em] text-celestique-dark border border-celestique-dark px-3 py-1.5">
                  Reve AI — Background Removed
                </span>
              </div>
              <div className="relative aspect-square w-full max-w-sm mx-auto border border-celestique-taupe"
                style={checkered}>
                <img
                  src={bgRemovedUrl}
                  alt="Background removed"
                  className="w-full h-full object-contain p-8"
                />
              </div>
            </div>

            {/* ── 4 Nanobana variant panels ── */}
            <div className="border border-celestique-taupe p-6 space-y-8">
              <div className="flex items-center justify-between border-b border-celestique-taupe pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-celestique-dark border border-celestique-dark px-3 py-1.5">
                    Nanobana AI — 4 Variants
                  </span>
                </div>
                {!isDone && (
                  <span className="flex items-center gap-3 text-[9px] uppercase tracking-[0.2em] text-celestique-dark/60">
                    <Spinner size="sm" />
                    Generating concurrently
                  </span>
                )}
                {isDone && (
                  <span className="text-[9px] uppercase tracking-[0.2em] text-celestique-dark">
                    {doneCount} / 4 generated
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {VARIANTS.map((v, i) => (
                  <VariantPanel
                    key={v.key}
                    variant={v}
                    url={variantUrls[i] ?? null}
                    index={i}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Status bar / actions ── */}
        <div className="border-t border-celestique-taupe pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          {isDone ? (
            <>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full border border-celestique-dark flex items-center justify-center">
                  <span className="text-celestique-dark text-lg">✓</span>
                </div>
                <div>
                  <p className="font-serif text-lg text-celestique-dark">
                    {doneCount} variant{doneCount !== 1 ? "s" : ""} saved
                  </p>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-celestique-dark/60 mt-1">Available in catalogue</p>
                </div>
              </div>
              <div className="flex items-center gap-4 flex-wrap justify-end">
                {variantUrls.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9px] uppercase tracking-[0.2em] text-celestique-dark border-b border-celestique-dark pb-0.5 hover:text-celestique-dark/60 hover:border-celestique-dark/60 transition-colors"
                    title={`Download ${VARIANTS[i]?.label}`}
                  >
                    Download V{i + 1}
                  </a>
                ))}
                <button
                  onClick={onReset}
                  className="ml-4 px-8 py-4 bg-celestique-dark text-celestique-cream text-[11px] uppercase tracking-widest font-bold hover:bg-celestique-dark/90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-3"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Another Product
                </button>
              </div>
            </>
          ) : status === "saving" ? (
            <div className="flex items-center gap-3 text-[9px] uppercase tracking-[0.2em] text-celestique-dark/60">
              <Spinner size="sm" />
              Saving metadata
            </div>
          ) : hasBgRemoved ? (
            <div className="flex items-center gap-3 text-[9px] uppercase tracking-[0.2em] text-celestique-dark/60">
              <Spinner size="sm" />
              <span>
                <span className="text-celestique-dark">Background removed.</span>{" "}
                Generating styled variants
              </span>
            </div>
          ) : null}
        </div>

      </div>
    </div>
  );
}
