"use client";

import { useCallback, useRef, useState } from "react";

export default function useLongPress({
  onLongPress,
  onClick,
  delay = 500,
} = {}) {
  const [isPressing, setIsPressing] = useState(false);
  const timerRef = useRef(null);
  const isLongPressRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });

  const start = useCallback((event) => {
    // Prevent double invocation on hybrid devices (mousedown + touchstart)
    if (event.type === "mousedown" && "ontouchstart" in window) {
      return;
    }

    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    startPosRef.current = { x: clientX, y: clientY };

    isLongPressRef.current = false;
    setIsPressing(true);

    timerRef.current = setTimeout(() => {
      onLongPress(event);
      isLongPressRef.current = true;
      setIsPressing(false);
      if (window.navigator?.vibrate) {
        window.navigator.vibrate(50);
      }
    }, delay);
  }, [onLongPress, delay]);

  const cancel = useCallback((event, isRelease = false) => {
    let wasActive = false;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      wasActive = true;
    }

    setIsPressing(false);

    if (isRelease && wasActive && !isLongPressRef.current) {
      if (onClick) {
        onClick(event);
      }
    }
  }, [onClick]);

  const handleMove = useCallback((event) => {
    if (!timerRef.current) return;

    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;

    const deltaX = Math.abs(clientX - startPosRef.current.x);
    const deltaY = Math.abs(clientY - startPosRef.current.y);

    // Cancel if moved more than 10px (e.g. scroll or drag)
    if (deltaX > 10 || deltaY > 10) {
      cancel(event);
    }
  }, [cancel]);

  return {
    onMouseDown: start,
    onTouchStart: start,
    onMouseUp: (e) => cancel(e, true),
    onTouchEnd: (e) => cancel(e, true),
    onMouseMove: handleMove,
    onTouchMove: handleMove,
    onMouseLeave: (e) => cancel(e),
    isPressing,
  };
}
