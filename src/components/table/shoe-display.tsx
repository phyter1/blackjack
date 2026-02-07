"use client";

import { MiniCardBack } from "../mini-card-back";
import { selectCardScale, useSettingsStore } from "@/stores/settings";

interface ShoeDisplayProps {
  remainingCards: number;
  totalCards: number;
  cutCardPosition: number;
  penetration: number;
  isComplete: boolean;
}

export function ShoeDisplay({
  remainingCards,
  totalCards,
  cutCardPosition,
  isComplete,
}: ShoeDisplayProps) {
  const cardScale = useSettingsStore(selectCardScale);

  // Calculate deck count and proportional sizing
  // Formula: 42px base + 26px per deck for responsive height scaling
  const deckCount = Math.round(totalCards / 52);
  const containerHeight = 42 + deckCount * 26;

  // Calculate percentages for visual representation
  const remainingPercentage = (remainingCards / totalCards) * 100;
  const cutCardPercentage = (cutCardPosition / totalCards) * 100;

  // Determine proximity to cut card for visual warnings
  const nearCutCard = remainingPercentage <= cutCardPercentage + 5;
  const atCutCard = isComplete;

  // Calculate card layers - use smaller groups for more granular animation
  // Each layer represents 3-4 cards for smoother visual changes
  const cardsPerLayer = 4;
  const maxVisibleLayers = Math.ceil(totalCards / cardsPerLayer); // ~78 layers for 312 cards
  const currentLayers = Math.ceil(remainingCards / cardsPerLayer);

  // Calculate cut card layer position from the bottom of current stack
  // cutCardPosition is the number of cards remaining when cut card is reached
  // We need to find which layer from the bottom of the current stack
  const cutCardLayer =
    currentLayers - Math.ceil(cutCardPosition / cardsPerLayer);

  return (
    <div
      className="fixed right-4 top-1/2 -translate-y-1/2 z-20"
      data-shoe-display="true"
      style={{ transform: `translateY(-50%) scale(${cardScale / 100})`, transformOrigin: "center" }}
    >
      <div className="flex flex-col items-center gap-2">
        {/* Shoe label */}
        <div
          className="text-xs font-semibold tracking-wider"
          style={{ color: "var(--theme-accent)" }}
        >
          SHOE
        </div>

        {/* Shoe container with stacked cards */}
        <div
          className="relative w-20"
          style={{ height: `${containerHeight}px` }}
        >
          {/* Shoe base/holder */}
          <div
            className="absolute inset-0 rounded-lg border-2 shadow-lg"
            style={{
              background: `linear-gradient(to bottom, var(--theme-table-edge), var(--theme-secondary))`,
              borderColor: "var(--theme-table-edge-accent)",
            }}
          />

          {/* Stacked cards visualization - from top down */}
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 w-16"
            style={{ height: `calc(${containerHeight}px - 1rem)` }}
          >
            {Array.from({ length: maxVisibleLayers }).map((_, index) => {
              // Only show cards that are still in the shoe
              if (index >= currentLayers) return null;

              // Calculate position from top (cards stack downward)
              const cardIndex = index;
              const isCutCard = cardIndex === cutCardLayer;

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
                    top: `${baseOffset}px`,
                    zIndex: maxVisibleLayers - cardIndex,
                    opacity: Math.max(0.8, 1 - cardIndex * 0.003), // Slight fade for depth
                  }}
                >
                  {/* Use MiniCardBack component for actual design */}
                  <MiniCardBack className="w-full h-full" />

                  {/* Cut card marker */}
                  {isCutCard && (
                    <>
                      {/* Yellow indicator on the card itself */}
                      <div
                        className={`absolute inset-0 border-2 border-yellow-400 rounded-sm ${nearCutCard ? "animate-pulse" : ""}`}
                      />

                      {/* Arrow pointing to cut card */}
                      <div className="absolute -right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <div className="w-2 h-2 bg-yellow-400 rotate-45" />
                        {nearCutCard && (
                          <div className="text-[8px] font-bold text-yellow-400 whitespace-nowrap">
                            CUT
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Shuffle warning overlay */}
          {isComplete && (
            <div className="absolute inset-0 bg-red-900/20 backdrop-blur-[1px] rounded-lg flex items-center justify-center animate-in fade-in duration-500">
              <div className="text-red-400 text-xs font-bold rotate-[-90deg] whitespace-nowrap">
                SHUFFLE
              </div>
            </div>
          )}

          {/* Warning color overlay (replaces CSS filters) */}
          {nearCutCard && !atCutCard && (
            <div
              className="absolute inset-0 pointer-events-none rounded-lg"
              style={{
                background: "linear-gradient(180deg, rgba(250,204,21,0.1) 0%, transparent 100%)",
              }}
            />
          )}
        </div>

        {/* Card count display */}
        <div className="flex flex-col items-center gap-1 text-center">
          <div
            className={`text-xl font-bold transition-all duration-300 ${
              atCutCard ? "scale-110" : ""
            }`}
            style={{
              color: atCutCard
                ? "var(--theme-error)"
                : nearCutCard
                  ? "var(--theme-warning)"
                  : "var(--theme-text-primary)",
            }}
          >
            {remainingCards}
          </div>
          <div
            className="text-[10px] leading-tight transition-colors duration-300"
            style={{
              color: atCutCard
                ? "var(--theme-error)"
                : nearCutCard
                  ? "var(--theme-warning)"
                  : "var(--theme-text-muted)",
            }}
          >
            cards
            <br />
            left
          </div>
        </div>

        {/* Warning indicators */}
        {nearCutCard && !atCutCard && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-400 rounded-full" />
            <div className="text-[9px] text-yellow-400 font-semibold">
              NEAR CUT
            </div>
          </div>
        )}

        {/* Reshuffle warning when at cut card */}
        {atCutCard && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <div className="text-[9px] text-red-400 font-semibold">
              RESHUFFLE
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
