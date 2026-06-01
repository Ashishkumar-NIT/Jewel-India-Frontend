"use client";

import { useEffect, useRef, useState } from "react";

export default function FullImageViewer({
  isOpen,
  onClose,
  images = [],
  activeIndex = 0,
  onChangeIndex,
}) {
  const [index, setIndex] = useState(activeIndex);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Gesture references
  const touchStart = useRef({ x: 0, y: 0 });
  const lastTouchTime = useRef(0);
  const dragStart = useRef({ x: 0, y: 0 });
  const initialPinchDist = useRef(0);
  const initialZoom = useRef(1);
  const containerRef = useRef(null);

  // Sync index from parent modal on open
  useEffect(() => {
    if (isOpen) {
      setIndex(activeIndex);
      resetZoom();
    }
  }, [isOpen, activeIndex]);

  // Lock document body scroll while full image viewer is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Keyboard navigation fallback
  useEffect(() => {
    if (!isOpen || !images || images.length === 0) return;
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") handlePrev();
      else if (e.key === "ArrowRight") handleNext();
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, index, images]);

  if (!isOpen || !images || images.length === 0) return null;

  const currentImageUrl = images[index];

  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    const newIdx = index === 0 ? images.length - 1 : index - 1;
    setIndex(newIdx);
    if (onChangeIndex) onChangeIndex(newIdx);
    resetZoom();
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    const newIdx = index === images.length - 1 ? 0 : index + 1;
    setIndex(newIdx);
    if (onChangeIndex) onChangeIndex(newIdx);
    resetZoom();
  };



  // ── Touch Gesture Handlers (Tablet / Mobile) ──────────────────────────────
  const handleTouchStart = (e) => {
    const touches = e.touches;

    if (touches.length === 1) {
      // Single Finger Touch (Swipe / Pan)
      touchStart.current = { x: touches[0].clientX, y: touches[0].clientY };
      
      // If zoomed, start dragging/panning
      if (zoom > 1) {
        setIsDragging(true);
        dragStart.current = { x: touches[0].clientX - pan.x, y: touches[0].clientY - pan.y };
      }
    } else if (touches.length === 2) {
      // Double Finger Touch (Pinch-to-zoom)
      e.preventDefault();
      setIsDragging(false);
      const dist = Math.hypot(
        touches[0].clientX - touches[1].clientX,
        touches[0].clientY - touches[1].clientY
      );
      initialPinchDist.current = dist;
      initialZoom.current = zoom;
    }
  };

  const handleTouchMove = (e) => {
    const touches = e.touches;

    if (touches.length === 1) {
      if (zoom > 1 && isDragging) {
        // Pan the image while zoomed
        const dx = touches[0].clientX - dragStart.current.x;
        const dy = touches[0].clientY - dragStart.current.y;
        
        // Bounds limit for panning (based on scale)
        const maxPanX = (zoom - 1) * 200;
        const maxPanY = (zoom - 1) * 200;
        setPan({
          x: Math.max(-maxPanX, Math.min(maxPanX, dx)),
          y: Math.max(-maxPanY, Math.min(maxPanY, dy)),
        });
      }
    } else if (touches.length === 2 && initialPinchDist.current > 0) {
      // Pinch Zoom processing
      e.preventDefault();
      const currentDist = Math.hypot(
        touches[0].clientX - touches[1].clientX,
        touches[0].clientY - touches[1].clientY
      );
      const factor = currentDist / initialPinchDist.current;
      const targetScale = Math.max(1, Math.min(4, initialZoom.current * factor));
      setZoom(targetScale);
      
      if (targetScale === 1) {
        setPan({ x: 0, y: 0 });
      }
    }
  };

  const handleTouchEnd = (e) => {
    setIsDragging(false);
    initialPinchDist.current = 0;

    // Handle single touch endings (Swipes)
    if (e.changedTouches.length === 1 && zoom === 1) {
      const deltaX = e.changedTouches[0].clientX - touchStart.current.x;
      const deltaY = e.changedTouches[0].clientY - touchStart.current.y;

      // Ensure it is primarily a horizontal swipe and exceeds gesture threshold
      if (Math.abs(deltaX) > 60 && Math.abs(deltaY) < 40) {
        if (deltaX > 0) {
          handlePrev();
        } else {
          handleNext();
        }
      }
    }
  };

  // ── Double Tap Handler (Tablet-first Zoom) ──────────────────────────────────
  const handleDoubleTap = (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTouchTime.current;
    
    if (tapLength < 300 && tapLength > 0) {
      e.preventDefault();
      if (zoom > 1) {
        resetZoom();
      } else {
        // Zoom in on tap location
        setZoom(2.5);
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || rect.width / 2;
          const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || rect.height / 2;
          
          const xPercent = (clientX - rect.left) / rect.width;
          const yPercent = (clientY - rect.top) / rect.height;
          
          setPan({
            x: (0.5 - xPercent) * 300,
            y: (0.5 - yPercent) * 300
          });
        }
      }
    }
    lastTouchTime.current = currentTime;
  };

  // ── Desktop Mouse Interactions (Hover Zoom / Panning fallback) ────────────
  const handleMouseMove = (e) => {
    if (zoom > 1 && e.buttons === 1) {
      // Drag panning with mouse click while zoomed
      e.preventDefault();
      if (!isDragging) {
        setIsDragging(true);
        dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      } else {
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        const maxPanX = (zoom - 1) * 200;
        const maxPanY = (zoom - 1) * 200;
        setPan({
          x: Math.max(-maxPanX, Math.min(maxPanX, dx)),
          y: Math.max(-maxPanY, Math.min(maxPanY, dy)),
        });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-xl flex flex-col justify-between select-none overflow-hidden transition-all duration-300 ease-out"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── HEADER ── */}
      <header className="w-full flex items-center justify-between px-6 py-6 pointer-events-none z-[310]">
        {/* Finger-friendly back/close button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="pointer-events-auto flex items-center justify-center gap-2.5 px-5 py-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 backdrop-blur-md shadow-lg transition-all duration-200 active:scale-95 text-white text-[14px] font-medium"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </button>

        {/* Dynamic product counter */}
        <div className="px-4 py-2 rounded-full bg-white/5 border border-white/5 backdrop-blur-md text-[13px] text-white/60 tracking-wider">
          {index + 1} / {images.length}
        </div>
      </header>

      {/* ── MAIN PRODUCT VIEWER AREA ── */}
      <div 
        className="flex-1 w-full flex items-center justify-center relative overflow-hidden px-4 md:px-12"
        onClick={(e) => {
          e.stopPropagation();
          // Double-tap or simple tap resets/zooms
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        {/* Navigation Chevron — Left */}
        <button
          onClick={handlePrev}
          className="absolute left-6 md:left-10 w-14 h-14 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white transition-all shadow-lg active:scale-90 z-[320]"
          aria-label="Previous Image"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Large Main Product Image Container */}
        <div
          className="relative max-w-full max-h-[60vh] md:max-h-[65vh] aspect-square flex items-center justify-center z-[310] transition-transform duration-200 ease-out"
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            cursor: zoom > 1 ? "grab" : "zoom-in",
          }}
          onClick={handleDoubleTap}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseDown={(e) => {
            if (e.detail === 2) handleDoubleTap(e);
          }}
        >
          {currentImageUrl ? (
            <img
              src={currentImageUrl}
              alt="Jewelry artwork details"
              className="max-w-full max-h-full object-contain pointer-events-none drop-shadow-[0_10px_30px_rgba(255,255,255,0.05)] transition-all duration-300"
            />
          ) : (
            <div className="text-white/40 text-[14px]">Loading Premium Design...</div>
          )}
        </div>

        {/* Navigation Chevron — Right */}
        <button
          onClick={handleNext}
          className="absolute right-6 md:right-10 w-14 h-14 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white transition-all shadow-lg active:scale-90 z-[320]"
          aria-label="Next Image"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* ── ZOOM SLIDER OVERLAY (Bottom Right for Tablet UX) ── */}
        <div 
          className="absolute bottom-4 right-6 md:right-12 bg-black/40 border border-white/10 backdrop-blur-md px-4 py-3 rounded-full flex items-center gap-3 shadow-2xl z-[320] pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              const nextScale = Math.max(1, zoom - 0.5);
              setZoom(nextScale);
              if (nextScale === 1) setPan({ x: 0, y: 0 });
            }}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white text-lg font-bold"
          >
            −
          </button>
          
          <input
            type="range"
            min="1"
            max="4"
            step="0.1"
            value={zoom}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setZoom(val);
              if (val === 1) setPan({ x: 0, y: 0 });
            }}
            className="w-[120px] h-[3px] bg-white/20 accent-white rounded-lg appearance-none cursor-pointer"
          />

          <button
            onClick={() => setZoom(Math.min(4, zoom + 0.5))}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white text-lg font-bold"
          >
            +
          </button>
          
          <span className="text-[11px] text-white/70 font-semibold min-w-[28px] text-right">
            {zoom.toFixed(1)}x
          </span>
        </div>
      </div>

      {/* ── FOOTER: Large Thumbnails strip ── */}
      <footer 
        className="w-full flex justify-center py-6 px-6 bg-gradient-to-t from-black/60 to-transparent z-[310]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-4.5 overflow-x-auto py-2 scrollbar-hide max-w-full px-4">
          {images.map((imgUrl, idx) => {
            const isActive = idx === index;
            return (
              <button
                key={idx}
                onClick={() => {
                  setIndex(idx);
                  if (onChangeIndex) onChangeIndex(idx);
                  resetZoom();
                }}
                className={`relative shrink-0 w-[72px] h-[72px] rounded-[12px] bg-[#222] overflow-hidden transition-all duration-300 border-[2.5px] ${
                  isActive
                    ? "border-white scale-105 shadow-2xl opacity-100"
                    : "border-transparent opacity-45 hover:opacity-80 active:scale-95"
                }`}
                aria-label={`Thumbnail ${idx + 1}`}
              >
                <img
                  src={imgUrl}
                  alt={`Thumb ${idx}`}
                  className="w-full h-full object-cover pointer-events-none"
                />
              </button>
            );
          })}
        </div>
      </footer>
    </div>
  );
}
