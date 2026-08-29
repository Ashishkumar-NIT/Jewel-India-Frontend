"use client";

import { SET_BACKDROPS } from "../../../lib/supabase/set-creation-queries";

/** Step 2 — backdrop preset + optional staging note. */
export default function SetCreationStyleStep({ flow }) {
  const notEnough = flow.wallet && flow.wallet.available < flow.cost;

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
      <button
        type="button"
        onClick={() => flow.setStep("picker")}
        className="text-xs font-semibold text-celestique-dark/60 hover:text-celestique-dark mb-4"
      >
        ← Change pieces
      </button>

      <h1 className="font-cirka text-2xl md:text-3xl font-bold text-celestique-dark">
        Choose the backdrop
      </h1>
      <p className="text-sm text-celestique-dark/60 mt-1 mb-6">
        Your two pieces stay exactly as they are. This only changes how they are
        staged and lit.
      </p>

      {/* The two chosen pieces */}
      <div className="flex items-center gap-3 mb-7">
        {[flow.selectedPiece1, flow.selectedPiece2].map((piece, i) => (
          <div key={i} className="flex items-center gap-2">
            <img
              src={piece?.imageUrl}
              alt={piece?.label || ""}
              className="w-14 h-14 rounded-lg object-cover border border-celestique-taupe"
            />
            <span className="text-xs font-semibold text-celestique-dark/70 max-w-[120px] truncate">
              {piece?.label}
            </span>
            {i === 0 && <span className="text-celestique-dark/30 text-lg mx-1">+</span>}
          </div>
        ))}
      </div>

      {/* Backdrop presets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-7">
        {SET_BACKDROPS.map((b) => {
          const active = flow.backdrop === b.id;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => flow.setBackdrop(b.id)}
              className={`text-left rounded-xl border-2 overflow-hidden transition-all ${
                active
                  ? "border-celestique-dark ring-2 ring-celestique-dark/15"
                  : "border-celestique-taupe hover:border-celestique-dark/40"
              }`}
            >
              <div className="h-20 w-full" style={{ background: b.swatch }} />
              <div className="p-2.5">
                <p className="text-xs font-bold text-celestique-dark">{b.label}</p>
                <p className="text-[11px] text-celestique-dark/55 mt-0.5 leading-snug">
                  {b.blurb}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Note */}
      <label className="block mb-2 text-xs font-bold text-celestique-dark">
        Staging note <span className="font-normal text-celestique-dark/45">(optional)</span>
      </label>
      <textarea
        value={flow.noteText}
        onChange={(e) => flow.setNoteText(e.target.value)}
        rows={3}
        maxLength={400}
        placeholder="e.g. warmer lighting, place the earrings slightly higher"
        className="w-full px-3 py-2.5 rounded-lg border border-celestique-taupe text-sm resize-none focus:outline-none focus:ring-2 focus:ring-celestique-dark/20"
      />
      <p className="text-[11px] text-celestique-dark/45 mt-1.5 mb-6">
        This affects the backdrop, arrangement and lighting only — it will not
        change either piece of jewellery.
      </p>

      {/* Generate */}
      <div className="flex items-center justify-between gap-3 border-t border-celestique-taupe pt-4">
        <div className="text-xs text-celestique-dark/60">
          <span className="font-bold text-celestique-dark">{flow.cost} credits</span>
          {flow.wallet && <span> · {flow.wallet.available} available</span>}
          {notEnough && (
            <span className="block text-red-600 font-semibold mt-0.5">
              Not enough credits
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={flow.generate}
          disabled={flow.isSubmitting || !flow.canProceed}
          className="px-6 py-2.5 rounded-lg bg-celestique-dark text-white text-sm font-bold disabled:opacity-35 hover:opacity-90 transition-opacity"
        >
          {flow.isSubmitting ? "Starting…" : "Create set"}
        </button>
      </div>
    </div>
  );
}
