/**
 * Reusable utility to render an image onto a Canvas element with copy protection and watermark.
 *
 * @param {HTMLCanvasElement|string} canvasOrId - The canvas element reference or its element ID
 * @param {string} imageUrl - The source URL of the image
 * @param {Object} [options={}] - Optional config object for watermark settings
 * @param {string} [options.watermarkText="© Jewels India"] - Custom watermark text
 * @param {string} [options.font="13px sans-serif"] - Watermark font face and size
 * @param {string} [options.color="rgba(255, 255, 255, 0.40)"] - Watermark color with transparency
 * @returns {Function} cleanup - Cleanup function to remove event listeners on component unmount
 */
export function renderProtectedImage(canvasOrId, imageUrl, options = {}) {
  const canvas = typeof canvasOrId === "string" ? document.getElementById(canvasOrId) : canvasOrId;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let active = true;

  if (!imageUrl) {
    // If no URL is provided, clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }

  const img = new Image();
  // Enable CORS handling to prevent tainted canvas errors when downloading from S3/CDN
  img.crossOrigin = "anonymous";
  img.src = imageUrl;

  const draw = () => {
    if (!active) return;

    // Get display boundaries (CSS pixels)
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      // If the canvas is not yet rendered, wait for the next frame
      requestAnimationFrame(draw);
      return;
    }

    // Adapt to high-DPI (Retina) screens for sharp image and text rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    // Clear previous render
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // Scale coordinate space to match CSS pixels
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    // 1. Draw the actual product image using "contain" fit
    if (img.complete && img.naturalWidth && img.naturalHeight) {
      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;
      const ratio = Math.min(w / imgWidth, h / imgHeight);
      const newWidth = imgWidth * ratio;
      const newHeight = imgHeight * ratio;
      const dx = (w - newWidth) / 2;
      const dy = (h - newHeight) / 2;

      ctx.drawImage(img, dx, dy, newWidth, newHeight);
    }

    // 2. Draw the required watermark layer
    const watermarkText = options.watermarkText || "© Jewels India";
    const font = options.font || "13px sans-serif";
    const color = options.color || "rgba(255, 255, 255, 0.40)";

    ctx.font = font;
    ctx.fillStyle = color;

    // Burn a subtle dark shadow behind text for clear visibility on both light and dark images
    ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;

    // Position at bottom-right with 12px padding
    const textWidth = ctx.measureText(watermarkText).width;
    const padding = 12;
    const x = w - textWidth - padding;
    const y = h - padding;

    ctx.fillText(watermarkText, x, y);
    ctx.restore();
  };

  // Handle image load errors
  img.onerror = (e) => {
    if (options.onError) {
      options.onError(e);
    }
  };

  // Redraw when the image loads
  img.onload = () => {
    draw();
    if (options.onLoad) {
      options.onLoad();
    }
  };

  // If the image was cached and is already complete, draw immediately
  if (img.complete) {
    draw();
    if (options.onLoad) {
      options.onLoad();
    }
  }

  // Handle window resizing dynamically (re-renders to fit new aspect ratios)
  const handleResize = () => {
    draw();
  };
  window.addEventListener("resize", handleResize);

  // Return cleanup function to remove event listeners on unmount
  return () => {
    active = false;
    window.removeEventListener("resize", handleResize);
  };
}
