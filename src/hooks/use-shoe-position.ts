import { useEffect, useState } from "react";

interface Position {
  x: number;
  y: number;
}

/**
 * Hook to get the position of the shoe display element.
 * Returns the center coordinates of the shoe for card dealing animations.
 */
export function useShoePosition(): Position | null {
  const [position, setPosition] = useState<Position | null>(null);

  useEffect(() => {
    const updatePosition = () => {
      const shoeElement = document.querySelector('[data-shoe-display="true"]');
      if (shoeElement) {
        const rect = shoeElement.getBoundingClientRect();
        // Get center point of the shoe for card origin
        setPosition({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      }
    };

    // Initial position
    updatePosition();

    // Update on resize
    window.addEventListener("resize", updatePosition);

    // Use MutationObserver to detect when shoe element is added/removed
    const observer = new MutationObserver(updatePosition);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      window.removeEventListener("resize", updatePosition);
      observer.disconnect();
    };
  }, []);

  return position;
}
