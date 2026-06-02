"use client";

import { useEffect, useRef } from "react";
import { renderProtectedImage } from "../../lib/utils/imageProtection";

/**
 * Reusable React Component for rendering copy-protected images using HTML5 Canvas.
 * Prevents context menus, drag-to-save, and keyboard print/save shortcuts (Ctrl+S, Cmd+S).
 *
 * @param {Object} props
 * @param {string} props.src - Source image URL
 * @param {number|string} [props.width] - Optional layout width
 * @param {number|string} [props.height] - Optional layout height
 * @param {string} [props.className=""] - Additional CSS classes
 * @param {string} [props.alt="Protected jewelry piece"] - Alt text (aria-label) for accessibility
 */
export default function ProtectedImage({
  src,
  width,
  height,
  className = "",
  alt = "Protected jewelry piece",
  onLoad,
  onError,
  style = {},
}) {
  const canvasRef = useRef(null);

  // 1. Local Canvas Rendering & Element Protections
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !src) return;

    // Trigger canvas image drawing and resize tracking
    const cleanupProtectedImage = renderProtectedImage(canvas, src, { onLoad, onError });

    // Prevent context menu (right click) specifically on the canvas element
    const preventCanvasContextMenu = (e) => {
      e.preventDefault();
    };
    canvas.addEventListener("contextmenu", preventCanvasContextMenu);

    return () => {
      cleanupProtectedImage?.();
      if (canvas) {
        canvas.removeEventListener("contextmenu", preventCanvasContextMenu);
      }
    };
  }, [src]);

  // 2. Page-level protections (Active while any ProtectedImage is mounted)
  useEffect(() => {
    // Prevent right-clicks globally on the entire page
    const preventGlobalContextMenu = (e) => {
      e.preventDefault();
    };
    document.addEventListener("contextmenu", preventGlobalContextMenu);

    // Prevent save shortcut keys: Ctrl+S, Cmd+S, Ctrl+Shift+S, Cmd+Shift+S
    const handleKeyDown = (e) => {
      const isS = e.key === "s" || e.key === "S";
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (isCmdOrCtrl && isS) {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", preventGlobalContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`protected-image ${className}`}
      role="img"
      aria-label={alt}
      draggable="false"
      style={{
        userSelect: "none",
        WebkitUserDrag: "none",
        touchCallout: "none",
        ...((width || height) ? {
          width: width ? `${width}px` : "auto",
          height: height ? `${height}px` : "auto",
        } : {}),
        ...style
      }}
    />
  );
}
