"use client";

import { useEffect, useState } from "react";

/**
 * Hook to determine maximum playable hands based on viewport size
 * Returns the appropriate hand limit for the current viewport
 */
export function useViewportHandLimit(ruleMaxHands = 5): number {
  const [maxHands, setMaxHands] = useState(ruleMaxHands);

  useEffect(() => {
    const updateHandLimit = () => {
      const width = window.innerWidth;

      // Mobile portrait - 1 hand only
      if (width < 640) {
        setMaxHands(1);
      }
      // Mobile landscape / Tablet portrait - 3 hands max
      else if (width < 1024) {
        setMaxHands(Math.min(3, ruleMaxHands));
      }
      // Desktop - use rule max (up to 5)
      else {
        setMaxHands(ruleMaxHands);
      }
    };

    // Set initial value
    updateHandLimit();

    // Update on resize
    window.addEventListener("resize", updateHandLimit);
    return () => window.removeEventListener("resize", updateHandLimit);
  }, [ruleMaxHands]);

  return maxHands;
}
