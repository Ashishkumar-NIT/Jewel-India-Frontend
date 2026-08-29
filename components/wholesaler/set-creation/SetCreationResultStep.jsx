"use client";

import { useState } from "react";
import { SET_BACKDROPS } from "../../../lib/supabase/set-creation-queries";
import SetCreationLightbox from "./SetCreationLightbox";

export default function SetCreationResultStep({ flow }) {
  const gen = flow.currentGeneration;
  const failed = flow.step === "failed";
  const backdrop = SET_BACKDROPS.find((b) => b.id === gen?.set_backdrop);
  const [lightboxAt, setLightboxAt] = useState(null);

  // Output first so it is index 0, then the two sources. Opening a source
  // lands in compare mode against the output.
  const previewImages = [
    flow.signedOutputImageUrl && {
      src: flow.signedOutputImageUrl,
      label: "Generated set",
      kind: "output",
    },
    gen?.source_image_1_url && {
      src: gen.source_image_1_url,
      label: "Piece 1",
      kind: "source",
    },
    gen?.source_image_2_url && {
      src: gen.source_image_2_url,
      label: "Piece 2",
      kind: "source",
    },
  ].filter(Boolean);

  if (failed) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-4">😕</div>
        <h2 className="font-cirka text-xl font-bold text-celestique-dark mb-2">
          That didn&apos;t work
        </h2>
        <p className="text-sm text-celestique-dark/60 mb-6">
          {flow.errorMessage || "Something went wrong."}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => flow.setStep("styling")}
            className="px-5 py-2.5 rounded-lg border border-celestique-taupe text-sm font-bold text-celestique-dark hover:bg-celestique-cream"
          >
            Adjust and retry
          </button>
          <button
            type="button"
            onClick={flow.reset}
            className="px-5 py-2.5 rounded-lg bg-celestique-dark text-white text-sm font-bold hover:opacity-90"
          >
            Start over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-6">
      <h1 className="font-cirka text-2xl font-bold text-celestique-dark mb-1">
        Your set is ready
      </h1>
      <p className="text-sm text-celestique-dark/60 mb-6">
        {backdrop ? `Staged on the ${backdrop.label} backdrop.` : "Staged set photo."}
      </p>

      <div className="rounded-2xl overflow-hidden border border-celestique-taupe bg-celestique-cream/40 mb-5">
        {flow.signedOutputImageUrl ? (
          <button
            type="button"
            onClick={() => setLightboxAt(0)}
            className="block w-full group relative cursor-zoom-in"
            title="Open full screen"
          >
            <img
              src={flow.signedOutputImageUrl}
              alt="Generated jewellery set"
              className="w-full h-auto"
            />
            <span className="absolute top-3 right-3 px-2.5 py-1.5 rounded-lg bg-black/55 text-white text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              View full screen
            </span>
          </button>
        ) : (
          <div className="aspect-[3/4] flex items-center justify-center text-sm text-celestique-dark/45">
            Loading image…
          </div>
        )}
      </div>

      {/* Sources — so it is obvious which two pieces went in */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-[11px] font-bold text-celestique-dark/50 uppercase tracking-wide">
          From
        </span>
        {[gen?.source_image_1_url, gen?.source_image_2_url].filter(Boolean).map((u, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setLightboxAt(i + 1)}
            className="relative w-12 h-12 rounded-lg overflow-hidden border border-celestique-taupe hover:border-celestique-dark transition-colors cursor-zoom-in"
            title="Compare against the generated set"
          >
            <img src={u} alt={`Piece ${i + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
        <span className="text-[11px] text-celestique-dark/40 ml-1">
          tap to compare
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {flow.signedOutputImageUrl && (
          <a
            href={flow.signedOutputImageUrl}
            download={`set-${gen?.id || "jewel-india"}.png`}
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2.5 rounded-lg bg-celestique-dark text-white text-sm font-bold hover:opacity-90"
          >
            Download
          </a>
        )}
        <button
          type="button"
          onClick={() => flow.setStep("styling")}
          className="px-5 py-2.5 rounded-lg border border-celestique-taupe text-sm font-bold text-celestique-dark hover:bg-celestique-cream"
        >
          Try another backdrop
        </button>
        <button
          type="button"
          onClick={flow.reset}
          className="px-5 py-2.5 rounded-lg border border-celestique-taupe text-sm font-bold text-celestique-dark hover:bg-celestique-cream"
        >
          New set
        </button>
      </div>

      {gen?.note_text && (
        <div className="mt-6 p-3 rounded-lg bg-celestique-cream/60 border border-celestique-taupe">
          <p className="text-[11px] font-bold text-celestique-dark/50 uppercase tracking-wide mb-1">
            Your note
          </p>
          <p className="text-xs text-celestique-dark/75">{gen.note_text}</p>
        </div>
      )}

      {lightboxAt !== null && previewImages.length > 0 && (
        <SetCreationLightbox
          images={previewImages}
          startIndex={lightboxAt}
          onClose={() => setLightboxAt(null)}
        />
      )}
    </div>
  );
}
