"use client";

import ChamakSlider from "./ChamakSlider";
import { useCredits } from "../../../context/CreditsContext";

export default function ChamakSliderForm({
  currentGeneration,
  sliderValues,
  setSliderValues,
  noteText,
  setNoteText,
  onSubmitAndGenerate,
  onBackToPicker,
  isSubmitting,
  errorMessage,
}) {
  const { wallet, costOf } = useCredits();
  const fuseCost = costOf("chamak.generate");
  const available = wallet?.available ?? 0;
  const analysis = currentGeneration?.vision_analysis_json || {};

  // Extract analysis fields with fallbacks
  const d1Analysis = analysis.design_1_analysis || analysis.design1 || {};
  const d2Analysis = analysis.design_2_analysis || analysis.design2 || {};

  const d1Type = d1Analysis.jewellery_type || d1Analysis.type || "Jewellery Piece";
  const d2Type = d2Analysis.jewellery_type || d2Analysis.type || "Jewellery Piece";

  const d1Strengths = d1Analysis.strengths || d1Analysis.key_features || [
    "Defined primary silhouette",
    "Balanced structural framing",
  ];
  const d2Strengths = d2Analysis.strengths || d2Analysis.key_features || [
    "Intricate surface detailing",
    "Enhanced gemstone ornamentation",
  ];

  const contentFlagged = Boolean(analysis.content_flag || analysis.safety_flag);
  const typeMismatch =
    Boolean(analysis.type_mismatch) ||
    (d1Type && d2Type && d1Type.toLowerCase() !== d2Type.toLowerCase());
  const nearIdentical = Boolean(analysis.near_identical);

  const d1Label = currentGeneration?.source_design_1_label || "Design 1";
  const d2Label = currentGeneration?.source_design_2_label || "Design 2";

  const d1Img = currentGeneration?.source_design_1_url || "";
  const d2Img = currentGeneration?.source_design_2_url || "";

  const handleSliderChange = (attrName, value) => {
    setSliderValues((prev) => ({
      ...prev,
      [attrName]: value,
    }));
  };

  const attributeKeys = Object.keys(sliderValues);

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto py-2 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-celestique-taupe pb-5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <h1 className="text-2xl md:text-3xl font-bold font-cirka text-celestique-dark">
              Tune AI Fusion Balance
            </h1>
          </div>
          <p className="text-xs md:text-sm text-celestique-muted font-sans">
            Adjust the sliders below to dial in the exact influence of each design across key aesthetic attributes.
          </p>
        </div>

        <button
          type="button"
          onClick={onBackToPicker}
          className="text-xs font-semibold text-celestique-dark hover:underline underline-offset-4"
        >
          ← Choose Different Designs
        </button>
      </div>

      {/* Safety Hard-Block Banner */}
      {contentFlagged && (
        <div className="border border-red-300 bg-red-50 p-5 rounded-2xl flex items-start gap-3.5 shadow-sm">
          <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm shrink-0">
            ⛔
          </div>
          <div>
            <h3 className="text-sm font-bold text-red-900">
              Content Policy Flag Detected
            </h3>
            <p className="text-xs text-red-700 mt-1 leading-relaxed">
              {analysis.flag_reason ||
                "One or both of the uploaded designs could not be processed due to content safety guidelines. Please choose alternative designs."}
            </p>
          </div>
        </div>
      )}

      {/* Warning Banners (Informational) */}
      {!contentFlagged && (
        <>
          {typeMismatch && (
            <div className="border border-amber-200 bg-amber-50/70 p-4 rounded-xl flex items-start gap-3">
              <span className="text-amber-600 text-base mt-0.5">⚠️</span>
              <div>
                <h4 className="text-xs font-bold text-amber-900">
                  Different Jewelry Categories Detected ({d1Type} + {d2Type})
                </h4>
                <p className="text-[11px] text-amber-800/90 mt-0.5">
                  Fusing two different jewelry types creates hybrid concept pieces. Silhouette will default primarily to Design 1.
                </p>
              </div>
            </div>
          )}

          {nearIdentical && (
            <div className="border border-blue-200 bg-blue-50/70 p-4 rounded-xl flex items-start gap-3">
              <span className="text-blue-600 text-base mt-0.5">ℹ️</span>
              <div>
                <h4 className="text-xs font-bold text-blue-900">
                  Very Similar Designs Selected
                </h4>
                <p className="text-[11px] text-blue-800/90 mt-0.5">
                  Both pieces share similar silhouettes. AI will focus on subtle micro-texture and setting fusions.
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="border border-red-200 bg-red-50 p-4 rounded-xl text-xs text-red-700 font-medium">
          {errorMessage}
        </div>
      )}

      {/* Vision Analysis Report Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* Design 1 Card */}
        <div className="flex flex-col bg-white border border-celestique-taupe rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-3 pb-3 border-b border-celestique-taupe/60 mb-3">
            <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-[#D4AF37] bg-celestique-cream/30 p-1 shrink-0">
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
                Design 1 (Foundation)
              </span>
              <h3 className="text-sm font-bold text-celestique-dark truncate max-w-[200px]">
                {d1Label}
              </h3>
              <span className="text-xs text-celestique-muted">{d1Type}</span>
            </div>
          </div>

          <span className="text-[11px] font-bold text-celestique-dark uppercase tracking-wider mb-2">
            Identified Strengths:
          </span>
          <ul className="space-y-1.5 text-xs text-celestique-dark/80">
            {Array.isArray(d1Strengths) ? (
              d1Strengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#D4AF37] font-bold">✓</span>
                  <span>{str}</span>
                </li>
              ))
            ) : (
              <li className="flex items-start gap-2">
                <span className="text-[#D4AF37] font-bold">✓</span>
                <span>{String(d1Strengths)}</span>
              </li>
            )}
          </ul>
        </div>

        {/* Design 2 Card */}
        <div className="flex flex-col bg-white border border-celestique-taupe rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-3 pb-3 border-b border-celestique-taupe/60 mb-3">
            <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-[#3B82F6] bg-celestique-cream/30 p-1 shrink-0">
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
                Design 2 (Upgrade)
              </span>
              <h3 className="text-sm font-bold text-celestique-dark truncate max-w-[200px]">
                {d2Label}
              </h3>
              <span className="text-xs text-celestique-muted">{d2Type}</span>
            </div>
          </div>

          <span className="text-[11px] font-bold text-celestique-dark uppercase tracking-wider mb-2">
            Identified Strengths:
          </span>
          <ul className="space-y-1.5 text-xs text-celestique-dark/80">
            {Array.isArray(d2Strengths) ? (
              d2Strengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#3B82F6] font-bold">✓</span>
                  <span>{str}</span>
                </li>
              ))
            ) : (
              <li className="flex items-start gap-2">
                <span className="text-[#3B82F6] font-bold">✓</span>
                <span>{String(d2Strengths)}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Dynamic Sliders Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-cirka text-xl font-bold text-celestique-dark">
            Attribute Sliders
          </h2>
          <span className="text-xs text-celestique-muted font-sans">
            Slide left for {d1Label}, slide right for {d2Label}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {attributeKeys.map((key) => (
            <ChamakSlider
              key={key}
              label={key}
              value={sliderValues[key] ?? 50}
              onChange={(val) => handleSliderChange(key, val)}
              design1Label={d1Label}
              design2Label={d2Label}
            />
          ))}
        </div>
      </div>

      {/* Note Textarea for custom prompt additions */}
      <div className="flex flex-col gap-2 bg-white border border-celestique-taupe rounded-2xl p-5 shadow-xs">
        <label className="text-xs font-bold text-celestique-dark font-sans flex items-center justify-between">
          <span>Special Stylistic Notes (Optional)</span>
          <span className="text-[11px] text-celestique-muted font-normal">
            Direct instructions for the AI prompt compiler
          </span>
        </label>
        <textarea
          rows={3}
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="e.g. Keep 22k antique yellow gold finish, emphasize pavé emerald accents along the outer rim..."
          className="w-full text-xs text-celestique-dark bg-celestique-cream/30 border border-celestique-taupe rounded-xl p-3 focus:outline-none focus:border-celestique-dark transition-all placeholder:text-gray-400 font-sans"
        />
      </div>

      {/* Submit Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-celestique-taupe">
        <div className="flex items-center gap-2">
          <span className="text-xs text-celestique-muted">
            Treasure Chest: <strong className="text-celestique-dark font-bold">{available} credits</strong> available
          </span>
        </div>

        <button
          type="button"
          disabled={contentFlagged || isSubmitting}
          onClick={onSubmitAndGenerate}
          className={`w-full sm:w-auto px-9 py-4 rounded-full font-bold text-xs md:text-sm tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2.5 ${
            contentFlagged || isSubmitting
              ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
              : "bg-celestique-dark text-white hover:bg-black hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Compiling & Fusing...</span>
            </>
          ) : (
            <>
              <span>✦ Fuse Designs{fuseCost ? ` · ${fuseCost} credits` : ""}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
