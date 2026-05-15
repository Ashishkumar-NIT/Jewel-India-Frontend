"use client";

import { useState } from "react";

const THEMES = [
  {
    id: "indian",
    name: "Indian",
    subtext: "Discover designs selected with precision, blending craftsmanship and ethnic style",
    image: "https://res.cloudinary.com/dcs0vuzwg/image/upload/v1778837501/selected_er11az.svg",
    locked: false,
  },
  {
    id: "maharaja",
    name: "Maharaja",
    subtext: "Discover designs selected with precision, blending craftsmanship and ethnic style",
    image: "https://res.cloudinary.com/dcs0vuzwg/image/upload/v1778837496/locked1_sc4thy.svg",
    locked: true,
  },
  {
    id: "utsav",
    name: "Utsav",
    subtext: "Discover designs selected with precision, blending craftsmanship and ethnic style",
    image: "https://res.cloudinary.com/dcs0vuzwg/image/upload/v1778837497/locked2_k8imhv.svg",
    locked: true,
  },
  {
    id: "neelam",
    name: "Neelam",
    subtext: "Discover designs selected with precision, blending craftsmanship and ethnic style",
    image: "https://res.cloudinary.com/dcs0vuzwg/image/upload/v1778837499/locked3_jztkzz.svg",
    locked: true,
  },
];

function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

function LockedModal({ theme, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[340px] rounded-[24px] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={theme.image}
            alt={theme.name}
            className="w-full h-full object-cover"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.3) 55%, rgba(0,0,0,0.1) 100%)" }} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-8 pt-16 pb-10">
          {/* Lock icon ring */}
          <div className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center mb-5 shadow-lg">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>

          <h2 className="font-serif text-white text-[28px] leading-tight mb-2">{theme.name}</h2>

          <div className="w-8 h-[1px] bg-white/40 mx-auto mb-4" />

          <p className="text-white/70 text-[13px] leading-relaxed mb-2">
            This theme is coming in
          </p>
          <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-4 py-1.5 text-white text-[12px] font-semibold tracking-widest uppercase mb-6">
            ✦ Version 2.0
          </span>

          <p className="text-white/50 text-[12px] leading-relaxed mb-8 max-w-[240px]">
            We're crafting this experience with care. Stay tuned — it will be worth the wait.
          </p>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-full bg-white text-[#111] text-[13px] font-bold tracking-wide hover:bg-white/90 transition-all shadow-lg"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RetailerThemeClient() {
  const [selectedTheme, setSelectedTheme] = useState("indian");
  const [lockedModal, setLockedModal] = useState(null); // theme object

  return (
    <div className="min-h-screen bg-[#F0F2F5] px-6 md:px-10 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[22px] font-bold text-[#111111] leading-tight">Store Theme</h1>
        <p className="text-[13px] text-[#6B7280] mt-1">
          Select the store theme you think justifies your product and vision
        </p>
      </div>

      {/* Theme Grid — 1 col mobile, 2 col tablet+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-[780px]">
        {THEMES.map((theme) => {
          const isSelected = selectedTheme === theme.id;

          return (
            <button
              key={theme.id}
              onClick={() => {
                if (theme.locked) {
                  setLockedModal(theme);
                } else {
                  setSelectedTheme(theme.id);
                }
              }}
              className="relative rounded-[18px] overflow-hidden text-left group transition-all duration-300 focus:outline-none"
              style={{
                aspectRatio: "4/5",
                boxShadow: isSelected
                  ? "0 0 0 3px #111, 0 12px 32px rgba(0,0,0,0.18)"
                  : "0 4px 20px rgba(0,0,0,0.10)",
              }}
            >
              {/* Background image */}
              <img
                src={theme.image}
                alt={theme.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              {/* Dark bottom gradient — same vibe as the modal */}
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.08) 50%, transparent 75%)" }}
              />


              {/* Top badge: SELECTED or LOCKED */}
              <div className="absolute top-4 left-4 z-10">
                {theme.locked ? (
                  <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold tracking-widest uppercase rounded-full px-3 py-1.5">
                    <LockIcon />
                    Locked
                  </span>
                ) : isSelected ? (
                  <span className="inline-flex items-center gap-1.5 bg-white/90 text-[#111] text-[10px] font-bold tracking-widest uppercase rounded-full px-3 py-1.5">
                    ✓ Selected
                  </span>
                ) : null}
              </div>

              {/* Bottom text */}
              <div className="absolute bottom-0 left-0 right-0 z-10 p-5 text-center">
                <h2 className="font-serif text-white text-[28px] md:text-[32px] leading-tight mb-1">
                  {theme.name}
                </h2>
                <p className="text-white/70 text-[12px] leading-relaxed">
                  {theme.subtext}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Locked Modal */}
      {lockedModal && (
        <LockedModal theme={lockedModal} onClose={() => setLockedModal(null)} />
      )}
    </div>
  );
}
