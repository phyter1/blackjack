"use client";

import { MiniCardBack } from "../mini-card-back";
import { selectCardScale, useSettingsStore } from "@/stores/settings";

interface DiscardTrayProps {
  discardedCards: number;
  totalCards: number;
}

export function DiscardTray({ discardedCards, totalCards }: DiscardTrayProps) {
  const cardScale = useSettingsStore(selectCardScale);

  // Calculate deck count and proportional sizing (matching shoe)
  const deckCount = Math.round(totalCards / 52);

  const deckHeights = {
    1: 68,
    2: 94,
    4: 146,
    6: 198,
    8: 250,
  };
  const containerHeight = deckHeights[deckCount as keyof typeof deckHeights];

  // Calculate card layers - use same sizing as shoe
  const cardsPerLayer = 4;
  const maxVisibleLayers = Math.ceil(totalCards / cardsPerLayer);
  const discardedLayers = Math.ceil(discardedCards / cardsPerLayer);

  return (
    <div
      className="fixed left-4 top-1/2 -translate-y-1/2 z-20"
      style={{ transform: `translateY(-50%) scale(${cardScale / 100})`, transformOrigin: "center" }}
    >
      <div className="flex flex-col items-center gap-2">
        {/* Discard tray label */}
        <div
          className="text-xs font-semibold tracking-wider"
          style={{ color: "var(--theme-accent)" }}
        >
          DISCARD
        </div>

        {/* Discard tray container with stacked cards */}
        <div
          className="relative w-20"
          style={{ height: `${containerHeight}px` }}
        >
          {/* Tray base/holder */}
          <div
            className="absolute inset-0 rounded-lg border-2 shadow-lg"
            style={{
              background: `linear-gradient(to bottom, var(--theme-table-edge), var(--theme-secondary))`,
              borderColor: "var(--theme-table-edge-accent)",
            }}
          />

          {/* Stacked discarded cards visualization - from bottom up */}
          <div
            className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16"
            style={{
              height: `calc(${containerHeight}px - 1rem)`,
              transform: "perspective(1000px) rotateX(-5deg)",
            }}
          >
            {Array.from({ length: maxVisibleLayers }).map((_, index) => {
              // Only show cards that have been discarded
              if (index >= discardedLayers) return null;

              // Calculate position from bottom (cards stack upward)
              const cardIndex = index;

              // Calculate vertical offset (stacked effect)
              // Use dynamic spacing: more layers = tighter stacking
              const totalHeight = containerHeight - 16; // Available height in px (container minus padding)
              const spacing = Math.min(2, totalHeight / maxVisibleLayers); // Dynamic spacing
              const baseOffset = cardIndex * spacing;

              return (
                <div
                  key={index}
                  className="absolute left-0 right-0 h-5 transition-all duration-500 ease-out overflow-hidden rounded-sm"
                  style={{
                    bottom: `${baseOffset}px`,
                    zIndex: cardIndex,
                    opacity: Math.max(0.8, 1 - cardIndex * 0.003), // Slight fade for depth
                  }}
                >
                  {/* Use MiniCardBack component for actual design */}
                  <MiniCardBack className="w-full h-full" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Card count display - animated */}
        <div className="flex flex-col items-center gap-1 text-center">
          <div
            className="text-xl font-bold transition-all duration-300"
            style={{ color: "var(--theme-text-primary)" }}
          >
            {discardedCards}
          </div>
          <div
            className="text-[10px] leading-tight"
            style={{ color: "var(--theme-text-muted)" }}
          >
            cards
            <br />
            dealt
          </div>
        </div>
      </div>
    </div>
  );
}
