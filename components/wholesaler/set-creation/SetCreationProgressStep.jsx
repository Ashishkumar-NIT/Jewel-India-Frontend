"use client";

import { useEffect, useState } from "react";

// Measured at roughly 95 seconds against the live API, so the copy sets the
// expectation honestly rather than implying it is nearly done.
const LINES = [
  "Reading both of your pieces…",
  "Building the backdrop…",
  "Placing both pieces in one scene…",
  "Matching the lighting across both…",
  "Finishing the catalogue shot…",
];

export default function SetCreationProgressStep({ flow }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % LINES.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      <div className="flex items-center justify-center gap-3 mb-8">
        {[flow.selectedPiece1, flow.selectedPiece2].map((p, i) => (
          <img
            key={i}
            src={p?.imageUrl}
            alt=""
            className="w-20 h-20 rounded-xl object-cover border border-celestique-taupe animate-pulse"
            style={{ animationDelay: `${i * 400}ms` }}
          />
        ))}
      </div>

      <h2 className="font-cirka text-xl font-bold text-celestique-dark mb-2">
        Creating your set
      </h2>
      <p className="text-sm text-celestique-dark/60 mb-6 min-h-[20px]">{LINES[idx]}</p>

      <div className="h-1 w-full max-w-xs mx-auto rounded-full bg-celestique-cream overflow-hidden">
        <div className="h-full w-1/3 bg-celestique-dark rounded-full animate-[shimmer_1.8s_ease-in-out_infinite]" />
      </div>

      <p className="text-[11px] text-celestique-dark/45 mt-6">
        This usually takes about a minute and a half. Please keep this tab open.
      </p>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}
