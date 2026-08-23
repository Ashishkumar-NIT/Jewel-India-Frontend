"use client";

import { useState } from "react";
import { useCredits } from "../../../context/CreditsContext";

export default function ChamakResultStep({
  step,
  currentGeneration,
  signedOutputImageUrl,
  onReviseAndRetry,
  onStartNew,
  onOpenFeedback,
  errorMessage,
}) {
  const { costOf } = useCredits();
  const rerollCost = costOf("chamak.reroll");
  const [showTraceability, setShowTraceability] = useState(false);
  const isFailed = step === "failed";

  const d1Img = currentGeneration?.source_design_1_url || "";
  const d2Img = currentGeneration?.source_design_2_url || "";
  const d1Label = currentGeneration?.source_design_1_label || "Design 1 (Foundation)";
  const d2Label = currentGeneration?.source_design_2_label || "Design 2 (Upgrade)";

  const sliderWeights = currentGeneration?.wholesaler_form_json || {};
  const note = currentGeneration?.note_text || "";
  const prompt = currentGeneration?.compiled_prompt || currentGeneration?.prompt || "";
  const genId = currentGeneration?.id || "";
  const createdAt = currentGeneration?.created_at
    ? new Date(currentGeneration.created_at).toLocaleString()
    : "";

  // ── FAILURE SCREEN ────────────────────────────────────────────────────────
  if (isFailed) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 w-full max-w-2xl mx-auto py-12 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-2xl font-bold shadow-sm">
          ✕
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="font-cirka text-3xl font-bold text-celestique-dark">
            Fusion Process Unsuccessful
          </h2>
          <p className="text-xs md:text-sm text-celestique-muted max-w-md mx-auto leading-relaxed font-sans">
            {errorMessage ||
              currentGeneration?.error_message ||
              "The AI fusion pipeline encountered an unexpected issue while generating your design concept."}
          </p>
        </div>

        {/* Source Thumbnails Preview */}
        {(d1Img || d2Img) && (
          <div className="flex items-center justify-center gap-3 p-3 bg-celestique-cream/40 border border-celestique-taupe rounded-2xl">
            {d1Img && (
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#D4AF37] bg-white p-1">
                <img
                  src={d1Img}
                  alt={d1Label}
                  className="w-full h-full object-contain mix-blend-multiply"
                />
              </div>
            )}
            <span className="text-xs font-bold text-celestique-muted">+</span>
            {d2Img && (
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#3B82F6] bg-white p-1">
                <img
                  src={d2Img}
                  alt={d2Label}
                  className="w-full h-full object-contain mix-blend-multiply"
                />
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
          <button
            type="button"
            onClick={onReviseAndRetry}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-celestique-dark text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-all cursor-pointer shadow-sm"
          >
            Adjust Sliders & Retry
          </button>
          <button
            type="button"
            onClick={onStartNew}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-white border border-celestique-taupe text-celestique-dark text-xs font-bold uppercase tracking-wider hover:bg-celestique-cream transition-all cursor-pointer"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  // ── SUCCESS SCREEN ────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto py-2 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-celestique-taupe pb-5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <h1 className="text-2xl md:text-3xl font-bold font-cirka text-celestique-dark">
              Fusion Design Complete
            </h1>
          </div>
          <p className="text-xs md:text-sm text-celestique-muted font-sans">
            AI has synthesized a composite jewelry design honoring both input pieces and your slider ratios.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReviseAndRetry}
            className="px-4 py-2 rounded-xl bg-celestique-cream hover:bg-celestique-taupe/60 text-celestique-dark border border-celestique-taupe text-xs font-semibold tracking-wide transition-all"
          >
            Adjust & Re-fuse{rerollCost ? ` · ${rerollCost} credits` : ""}
          </button>
          <button
            type="button"
            onClick={onStartNew}
            className="px-4 py-2 rounded-xl bg-celestique-dark hover:bg-black text-white text-xs font-semibold tracking-wide transition-all"
          >
            + New Fusion
          </button>
        </div>
      </div>

      {/* Main Showcase Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Giant Result Visual (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden border-2 border-celestique-dark/20 bg-gradient-to-b from-[#F8F6F0] to-[#EFEBE1] p-6 flex items-center justify-center shadow-lg group">
            {signedOutputImageUrl ? (
              <img
                src={signedOutputImageUrl}
                alt="Fused AI Jewelry Design"
                className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 text-celestique-muted">
                <div className="w-8 h-8 border-2 border-celestique-taupe border-t-celestique-dark rounded-full animate-spin" />
                <span className="text-xs">Loading high-res output...</span>
              </div>
            )}

            <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md text-white text-[10px] font-bold tracking-widest uppercase shadow-sm">
              AI Composite Master
            </div>
          </div>

          {/* Quick Actions Row */}
          <div className="flex items-center justify-between gap-3">
            {signedOutputImageUrl && (
              <a
                href={signedOutputImageUrl}
                download={`chamak_fusion_${genId.slice(0, 8)}.png`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-celestique-dark hover:bg-black text-white text-xs font-bold text-center uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Download Render
              </a>
            )}
            <button
              type="button"
              onClick={onOpenFeedback}
              className="py-3 px-5 rounded-xl bg-white border border-celestique-taupe hover:bg-celestique-cream text-celestique-dark text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <span>⭐</span>
              <span>Rate Quality</span>
            </button>
          </div>
        </div>

        {/* Right: Sources & Traceability (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Source Breakdown Box */}
          <div className="bg-white border border-celestique-taupe rounded-2xl p-5 shadow-xs flex flex-col gap-4">
            <h3 className="font-cirka text-lg font-bold text-celestique-dark">
              Source Designs
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {/* Source 1 */}
              <div className="flex flex-col gap-2 p-3 rounded-xl border border-[#D4AF37]/50 bg-[#FEF9E7]/40">
                <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-white p-1">
                  {d1Img && (
                    <img
                      src={d1Img}
                      alt={d1Label}
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">
                    Design 1
                  </span>
                  <span className="text-xs font-bold text-celestique-dark truncate">
                    {d1Label}
                  </span>
                </div>
              </div>

              {/* Source 2 */}
              <div className="flex flex-col gap-2 p-3 rounded-xl border border-[#3B82F6]/50 bg-[#EFF6FF]/40">
                <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-white p-1">
                  {d2Img && (
                    <img
                      src={d2Img}
                      alt={d2Label}
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-wider">
                    Design 2
                  </span>
                  <span className="text-xs font-bold text-celestique-dark truncate">
                    {d2Label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Traceability & Specs Card */}
          <div className="bg-white border border-celestique-taupe rounded-2xl p-5 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="font-cirka text-base font-bold text-celestique-dark">
                Traceability Details
              </h3>
              <button
                type="button"
                onClick={() => setShowTraceability(!showTraceability)}
                className="text-xs font-semibold text-celestique-muted hover:text-celestique-dark underline"
              >
                {showTraceability ? "Hide" : "Show Full"}
              </button>
            </div>

            <div className="flex flex-col gap-2 text-xs font-sans">
              <div className="flex justify-between py-1 border-b border-celestique-taupe/40">
                <span className="text-celestique-muted">Generation ID</span>
                <span className="font-mono text-[11px] text-celestique-dark font-medium truncate max-w-[160px]">
                  {genId || "—"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-celestique-taupe/40">
                <span className="text-celestique-muted">Created</span>
                <span className="text-celestique-dark">{createdAt || "—"}</span>
              </div>

              {/* Slider Ratios Summary */}
              {Object.keys(sliderWeights).length > 0 && (
                <div className="flex flex-col gap-1.5 pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-celestique-muted">
                    Slider Weights:
                  </span>
                  {Object.entries(sliderWeights).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-[11px]">
                      <span className="text-celestique-dark truncate max-w-[160px]">{k}</span>
                      <span className="font-semibold text-celestique-muted">
                        <span className="text-[#D4AF37]">{100 - v}%</span> / <span className="text-[#3B82F6]">{v}%</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Detailed Extended Prompt view */}
              {showTraceability && (
                <div className="flex flex-col gap-3 pt-3 mt-2 border-t border-celestique-taupe animate-fade-in">
                  {note && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-celestique-muted">
                        Wholesaler Note:
                      </span>
                      <p className="text-xs text-celestique-dark bg-celestique-cream/50 p-2.5 rounded-lg italic">
                        &quot;{note}&quot;
                      </p>
                    </div>
                  )}

                  {prompt && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-celestique-muted">
                        Compiled AI Prompt:
                      </span>
                      <p className="text-[11px] text-celestique-dark/80 bg-gray-50 p-2.5 rounded-lg font-mono leading-relaxed border border-gray-100 max-h-36 overflow-y-auto">
                        {prompt}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
