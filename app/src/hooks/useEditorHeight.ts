import React, { useState, useEffect, useRef, useCallback } from "react";

interface EditorHeightResult {
  editorHeight: number;
  editorContainerRef: React.RefObject<HTMLDivElement>;
  setEditorHeight: (height: number) => void;
  recalculateHeight: () => void;
}

/**
 * Custom hook to calculate dynamic editor height based on available viewport space
 * Supports both automatic calculation and manual override (for user resizing)
 * @param minHeight - Minimum height for the editor (default: 300)
 * @param bottomOffset - extra padding at the bottom of viewport (default: 100)
 * @returns Calculated height, ref, and methods to update height
 */
export const useEditorHeight = (minHeight: number = 300, bottomOffset: number = 100): EditorHeightResult => {
  const [editorHeight, setEditorHeight] = useState<number>(minHeight);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const userManuallyResized = useRef<boolean>(false);
  const manualHeight = useRef<number | null>(null);

  const calculateHeight = useCallback(() => {
    // If user manually resized, don't auto-calculate
    if (userManuallyResized.current && manualHeight.current !== null) {
      setEditorHeight(manualHeight.current);
      return;
    }

    if (!editorContainerRef.current) return;

    const rect = editorContainerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // Calculate available space from editor position to bottom of viewport
    const availableHeight = viewportHeight - rect.top - bottomOffset;

    // Use the larger of minHeight or availableHeight, but cap at a reasonable max
    const calculatedHeight = Math.max(minHeight, Math.min(availableHeight, viewportHeight * 0.7));

    setEditorHeight(calculatedHeight);
  }, [minHeight, bottomOffset]);

  // Method to set height manually (when user resizes)
  const setManualHeight = useCallback((height: number) => {
    userManuallyResized.current = true;
    manualHeight.current = height;
    setEditorHeight(height);
  }, []);

  // Method to force recalculation (reset manual override)
  const recalculateHeight = useCallback(() => {
    userManuallyResized.current = false;
    manualHeight.current = null;
    calculateHeight();
  }, [calculateHeight]);

  useEffect(() => {
    // Debounced version for resize events
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const debouncedCalculate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(calculateHeight, 150);
    };

    // Initial calculation after DOM settles
    requestAnimationFrame(calculateHeight);

    // Recalculate on window resize (debounced)
    window.addEventListener("resize", debouncedCalculate);

    // Use ResizeObserver to detect changes in parent containers
    const resizeObserver = new ResizeObserver(debouncedCalculate);
    if (editorContainerRef.current) {
      resizeObserver.observe(editorContainerRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", debouncedCalculate);
      resizeObserver.disconnect();
    };
  }, [calculateHeight]);

  return {
    editorHeight,
    editorContainerRef,
    setEditorHeight: setManualHeight,
    recalculateHeight,
  };
};
