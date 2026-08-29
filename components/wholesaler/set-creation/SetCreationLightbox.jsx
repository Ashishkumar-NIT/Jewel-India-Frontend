"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Full-screen image viewer for the result screen.
 *
 * The point of this is not "bigger picture" — it is judging whether the two
 * source pieces actually survived into the output. So the default view when
 * you open a SOURCE image is the compare view: that piece on the left, the
 * generated set on the right, both at full height. Bead counts, stone colours
 * and drop counts are the things being checked, and they are invisible at
 * thumbnail size.
 *
 * @param {Array<{src: string, label: string, kind: "output"|"source"}>} images
 * @param {number} startIndex
 */
export default function SetCreationLightbox({ images, startIndex = 0, onClose }) {
  const [index, setIndex] = useState(startIndex);
  const outputIndex = images.findIndex((i) => i.kind === "output");
  const current = images[index];

  // Opening a source goes straight to compare — that is the reason to open it.
  const [compare, setCompare] = useState(
    () => images[startIndex]?.kind === "source" && outputIndex !== -1
  );

  const prev = useCallback(
    () => setIndex((i) => (i - 1 + images.length) % images.length),
    [images.length]
  );
  const next = useCallback(
    () => setIndex((i) => (i + 1) % images.length),
    [images.length]
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key.toLowerCase() === "c" && outputIndex !== -1) setCompare((c) => !c);
    };
    window.addEventListener("keydown", onKey);
    // Stop the page behind from scrolling while the overlay is up.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, prev, next, outputIndex]);

  if (!current) return null;

  const comparing = compare && outputIndex !== -1 && index !== outputIndex;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/92 backdrop-blur-sm flex flex-col"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
    >
      {/* Bar */}
      <div
        className="flex items-center justify-between gap-3 px-4 md:px-6 py-3 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-white/90 text-sm font-semibold truncate">
          {comparing ? `${current.label}  vs  generated set` : current.label}
        </span>

        <div className="flex items-center gap-2">
          {outputIndex !== -1 && index !== outputIndex && (
            <button
              type="button"
              onClick={() => setCompare((c) => !c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                comparing
                  ? "bg-white text-black"
                  : "bg-white/15 text-white hover:bg-white/25"
              }`}
              title="Toggle compare (C)"
            >
              Compare
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/15 text-white hover:bg-white/25 flex items-center justify-center"
            aria-label="Close preview"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Stage */}
      <div
        className="flex-1 min-h-0 px-3 md:px-6 pb-3"
        onClick={(e) => e.stopPropagation()}
      >
        {comparing ? (
          <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-3">
            {[current, images[outputIndex]].map((img, i) => (
              <figure key={i} className="h-full min-h-0 flex flex-col">
                <img
                  src={img.src}
                  alt={img.label}
                  className="flex-1 min-h-0 w-full object-contain"
                />
                <figcaption className="text-center text-[11px] font-semibold text-white/55 pt-2">
                  {i === 0 ? `Source — ${img.label}` : "Generated set"}
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <img
            src={current.src}
            alt={current.label}
            className="h-full w-full object-contain"
          />
        )}
      </div>

      {/* Filmstrip */}
      <div
        className="shrink-0 flex items-center justify-center gap-2 px-4 pb-5 pt-1"
        onClick={(e) => e.stopPropagation()}
      >
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
              i === index ? "border-white" : "border-white/25 hover:border-white/60"
            }`}
            title={img.label}
          >
            <img src={img.src} alt={img.label} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      <p className="text-center text-[10px] text-white/35 pb-3 hidden md:block">
        ← → to move · C to compare · Esc to close
      </p>
    </div>
  );
}
