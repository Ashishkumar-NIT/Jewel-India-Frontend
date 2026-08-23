"use client";

const STAGES = [
  { key: "uploading", label: "Upload", icon: "↑" },
  { key: "analyzing", label: "Analysis", icon: "🔍" },
  { key: "tuning", label: "Tuning", icon: "⚙" },
  { key: "generating", label: "Fusion", icon: "✦" },
  { key: "done", label: "Complete", icon: "✓" },
];

const STAGE_INDEX = {
  uploading: 0,
  analyzing: 1,
  sliderForm: 2,
  tuning: 2,
  generating: 3,
  result: 4,
  done: 4,
};

function Spinner() {
  return (
    <div className="w-12 h-12 border-2 border-celestique-taupe border-t-celestique-dark rounded-full animate-spin shadow-xs" />
  );
}

function Stepper({ currentStep }) {
  const currentIndex = STAGE_INDEX[currentStep] ?? 1;

  return (
    <div className="flex items-center gap-0 w-full max-w-2xl mx-auto px-2">
      {STAGES.map((s, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        const pending = i > currentIndex;

        return (
          <div key={s.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs transition-all duration-500 border ${
                  done
                    ? "bg-celestique-dark text-celestique-cream border-celestique-dark"
                    : active
                    ? "bg-white text-celestique-dark border-celestique-dark animate-pulse shadow-xs font-bold"
                    : "bg-transparent text-celestique-taupe border-celestique-taupe"
                }`}
              >
                {done ? "✓" : s.icon}
              </div>
              <span
                className={`text-[10px] uppercase tracking-widest whitespace-nowrap font-sans ${
                  active
                    ? "text-celestique-dark font-bold"
                    : done
                    ? "text-celestique-dark font-medium"
                    : "text-celestique-muted"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STAGES.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 mb-6 transition-all duration-700 ${
                  i < currentIndex ? "bg-celestique-dark" : "bg-celestique-taupe/80"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ChamakProgressStep({
  step,
  selectedDesign1,
  selectedDesign2,
  currentGeneration,
}) {
  const isAnalyzing = step === "analyzing";
  const title = isAnalyzing
    ? "Analyzing Design Geometry & Features"
    : "Synthesizing AI Jewelry Fusion";
  const subtitle = isAnalyzing
    ? "Vision models are decomposing silhouetted contours, metal textures, gemstone settings, and craftsmanship motifs."
    : "Generating a photorealistic high-fashion jewelry piece combining your customized slider ratios.";

  const img1 =
    selectedDesign1?.imageUrl ||
    currentGeneration?.source_design_1_url ||
    "";
  const img2 =
    selectedDesign2?.imageUrl ||
    currentGeneration?.source_design_2_url ||
    "";

  return (
    <div className="flex flex-col items-center justify-center gap-10 w-full max-w-4xl mx-auto py-8 animate-fade-in">
      {/* Progress Stepper */}
      <div className="w-full border-b border-celestique-taupe pb-8">
        <Stepper currentStep={step} />
      </div>

      {/* Main Wait Card */}
      <div className="flex flex-col items-center text-center max-w-lg gap-5">
        <Spinner />

        <div className="flex flex-col gap-2">
          <h2 className="font-cirka text-2xl md:text-3xl font-bold text-celestique-dark">
            {title}
          </h2>
          <p className="text-xs md:text-sm text-celestique-muted leading-relaxed font-sans">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Side-by-side Source Preview Thumbnail Pill */}
      {(img1 || img2) && (
        <div className="flex items-center gap-4 bg-white border border-celestique-taupe rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#D4AF37] bg-celestique-cream/30 p-1">
              {img1 ? (
                <img
                  src={img1}
                  alt="Design 1"
                  className="w-full h-full object-contain mix-blend-multiply"
                />
              ) : null}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">
                Design 1
              </span>
              <span className="text-xs font-semibold text-celestique-dark truncate max-w-[120px]">
                {selectedDesign1?.label || currentGeneration?.source_design_1_label || "Foundation"}
              </span>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-celestique-cream flex items-center justify-center text-xs font-bold text-celestique-dark">
            +
          </div>

          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#3B82F6] bg-celestique-cream/30 p-1">
              {img2 ? (
                <img
                  src={img2}
                  alt="Design 2"
                  className="w-full h-full object-contain mix-blend-multiply"
                />
              ) : null}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-wider">
                Design 2
              </span>
              <span className="text-xs font-semibold text-celestique-dark truncate max-w-[120px]">
                {selectedDesign2?.label || currentGeneration?.source_design_2_label || "Upgrade"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Helpful Hint */}
      <div className="text-[11px] text-celestique-muted font-sans flex items-center gap-2 bg-celestique-cream/50 px-4 py-2 rounded-full border border-celestique-taupe/50">
        <span>💡</span>
        <span>
          This usually takes 15–30 seconds. You can stay on this page or check back in the Gallery.
        </span>
      </div>
    </div>
  );
}
